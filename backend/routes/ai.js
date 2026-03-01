import express from 'express';
import axios from 'axios';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

const router = express.Router();

export const callOpenAI = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && i < retries - 1) {
        console.log(`OpenAI Rate limited, retrying attempt ${i + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};

// Helper to get user from token (optional auth)
const getUserFromToken = async (req) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.userId);
  } catch (error) {
    return null;
  }
};

// @route   POST /api/ai/placement-analysis
// @desc    AI analysis for placement test
// @access  Public (Optional Auth for saving)
router.post('/placement-analysis', [
  body('score').isInt({ min: 0, max: 12 }).withMessage('Score must be between 0 and 12'),
  body('answers').isArray().withMessage('Answers must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { score, answers } = req.body;

    const prompt = `Foydalanuvchi arab tili bo'yicha darajani aniqlash testida 12 savoldan ${score} ta to'g'ri javob berdi. 
Har bir CEFR darajadan 2 tadan savol berilgan (A1, A2, B1, B2, C1, C2).

Test natijalari: ${score}/12 to'g'ri javob

Iltimos, professional tahlil bering:
1. Qaysi CEFR darajadan (A1, A2, B1, B2, C1 yoki C2) boshlashi kerak
2. Batafsil sabab va kuchli tomonlari (3-4 jumla)
3. Rivojlanish yo'nalishi va maslahatlar
4. Motivatsion xabar

Javob faqat o'zbek tilida va quyidagi formatda:
DARAJA: [A1/A2/B1/B2/C1/C2]
TAHLIL: [professional tahlil va tavsiyalar]`;

    const response = await callOpenAI(prompt);
    const aiResponse = response.data.choices[0].message.content ||
      `DARAJA: A1\nTAHLIL: Asosiy darajadan boshlashni tavsiya qilamiz.`;

    // Extract level
    const levelMatch = aiResponse.match(/DARAJA:\s*([ABC][12])/);
    const assignedLevel = levelMatch ? levelMatch[1] : (
      score >= 10 ? "C1" : score >= 8 ? "B2" : score >= 6 ? "B1" : score >= 4 ? "A2" : "A1"
    );

    // Save result if user is logged in
    const user = await getUserFromToken(req);
    if (user) {
      user.currentLevel = assignedLevel;
      user.placementTestScore = score;
      user.testResults.push({
        type: 'placement',
        score: score,
        totalQuestions: 12,
        answers: answers,
        aiAnalysis: aiResponse,
        levelId: assignedLevel
      });
      await user.save();
    }

    res.json({
      success: true,
      level: assignedLevel,
      feedback: aiResponse,
      score,
      saved: !!user
    });
  } catch (error) {
    console.error('AI Placement Analysis Error:', error.response?.data || error.message);

    // Fallback response
    const { score } = req.body;
    const assignedLevel = score >= 10 ? "C1" : score >= 8 ? "B2" : score >= 6 ? "B1" : score >= 4 ? "A2" : "A1";

    res.json({
      success: true,
      level: assignedLevel,
      feedback: `DARAJA: ${assignedLevel}\n\nTAHLIL: Sizning natijangiz ${score}/12 to'g'ri javob. Bu ${assignedLevel} darajadan boshlash uchun yaxshi ko'rsatkichdir. Muvaffaqiyatlar!`,
      score,
      saved: false
    });
  }
});

// @route   POST /api/ai/lesson-test-analysis
// @desc    AI analysis for lesson test
// @access  Public (Optional Auth for saving)
router.post('/lesson-test-analysis', [
  body('lessonTitle').notEmpty().withMessage('Lesson title is required'),
  body('score').isInt({ min: 0, max: 5 }).withMessage('Score must be between 0 and 5'),
  body('totalQuestions').equals('5').withMessage('Total questions must be 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { lessonTitle, score } = req.body;

    const prompt = `Foydalanuvchi "${lessonTitle}" darsini tugatdi va testni ishladi. 
5 savoldan ${score} ta to'g'ri javob berdi.

Iltimos, qisqacha lekin professional tahlil va motivatsion tavsiya bering (o'zbek tilida, 2-3 jumla).`;

    const response = await callOpenAI(prompt);
    const aiResponse = response.data.choices[0].message.content ||
      "Yaxshi natija! Davom eting!";

    const passed = score >= 4;

    // Save result if user is logged in
    const user = await getUserFromToken(req);
    if (user) {
      user.testResults.push({
        type: 'lesson',
        score: score,
        totalQuestions: 5,
        aiAnalysis: aiResponse,
      });

      await user.save();
    }

    res.json({
      success: true,
      analysis: aiResponse,
      score,
      passed,
      saved: !!user
    });
  } catch (error) {
    console.error('AI Lesson Test Analysis Error:', error.response?.data || error.message);
    res.json({
      success: true,
      analysis: "Yaxshi ish qildingiz! Davom eting!",
      score: req.body.score,
      passed: req.body.score >= 4,
      saved: false
    });
  }
});

