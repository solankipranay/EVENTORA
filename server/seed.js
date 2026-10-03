const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.test';
const userEmail = process.env.SEED_USER_EMAIL || 'user@example.test';
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const userPassword = process.env.SEED_USER_PASSWORD;

const users = [
    { name: 'Eventora Demo Admin', email: 'solankipranay34@gmail.com', password: 'password123', role: 'admin' },
    { name: 'Eventora Demo User', email: 'userdemo@gmail.com', password: 'password123', role: 'user' },
    { name: 'Aarav Patel', email: 'aarav@example.test', password: userPassword, role: 'user' },
    { name: 'Diya Shah', email: 'diya@example.test', password: userPassword, role: 'user' },
    { name: 'Rohan Mehta', email: 'rohan@example.test', password: userPassword, role: 'user' },
    { name: 'Ananya Joshi', email: 'ananya@example.test', password: userPassword, role: 'user' },
    { name: 'Karan Trivedi', email: 'karan@example.test', password: userPassword, role: 'user' },
    { name: 'Priya Desai', email: 'priya@example.test', password: userPassword, role: 'user' }
];


const events = [
    {
        title: 'VIP All-Night Garba Season Pass (9 Nights)',
        description: 'Exclusive 9-day full access to The Rangilo Garba Mahotsav. Includes VIP arena lounge seating, fast-track entry, stage-front dance zone access, and complimentary welcome drinks.',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        location: 'Main Garba Arena, Royal Palace Lawns, Ahmedabad',
        category: 'Entry Pass',
        totalSeats: 250,
        ticketPrice: 2499,
        image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Single Night Garba Entry Pass',
        description: 'General Entry Pass for 1 night of energetic Garba & Dandiya Raas with live orchestra, traditional Dhol, renowned singers, and festive lighting.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Main Garba Arena, Royal Palace Lawns, Ahmedabad',
        category: 'Entry Pass',
        totalSeats: 1500,
        ticketPrice: 350,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Couple Dandiya Raas Night Pass',
        description: 'Couple access ticket for 1 night at The Rangilo. Dance to high-energy Garba beats with complimentary decorated Dandiya sticks set included at entry.',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        location: 'Main Garba Arena, Royal Palace Lawns, Ahmedabad',
        category: 'Entry Pass',
        totalSeats: 800,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b84727505?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Royal Kathiyawadi Unlimited Thali Food Pass',
        description: 'Unlimited authentic Gujarati & Kathiyawadi Thali featuring Undhiyu, Puri, Shrikhand, Dhokla, Fafda, Jalebi, and fresh buttermilk at the Food Pavilion.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Rangilo Food Court - Pavilion A',
        category: 'Food Pass',
        totalSeats: 600,
        ticketPrice: 450,
        image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Farali Fasting Special Food Pass',
        description: 'Special Navratri Upvas/Fasting meal pass including Sabudana Vada, Rajgira Puri, Sukhi Bhaji, Moraiyo, Farali Chutney, and Kesar Pista Shake.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Rangilo Food Court - Stalls 1 to 5',
        category: 'Food Pass',
        totalSeats: 500,
        ticketPrice: 299,
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Food Court & Chaat Coupon Pass (₹600 Credit)',
        description: 'Pre-paid digital food voucher loaded with ₹600 credit redeemable across all 25+ live street food, mocktail, ice cream, and chaat stalls.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Rangilo Food Court Stalls',
        category: 'Food Pass',
        totalSeats: 1000,
        ticketPrice: 500,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Night 1: Shubh Ganesh Sthapana & Garba Launch',
        description: 'Grand opening night ceremony with traditional Aarti, Ganesh Sthapana ritual, and 4 hours of non-stop traditional Dhol & Shehnai Garba Raas.',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        location: 'Main Stage, Royal Palace Lawns',
        category: 'Event Schedule',
        totalSeats: 1200,
        ticketPrice: 300,
        image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Night 5: Star Singer Celebrity Garba Special',
        description: 'Mega Star Night featuring live musical performance by iconic Garba artists with electric laser light shows and orchestra.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Main Stage, Royal Palace Lawns',
        category: 'Event Schedule',
        totalSeats: 2000,
        ticketPrice: 799,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Night 9: Grand Finale Maha Raas & Awards',
        description: 'The grand culmination of Navratri! Mega Garba competition finale, Best Traditional Chaniya Choli & Kediyu Outfit awards, and Dussehra celebrations.',
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        location: 'Main Stage, Royal Palace Lawns',
        category: 'Event Schedule',
        totalSeats: 1500,
        ticketPrice: 500,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async () => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('The destructive seed script cannot run in production');
    }
    if (!process.argv.includes('--reset')) {
        throw new Error('This script deletes existing data. Re-run with --reset only for a disposable database.');
    }
    if (!adminPassword || !userPassword) {
        throw new Error('SEED_ADMIN_PASSWORD and SEED_USER_PASSWORD must be set before seeding');
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/eventora');
        console.log('\n✅ MongoDB connection open...');

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing data.');

        // Hash user passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} total users for The Rangilo.`);

        // Link events to admin
        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} distinct Garba passes & event schedules.`);

        // Generate Bookings Data
        const bookingsData = [];

        for (const event of createdEvents) {
            const randomCount = Math.floor(Math.random() * 3) + 2;
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'not_paid';
                if (status === 'confirmed' && event.ticketPrice > 0) {
                    paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} randomized dummy Garba pass bookings.`);

        console.log('\nEventora demo database seeded successfully.');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase().catch((error) => {
    console.error('❌ Seed refused:', error.message);
    process.exitCode = 1;
});