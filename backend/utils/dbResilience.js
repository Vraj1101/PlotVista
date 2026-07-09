const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// In-Memory Database Store
const memoryStore = {
  users: [
    {
      _id: "60c72b2f9b1d8b28f8f2b3a1",
      name: "Verified Partner Seller",
      email: "bot@aggregator.com",
      password: "", // Will be hashed below
      role: "seller"
    },
    {
      _id: "60c72b2f9b1d8b28f8f2b3a2",
      name: "Demo Buyer Account",
      email: "buyer@example.com",
      password: "", // Will be hashed below
      role: "buyer"
    }
  ],
  properties: [
    {
      _id: "60c72b2f9b1d8b28f8f2b3b1",
      title: 'Premium Corporate Land in Delhi NCR',
      description: 'An exceptional commercial plot located in the heart of Delhi NCR. Fully verified and ready for corporate development. Perfect for building a premium IT park or shopping complex. All documents verified by PlotVista Partner Network.',
      price: 85000000,
      areaSize: 10000,
      address: 'Gurugram, Delhi NCR',
      location: { lat: 28.4595, lng: 77.0266 },
      propertyType: 'commercial',
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'],
      seller: {
        _id: "60c72b2f9b1d8b28f8f2b3a1",
        name: "Verified Partner Seller",
        email: "bot@aggregator.com"
      },
      status: 'available'
    },
    {
      _id: "60c72b2f9b1d8b28f8f2b3b2",
      title: 'Fertile Agricultural Farmland',
      description: 'Over 5 acres of highly fertile agricultural land with excellent irrigation access. Ideal for organic farming or solar panel installation. Title deeds are 100% clear and verified.',
      price: 15000000,
      areaSize: 217800,
      address: 'Nashik, Maharashtra',
      location: { lat: 19.9975, lng: 73.7898 },
      propertyType: 'agricultural',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
      seller: {
        _id: "60c72b2f9b1d8b28f8f2b3a1",
        name: "Verified Partner Seller",
        email: "bot@aggregator.com"
      },
      status: 'available'
    },
    {
      _id: "60c72b2f9b1d8b28f8f2b3b3",
      title: 'Luxury Villa Plot - Sea View',
      description: 'Build your dream home on this exclusive residential plot overlooking the Arabian Sea. Located in a gated community with 24/7 security, paved roads, and premium amenities.',
      price: 45000000,
      areaSize: 5000,
      address: 'Bandra West, Mumbai',
      location: { lat: 19.0596, lng: 72.8295 },
      propertyType: 'residential',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
      seller: {
        _id: "60c72b2f9b1d8b28f8f2b3a1",
        name: "Verified Partner Seller",
        email: "bot@aggregator.com"
      },
      status: 'available'
    },
    {
      _id: "60c72b2f9b1d8b28f8f2b3b4",
      title: 'Highway Frontage Industrial Land',
      description: 'Massive industrial plot with direct access to the national highway. Perfect for logistics, warehousing, or large-scale manufacturing setups. All environmental clearances pre-approved.',
      price: 120000000,
      areaSize: 50000,
      address: 'Pune-Mumbai Expressway',
      location: { lat: 18.7500, lng: 73.4000 },
      propertyType: 'commercial',
      images: ['https://images.unsplash.com/photo-1586528116311-ad8ed7fc51f7?auto=format&fit=crop&w=800&q=80'],
      seller: {
        _id: "60c72b2f9b1d8b28f8f2b3a1",
        name: "Verified Partner Seller",
        email: "bot@aggregator.com"
      },
      status: 'available'
    },
    {
      _id: "60c72b2f9b1d8b28f8f2b3b5",
      title: 'Serene Eco-Resort Hillside Plot',
      description: 'A beautiful, sloped plot located in the serene hills, currently covered in natural greenery. Excellent potential for an eco-resort, wellness retreat, or private hillside mansion.',
      price: 32000000,
      areaSize: 43560,
      address: 'Munnar, Kerala',
      location: { lat: 10.0889, lng: 77.0595 },
      propertyType: 'agricultural',
      images: ['https://images.unsplash.com/photo-1596522354195-e84ae3c987dd?auto=format&fit=crop&w=800&q=80'],
      seller: {
        _id: "60c72b2f9b1d8b28f8f2b3a1",
        name: "Verified Partner Seller",
        email: "bot@aggregator.com"
      },
      status: 'available'
    }
  ]
};

// Pre-hash password defaults for seamless login
const salt = bcrypt.genSaltSync(10);
memoryStore.users.forEach(user => {
  user.password = bcrypt.hashSync("password123", salt);
});

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  isDbConnected,
  memoryStore
};