// @route   POST /api/ai/level-exam-analysis
// @desc    AI analysis for level exam
// @access  Public (Optional Auth for saving)
router.post('/level-exam-analysis', [
  body('levelId').isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).withMessage('Invalid level'),
  body('score').isInt({ min: 0, max: 15 }).withMessage('Score must be between 0 and 15')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { levelId, score } = req.body;

    const prompt = `Foydalanuvchi ${levelId} daraja yakuniy imtihonini topshirdi.
15 savoldan ${score} ta to'g'ri javob berdi.

Iltimos, batafsil professional tahlil va keyingi qadamlar haqida maslahat bering (o'zbek tilida).`;

    const response = await callOpenAI(prompt);
    const aiResponse = response.data.choices[0].message.content ||
      "Yaxshi natija! Keyingi darajaga o'tishingiz mumkin!";

    const passed = score >= 13;

    // Save result if user is logged in
    const user = await getUserFromToken(req);
    if (user) {
      user.testResults.push({
        type: 'level',
        levelId: levelId,
        score: score,
        totalQuestions: 15,
        aiAnalysis: aiResponse
      });

      if (passed) {
        // Add to completed levels
        const alreadyCompleted = user.completedLevels.some(l => l.levelId === levelId);
        if (!alreadyCompleted) {
          user.completedLevels.push({
            levelId: levelId,
            examScore: score
          });
        }

        // C2 Certificate
        if (levelId === 'C2') {
          user.certificates.push({
            certificateId: `ARABPRO-${Date.now().toString().slice(-8)}`,
            level: 'C2 - Professional Mastery',
            issueDate: new Date(),
            score: score
          });
        }
      }
      await user.save();
    }

    res.json({
      success: true,
      analysis: aiResponse,
      score,
      passed,
      saved: !!user
    });
  } catch (error) {
    console.error('AI Level Exam Analysis Error:', error.response?.data || error.message);
    res.json({
      success: true,
      analysis: "Yaxshi ish! Keyingi darajaga tayyorsiz!",
      score: req.body.score,
      passed: req.body.score >= 13,
      saved: false
    });
  }
});


// @route   GET /api/ai/chats
// @desc    Get user chat history list
// @access  Private (Auth required)
router.get('/chats', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, message: 'Auth required' });

    const chats = await Chat.find({ user: user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/ai/chats/:id
// @desc    Get single chat messages
// @access  Private
router.get('/chats/:id', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, message: 'Auth required' });

    const chat = await Chat.findOne({ _id: req.params.id, user: user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/ai/chats/clear
// @desc    Delete all chats
// @access  Private
router.delete('/chats/clear', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, message: 'Auth required' });

    await Chat.deleteMany({ user: user._id });
    res.json({ success: true, message: 'All chats deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/ai/chats/:id
// @desc    Delete chat
// @access  Private
router.delete('/chats/:id', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, message: 'Auth required' });

    await Chat.findOneAndDelete({ _id: req.params.id, user: user._id });
    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/ai/chats/:chatId/messages/:msgId
// @desc    Edit a message
router.put('/chats/:chatId/messages/:msgId', async (req, res) => {
  try {
    const { chatId, msgId } = req.params;
    const { content } = req.body;
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, message: 'Auth required' });

    const chat = await Chat.findOne({ _id: chatId, user: user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const message = chat.messages.id(msgId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    message.content = content;
    await chat.save();

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/ai/chats/:chatId/messages/:msgId
// @desc    Delete a message
router.delete('/chats/:chatId/messages/:msgId', async (req, res) => {
  try {
    const { chatId, msgId } = req.params;
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ success: false, message: 'Auth required' });

    const chat = await Chat.findOne({ _id: chatId, user: user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    chat.messages.pull({ _id: msgId });
    await chat.save();

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// @desc    AI chat assistant (creates or updates chat)
// @access  Public (but saves only if Auth)
router.post('/chat', [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { message, chatId } = req.body;
    let context = "";

    // If context is needed, we would fetch it here. For now, we use a stateless prompt but save history.
    const user = await getUserFromToken(req);
    let chat;

    if (user && chatId) {
      chat = await Chat.findOne({ _id: chatId, user: user._id });
      if (chat && chat.messages.length > 0) {
        // Get last 3 messages for context
        const history = chat.messages.slice(-3).map(m => `${m.role === 'user' ? 'Foydalanuvchi' : 'AI'}: ${m.content}`).join('\n');
        context = `Oldingi suhbat (context):\n${history}\n\nbu contextni inobatga olib javob ber.\n\n`;
      }
    }

    const prompt = `Sen professional arab tili o'qituvchisissan - Arabiyya Pro platformasining AI yordamchisissan.
    
${context || ''}Foydalanuvchi savoli: ${message}

Iltimos:
- O'zbek tilida javob ber
- Professional va samimiy bo'l
- Aniq misollar keltir
- Kerak bo'lsa grammatik tushuntirishlar ber
- Motivatsion bo'l

Javob:`;

    const response = await callOpenAI(prompt);
    const aiResponse = response.data.choices[0].message.content ||
      "Kechirasiz, hozir javob bera olmayman. Qaytadan urinib ko'ring.";

    // Save chat history if user is logged in
    if (user) {
      if (!chat) {
        chat = new Chat({
          user: user._id,
          title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
          messages: []
        });
      }

      chat.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      chat.messages.push({
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      });

      await chat.save();
    }

    // Get IDs of new messages
    let userMessageId, aiMessageId;
    if (chat && chat.messages.length >= 2) {
      userMessageId = chat.messages[chat.messages.length - 2]._id;
      aiMessageId = chat.messages[chat.messages.length - 1]._id;
    }

    res.json({
      success: true,
      response: aiResponse,
      chatId: chat ? chat._id : null,
      userMessageId,
      aiMessageId,
      saved: !!user
    });
  } catch (error) {
    console.error('AI Chat Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'AI xatosi. Qaytadan urinib ko\'ring.',
      saved: false
    });
  }
});

export default router;