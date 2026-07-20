const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },

  description: { 
    type: String, 
    required: true 
  },

  price: { 
    type: Number, 
    required: true 
  },

  creator: { 
    type: String, 
    required: true 
  },

  thumbnail: { 
    type: String, 
    default: 'https://via.placeholder.com/300x180' 
  },

  // ADD THIS
  category: {
    type: String,
    required: true
  },

  playlist: [
    {
      title: String,
      videoUrl: String,
      resources: String
    }
  ],
  
  isActive: { 
    type: Boolean, 
    default: true 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Course', CourseSchema);