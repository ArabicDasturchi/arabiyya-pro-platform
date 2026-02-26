import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ism kiritish majburiy'],
    trim: true,
    minlength: [2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'],
    maxlength: [50, 'Ism 50 ta belgidan oshmasligi kerak']
  },
  email: {
    type: String,
    required: [true, 'Email kiritish majburiy'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'To\'g\'ri email manzilini kiriting']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  purchasedLevels: {
    type: [String],
    default: []
  },
  completedLevels: [{
    levelId: String,
    examScore: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  password: {
    type: String,
    required: [true, 'Parol kiritish majburiy'],
    minlength: [6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'],
    select: false
  },
  currentLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
  },
  placementTestScore: {
    type: Number,
    min: 0,
    max: 12
  },
  completedLessons: [{
    levelId: String,
    lessonId: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedLevels: [{
    levelId: String,
    completedAt: {
      type: Date,
      default: Date.now
    },
    examScore: Number
  }],
  testResults: [{
    type: {
      type: String,
      enum: ['placement', 'lesson', 'level'],
      required: true
    },
    levelId: String,
    lessonId: Number,
    score: Number,
    totalQuestions: Number,
    answers: [Number],
    aiAnalysis: String,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  chatHistory: [{
    role: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  certificates: [{
    certificateId: String,
    level: String,
    issueDate: Date,
    score: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  activeSessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function () {
  this.lastActive = Date.now();
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;