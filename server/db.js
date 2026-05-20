const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let useLocalDb = process.env.USE_LOCAL_DB === 'true';
const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readLocalFile(modelName) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${modelName}.json`);
    if (!fs.existsSync(filePath)) {
        // If file doesn't exist, we can pre-populate if needed.
        // For User, we will seed a default Admin user so they can test immediately.
        if (modelName === 'User') {
            const adminPasswordHash = bcrypt.hashSync('password123', 10);
            const defaultAdmin = {
                _id: 'admin_user_id_2026',
                name: 'Admin User',
                email: '04324205191008@uits.edu.bd',
                password: adminPasswordHash,
                role: 'Admin',
                createdAt: new Date().toISOString()
            };
            const initialData = [defaultAdmin];
            fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
            return initialData;
        }
        return [];
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`Error reading local database file ${modelName}.json:`, e);
        return [];
    }
}

function writeLocalFile(modelName, data) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${modelName}.json`);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error(`Error writing local database file ${modelName}.json:`, e);
    }
}

function matchQuery(item, query) {
    if (!query) return true;
    return Object.keys(query).every(key => {
        // Support matching strings and ObjectIds
        return String(item[key]) === String(query[key]);
    });
}

class LocalQuery {
    constructor(data, modelName) {
        this.data = data;
        this.modelName = modelName;
    }

    sort(sortObj) {
        if (!sortObj) return this;
        const keys = Object.keys(sortObj);
        this.data.sort((a, b) => {
            for (let key of keys) {
                const val = sortObj[key];
                let aVal = a[key];
                let bVal = b[key];
                if (aVal instanceof Date) aVal = aVal.getTime();
                if (bVal instanceof Date) bVal = bVal.getTime();
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                if (aVal < bVal) return val === -1 ? 1 : -1;
                if (aVal > bVal) return val === -1 ? -1 : 1;
            }
            return 0;
        });
        return this;
    }

    select(selectStr) {
        if (!selectStr) return this;
        const exclusions = [];
        const inclusions = [];
        selectStr.split(' ').forEach(f => {
            if (f.startsWith('-')) {
                exclusions.push(f.substring(1));
            } else if (f) {
                inclusions.push(f);
            }
        });
        this.data = this.data.map(item => {
            if (exclusions.length > 0) {
                exclusions.forEach(f => delete item[f]);
            } else if (inclusions.length > 0) {
                Object.keys(item).forEach(k => {
                    if (k !== '_id' && !k.startsWith('_') && typeof item[k] !== 'function' && !inclusions.includes(k)) {
                        delete item[k];
                    }
                });
            }
            return item;
        });
        return this;
    }

    populate(pathField, selectFields) {
        if (!pathField) return this;
        this.data = this.data.map(item => {
            const refId = item[pathField];
            if (refId) {
                // Find matching user in local storage
                const users = readLocalFile('User');
                const user = users.find(u => String(u._id) === String(refId));
                if (user) {
                    const userCopy = { ...user };
                    delete userCopy.password;
                    if (selectFields) {
                        const fields = selectFields.split(' ');
                        const filtered = { _id: userCopy._id };
                        fields.forEach(f => {
                            if (f && userCopy[f] !== undefined) {
                                filtered[f] = userCopy[f];
                            }
                        });
                        item[pathField] = filtered;
                    } else {
                        item[pathField] = userCopy;
                    }
                }
            }
            return item;
        });
        return this;
    }

    async then(resolve, reject) {
        try {
            resolve(this.data);
        } catch (e) {
            reject(e);
        }
    }
}

class CustomSchema {
    constructor(definition) {
        this.definition = definition;
        this.methods = {};
        this._preSave = null;
    }

    pre(hookName, fn) {
        if (hookName === 'save') {
            this._preSave = fn;
        }
    }
}
CustomSchema.Types = {
    ObjectId: 'ObjectId'
};

const registeredModels = {};

function castFields(schema, data) {
    if (!schema || !schema.definition || !data) return data;
    const casted = { ...data };
    for (let key of Object.keys(schema.definition)) {
        const rules = schema.definition[key];
        let fieldType = rules;
        if (rules && typeof rules === 'object' && rules.type) {
            fieldType = rules.type;
        }
        if (fieldType === Date && casted[key]) {
            casted[key] = new Date(casted[key]);
        }
    }
    return casted;
}

