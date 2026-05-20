require('dotenv').config();
const mongoose = require('./server/db');
const User = require('./server/models/User');
const Event = require('./server/models/Event');
const Roadmap = require('./server/models/Roadmap');
const Message = require('./server/models/Message');

async function runTest() {
    try {
        console.log('Initiating database connection...');
        await mongoose.connect(process.env.MONGODB_URI || 'local');
        
        // Let's yield a bit to make sure connection state transitions have printed logs
        await new Promise(resolve => setTimeout(resolve, 500));

        // 1. Check/Verify default Seeded Admin
        console.log('\n--- 1. Testing Admin User ---');
        const admin = await User.findOne({ email: '04324205191008@uits.edu.bd' });
        if (admin) {
            console.log('✅ Admin user found:', admin.name);
            const isMatch = await admin.comparePassword('password123');
            console.log('✅ Admin password verification (password123):', isMatch ? 'PASS' : 'FAIL');
            if (!isMatch) throw new Error('Admin password mismatch');
        } else {
            throw new Error('Seed Admin user not found');
        }

        // 2. Test User Creation and Hashing
        console.log('\n--- 2. Testing User Creation & Hashing ---');
        const tempEmail = `test_user_${Date.now()}@example.com`;
        const tempUser = new User({
            name: 'John Test Doe',
            email: tempEmail,
            password: 'secretPassword123'
        });
        await tempUser.save();
        console.log('✅ Temp user created successfully.');

        const fetchedUser = await User.findOne({ email: tempEmail });
        if (fetchedUser && fetchedUser.name === 'John Test Doe') {
            console.log('✅ Temp user retrieved successfully.');
            const isMatch = await fetchedUser.comparePassword('secretPassword123');
            console.log('✅ Temp user password hash verification:', isMatch ? 'PASS' : 'FAIL');
            if (!isMatch) throw new Error('Temp user password verification failed');
        } else {
            throw new Error('Temp user could not be retrieved');
        }

        // 3. Test Event Creation and Querying with Sorting
        console.log('\n--- 3. Testing Event CRUD & Sorting ---');
        const event1 = new Event({
            title: 'Late Event',
            description: 'This event happens later',
            date: new Date('2026-12-31'),
            location: 'Auditorium',
            category: 'Workshop',
            createdBy: fetchedUser._id
        });
        const event2 = new Event({
            title: 'Early Event',
            description: 'This event happens earlier',
            date: new Date('2026-06-01'),
            location: 'Lab 1',
            category: 'Seminar',
            createdBy: fetchedUser._id
        });
        await event1.save();
        await event2.save();
        console.log('✅ Events created successfully.');

        const sortedEvents = await Event.find().sort({ date: 1 });
        console.log('✅ Events fetched with ascending date sorting.');
        if (sortedEvents.length >= 2) {
            console.log('   First event date:', sortedEvents[0].date.toLocaleDateString(), '-', sortedEvents[0].title);
            console.log('   Second event date:', sortedEvents[1].date.toLocaleDateString(), '-', sortedEvents[1].title);
            if (sortedEvents[0].date > sortedEvents[1].date) {
                throw new Error('Events sorting order incorrect');
            }
        } else {
            throw new Error('Failed to retrieve all events');
        }

        // 4. Test Roadmap Creation and Population
        console.log('\n--- 4. Testing Roadmap CRUD & Population ---');
        const roadmap = new Roadmap({
            title: 'Test Roadmap Title',
            link: 'https://example.com/test-roadmap',
            description: 'A test roadmap description',
            category: 'frontend',
            submittedBy: fetchedUser._id,
            status: 'pending'
        });
        await roadmap.save();
        console.log('✅ Roadmap created successfully.');

        const loadedRoadmaps = await Roadmap.find({ status: 'pending' })
            .populate('submittedBy', 'name email');
        console.log('✅ Pending roadmaps fetched and populated.');
        if (loadedRoadmaps.length > 0) {
            const matched = loadedRoadmaps.find(r => String(r._id) === String(roadmap._id));
            if (matched) {
                console.log('   Populated Submitter Name:', matched.submittedBy ? matched.submittedBy.name : 'null');
                console.log('   Populated Submitter Email:', matched.submittedBy ? matched.submittedBy.email : 'null');
                if (!matched.submittedBy || matched.submittedBy.name !== 'John Test Doe' || matched.submittedBy.password !== undefined) {
                    throw new Error('Roadmap population failed or exposed sensitive fields');
                }
            } else {
                throw new Error('Created roadmap not found in query results');
            }
        } else {
            throw new Error('No pending roadmaps returned');
        }

        // 5. Test Contact Messages Creation
        console.log('\n--- 5. Testing Contact Messages ---');
        const msg = new Message({
            name: 'Inquirer Doe',
            email: 'inquirer@example.com',
            message: 'Hello, testing club messages fallback!'
        });
        await msg.save();
        console.log('✅ Message created successfully.');

        const messages = await Message.find().sort({ createdAt: -1 });
        if (messages.length > 0) {
            console.log('   Latest Message:', messages[0].message);
        } else {
            throw new Error('No messages returned');
        }

        // 6. Cleanup
        console.log('\n--- 6. Cleaning Up Test Data ---');
        await User.findByIdAndDelete(fetchedUser._id);
        await Event.findByIdAndDelete(event1._id);
        await Event.findByIdAndDelete(event2._id);
        await Roadmap.findByIdAndDelete(roadmap._id);
        await Message.findByIdAndDelete(msg._id);
        console.log('✅ Cleanup completed successfully.');

        console.log('\n⭐⭐⭐⭐⭐ ALL DATABASE INTEGRATION TESTS PASSED ⭐⭐⭐⭐⭐\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ TEST RUN ERROR:', err.stack);
        process.exit(1);
    }
}

runTest();

setTimeout(() => {
    console.log('TIMEOUT');
    process.exit(1);
}, 15000);
