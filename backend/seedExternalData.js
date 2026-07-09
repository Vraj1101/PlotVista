const { applyDnsOverride } = require('./utils/dnsOverride');
applyDnsOverride();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Property = require('./models/Property');

// Load environment variables (like MONGO_URI)
dotenv.config();

const seedData = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Seeding...');

    // 1. Create a "Bot" User that acts as our external scraper
    let botUser = await User.findOne({ email: 'bot@aggregator.com' });
    if (!botUser) {
      botUser = await User.create({
        name: 'PlotVista Web Scraper',
        email: 'bot@aggregator.com',
        password: 'supersecretbotpassword123',
        phone: '0000000000',
        role: 'seller'
      });
      console.log('Created Web Scraper Bot User.');
    }

    // 2. Generate Realistic Plots simulating external data
    const externalProperties = [
      {
        title: 'Prime Commercial Land in Mumbai',
        description: 'Excellent location for a mall or corporate office. (Automatically aggregated from external sources).',
        price: 5000000,
        areaSize: 15000,
        address: 'Bandra Kurla Complex, Mumbai, Maharashtra',
        location: { lat: 19.0653, lng: 72.8658 },
        propertyType: 'commercial',
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
        seller: botUser._id,
        approvalStatus: 'approved'
      },
      {
        title: 'Lush Agricultural Farm in Punjab',
        description: 'Massive farm ready for harvest. (Automatically aggregated from partner websites).',
        price: 120000,
        areaSize: 50000,
        address: 'Ludhiana, Punjab',
        location: { lat: 30.9010, lng: 75.8573 },
        propertyType: 'agricultural',
        images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80'],
        seller: botUser._id,
        approvalStatus: 'approved'
      }
    ];

    // Generate 15 more random plots scattered around India
    for(let i = 0; i < 15; i++) {
       // Create random coordinates roughly around central/southern India
       const lat = 15.0 + (Math.random() * 10); 
       const lng = 73.0 + (Math.random() * 10); 
       const types = ['residential', 'commercial', 'agricultural'];
       const type = types[Math.floor(Math.random() * types.length)];

       externalProperties.push({
         title: `Partner Plot Listing #${i+1}`,
         description: 'This property was automatically imported by our nightly web scraper from partner real estate APIs.',
         price: Math.floor(Math.random() * 500000) + 20000,
         areaSize: Math.floor(Math.random() * 10000) + 1000,
         address: `Aggregated Region ${i+1}, India`,
         location: { lat, lng },
         propertyType: type,
         images: ['https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80'],
         seller: botUser._id,
         approvalStatus: 'approved'
       });
    }

    // 3. Inject all of them into MongoDB instantly
    await Property.insertMany(externalProperties);
    
    console.log(`Successfully injected ${externalProperties.length} scraped properties into the database!`);
    process.exit();
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
