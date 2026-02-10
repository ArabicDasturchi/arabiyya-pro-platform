import express from 'express';

const router = express.Router();

// Placement test questions
const placementQuestions = [
  // A1
  { q: "Arab tilida harflar qaysi tomondan yoziladi?", a: ["Chapdan o'ngga", "O'ngdan chapga", "Yuqoridan pastga"], c: 1, level: 'A1' },
  { q: "'Fatha' belgisi qanday talaffuz qilinadi?", a: ["i tovushi", "u tovushi", "a tovushi"], c: 2, level: 'A1' },
  // A2
  { q: "'Kitabun' so'zining ma'nosi nima?", a: ["Qalam", "Kitob", "Uy"], c: 1, level: 'A2' },
  { q: "Qaysi ibora 'Salom' ma'nosini beradi?", a: ["Shukran", "Assalamu alaykum", "Ma'assalama"], c: 1, level: 'A2' },
  // B1
  { q: "Arab tilida nechta asosiy fe'l zamoni mavjud?", a: ["2 ta", "3 ta", "4 ta"], c: 1, level: 'B1' },
  { q: "'Mudarri'' fe'li qaysi zamonni bildiradi?", a: ["O'tmish zamon", "Hozirgi/Kelajak zamon", "Buyruq mayli"], c: 1, level: 'B1' },
  // B2
  { q: "'I'rob' grammatikada nimani anglatadi?", a: ["So'z shakli", "So'z oxiridagi o'zgarish", "Fe'l turi"], c: 1, level: 'B2' },
  { q: "'Ism mawsul' (موصول اسم) nima?", a: ["Sifat oti", "Bog'lovchi ot", "Fe'l shakli"], c: 1, level: 'B2' },
  // C1
  { q: "'Balagha' ilmida 'majoz' nimani anglatadi?", a: ["To'g'ridan-to'g'ri ma'no", "Ko'chma ma'no", "Grammatik qoida"], c: 1, level: 'C1' },
  { q: "Qur'on tilida 'Qasam uslubi'ni qaysi so'z boshlaydi?", a: ["Inna", "Wa", "La"], c: 1, level: 'C1' },
  // C2
  { q: "'Sarf' va 'Nahv' o'rtasidagi asosiy farq nima?", a: ["Sarf-morfologiya, Nahv-sintaksis", "Ikkisi bir xil", "Sarf-fonetika"], c: 0, level: 'C2' },
  { q: "Klassik arab she'riyatida eng mashhur vazn qaysi?", a: ["Rajaz", "Tawil", "Kamil"], c: 1, level: 'C2' }
];

// @route   GET /api/tests/placement
// @desc    Get placement test questions
// @access  Public
router.get('/placement', (req, res) => {
  res.json({
    success: true,
    totalQuestions: placementQuestions.length,
    questions: placementQuestions.map(({ c, ...rest }) => rest) // Remove correct answer
  });
});

// @route   POST /api/tests/placement/check
// @desc    Check placement test answers
// @access  Public
router.post('/placement/check', (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers format'
      });
    }

    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (answer === placementQuestions[index].c) {
        correctCount++;
      }
    });

    res.json({
      success: true,
      score: correctCount,
      totalQuestions: 12,
      percentage: Math.round((correctCount / 12) * 100)
    });
  } catch (error) {
    console.error('Check placement test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Generate lesson test (5 questions)
router.get('/lesson/:levelId/:lessonNumber', (req, res) => {
  const { levelId, lessonNumber } = req.params;
  
  const questions = Array.from({ length: 5 }, (_, i) => ({
    q: `${levelId} - Dars ${lessonNumber}: Savol ${i + 1}`,
    a: ["Variant A", "Variant B", "Variant C"]
  }));

  res.json({
    success: true,
    levelId,
    lessonNumber,
    totalQuestions: 5,
    questions
  });
});

// Generate level exam (15 questions)
router.get('/exam/:levelId', (req, res) => {
  const { levelId } = req.params;
  
  const questions = Array.from({ length: 15 }, (_, i) => ({
    q: `${levelId} daraja imtihoni: Savol ${i + 1}`,
    a: ["Variant A", "Variant B", "Variant C"]
  }));

  res.json({
    success: true,
    levelId,
    totalQuestions: 15,
    passingScore: 13,
    questions
  });
});

export default router;