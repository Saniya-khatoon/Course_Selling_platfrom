const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },

  courseId: { type: String, required: true },
  courseTitle: { type: String, required: true },

  // Humne transactionId rakha hai kyunki aapke system me ye required hai
  transactionId: {
    type: String,
    required: true,
    unique: true // Isme student ka UTR number hi save hoga
  },

  creator: { type: String },
  description: { type: String },
  thumbnail: { type: String },

  playlist: [
    {
      title: String,
      videoUrl: String,
      resources: String
    }
  ],

  // ✅ Progress Tracking
  completedLessons: {
    type: [String],
    default: []
  },

  progress: {
    type: Number,
    default: 0
  },

  // Single cleanly defined status field
  status: { 
    type: String, 
    default: "Pending Approval" 
  },

  enrolledAt: {
    type: Date,
    default: Date.now
  },

  // ⚠️ CHANGER: Humne 'utr' field ko required se hata diya hai kyunki 
  // hum ab saara transaction/UTR data direct 'transactionId' me hi store karenge.
  utr: { 
    type: String 
  }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);