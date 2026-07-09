require('./utils/dnsOverride');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const updateBot = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the bot user and change its name to look like a legitimate verified agent
    const result = await User.findOneAndUpdate(
      { email: 'bot@aggregator.com' },
      { name: 'PlotVista Verified Partner' },
      { new: true }
    );
    
    if (result) {
      console.log('Successfully renamed the bot to:', result.name);
    } else {
      console.log('Bot not found!');
    }
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateBot();
