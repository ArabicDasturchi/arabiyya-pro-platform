import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  levelId: {
    type: String,
    required: true,
    enum: ['ALPHABET', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  lessonNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  topics: [{
    type: String,
    required: true
  }],
  duration: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String
  },
  ebookUrl: {
    type: String
  },
  content: {
    introduction: String,
    mainContent: String,
    summary: String,
    keyPoints: [String]
  },
  // Yangi qo'shilgan maydonlar
  theory: {
    type: String, // Nazariy qism (HTML/Markdown)
    default: ''
  },
  practice: {
    type: String, // Amaliy qism (HTML/Markdown)
    default: ''
  },
  homework: {
    type: String, // Uyga vazifa (HTML/Markdown) - oldingi objectdan o'zgartirdik, osonroq bo'lishi uchun
    default: ''
  },
  quiz: [{
    question: String,
    options: [String], // ["A", "B", "C", "D"]
    correctAnswer: Number // 0, 1, 2, or 3
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for levelId and lessonNumber
lessonSchema.index({ levelId: 1, lessonNumber: 1 }, { unique: true });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;