function createModelWrapper(name, schema, realModel) {
    class Wrapper {
        constructor(data, isNew = true) {
            this._isNew = isNew;
            if (useLocalDb) {
                const casted = castFields(schema, data);
                Object.assign(this, casted);
                if (!this._id) {
                    this._id = 'id_' + Math.random().toString(36).substr(2, 9);
                    this._isNew = true;
                } else {
                    // If it was instantiated with an ID, check if it's actually new
                    const items = readLocalFile(name);
                    const exists = items.some(item => String(item._id) === String(data._id));
                    this._isNew = !exists;
                }
                if (!this.createdAt) {
                    this.createdAt = new Date().toISOString();
                }
                if (schema && schema.methods) {
                    for (let methodName of Object.keys(schema.methods)) {
                        this[methodName] = schema.methods[methodName].bind(this);
                    }
                }
            } else {
                this._realInstance = new realModel(data);
                return new Proxy(this, {
                    get: (target, prop) => {
                        if (prop === 'save') {
                            return () => target._realInstance.save();
                        }
                        if (prop === 'comparePassword') {
                            return (candidate) => target._realInstance.comparePassword(candidate);
                        }
                        if (prop === 'isModified') {
                            return (path) => target._realInstance.isModified(path);
                        }
                        return target._realInstance[prop];
                    },
                    set: (target, prop, value) => {
                        target._realInstance[prop] = value;
                        return true;
                    }
                });
            }
        }

        isModified(path) {
            return this._isNew;
        }

        async save() {
            if (!useLocalDb) {
                return this._realInstance.save();
            }

            if (schema && schema._preSave) {
                await new Promise((resolve, reject) => {
                    schema._preSave.call(this, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            const items = readLocalFile(name);
            const index = items.findIndex(item => String(item._id) === String(this._id));

            if (name === 'User') {
                const emailExists = items.some(item => 
                    String(item._id) !== String(this._id) && item.email === this.email
                );
                if (emailExists) {
                    const err = new Error('ValidationError: Email already exists');
                    err.name = 'ValidationError';
                    throw err;
                }
            }

            const plainData = {};
            Object.keys(this).forEach(k => {
                if (typeof this[k] !== 'function' && !k.startsWith('_')) {
                    plainData[k] = this[k];
                }
            });
            plainData._id = this._id;
            plainData.createdAt = this.createdAt;

            if (index >= 0) {
                items[index] = plainData;
            } else {
                items.push(plainData);
            }
            writeLocalFile(name, items);
            this._isNew = false;
            return this;
        }

        // Static Methods
        static find(query) {
            if (useLocalDb) {
                const items = readLocalFile(name);
                const filtered = query ? items.filter(item => matchQuery(item, query)) : items;
                const wrapped = filtered.map(item => new Wrapper(item, false));
                return new LocalQuery(wrapped, name);
            }
            return realModel.find(query);
        }

        static async findOne(query) {
            if (useLocalDb) {
                const items = readLocalFile(name);
                const found = items.find(item => matchQuery(item, query));
                if (!found) return null;
                return new Wrapper(found, false);
            }
            return realModel.findOne(query);
        }

        static async findById(id) {
            if (useLocalDb) {
                const items = readLocalFile(name);
                const found = items.find(item => String(item._id) === String(id));
                if (!found) return null;
                return new Wrapper(found, false);
            }
            return realModel.findById(id);
        }

        static async findByIdAndDelete(id) {
            if (useLocalDb) {
                const items = readLocalFile(name);
                const index = items.findIndex(item => String(item._id) === String(id));
                if (index < 0) return null;
                const removed = items.splice(index, 1)[0];
                writeLocalFile(name, items);
                return new Wrapper(removed, false);
            }
            return realModel.findByIdAndDelete(id);
        }

        static async findByIdAndUpdate(id, update, options) {
            if (useLocalDb) {
                const items = readLocalFile(name);
                const index = items.findIndex(item => String(item._id) === String(id));
                if (index < 0) return null;

                const updatedItem = { ...items[index] };
                const updatePayload = update.$set || update;
                Object.assign(updatedItem, updatePayload);

                items[index] = updatedItem;
                writeLocalFile(name, items);
                return new Wrapper(updatedItem, false);
            }
            return realModel.findByIdAndUpdate(id, update, options);
        }
    }
    return Wrapper;
}

const db = {
    connection: {
        get readyState() {
            if (useLocalDb) return 1; // Simulated connected state
            return mongoose.connection.readyState;
        }
    },
    Schema: CustomSchema,
    Types: mongoose.Types,
    
    connect: async function(uri, options) {
        if (useLocalDb) {
            console.log('Forcing local database mode via environment configuration.');
            return;
        }
        try {
            // Try connecting to MongoDB with a short 3-second timeout
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 3000,
                ...options
            });
            console.log('Successfully connected to MongoDB Atlas');
        } catch (err) {
            console.error('Database connection error:', err.message);
            console.log('Falling back to local JSON-based database.');
            useLocalDb = true;
        }
    },
    
    model: function(name, schema) {
        const realModel = mongoose.model(name, new mongoose.Schema(schema.definition));
        const wrapper = createModelWrapper(name, schema, realModel);
        registeredModels[name] = wrapper;
        return wrapper;
    }
};

module.exports = db;
