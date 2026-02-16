import React, { useState, useEffect } from 'react';
import {
  BookOpen, Play, Award, Lock, CheckCircle2, ChevronLeft, ChevronRight,
  User, UserCheck, ArrowRight, HelpCircle, Instagram, Facebook, MessageCircle,
  Youtube, Twitter, Mail, Phone, MapPin, X, Globe, Shield,
  Sparkles, Loader2, ClipboardCheck, Trophy, Star, Video,
  FileText, Send, Menu, LogOut, Download, Book, Target,
  TrendingUp, Zap, Headphones, CheckCircle, XCircle, Volume2,
  GraduationCap, Brain, Rocket, Clock, Users, BarChart,
  Lightbulb, Heart, Flag, Compass, ZoomIn, Search, LayoutDashboard, Settings, Layers, Trash2, ArrowLeft, Plus, Activity, Upload, Gift,
  Info, PenTool, Home, Save, List
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testStep, setTestStep] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [placementResult, setPlacementResult] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonTestAnswers, setLessonTestAnswers] = useState([]);
  const [lessonTestStep, setLessonTestStep] = useState(0);
  const [lessonTestStarted, setLessonTestStarted] = useState(false);
  const [examAnswers, setExamAnswers] = useState([]);
  const [examStep, setExamStep] = useState(0);

  // Admin Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);

  // Student Submissions State
  const [mySubmissions, setMySubmissions] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Multi-Chat States
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatView, setChatView] = useState('list'); // Default to list view to show history first
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [showHomework, setShowHomework] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLevel, setEditingLevel] = useState(null); // Track which level is being edited
  const [newLessonData, setNewLessonData] = useState({ title: '', duration: '', videoUrl: '' }); // Form data
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLessonData, setEditLessonData] = useState({
    title: '', duration: '', videoUrl: '',
    theory: '', practice: '', homework: '', quiz: []
  });
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [editLessonTab, setEditLessonTab] = useState('main');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [adminOrders, setAdminOrders] = useState([]);

  // Alphabet Learning State
  const [alphabetModule, setAlphabetModule] = useState(1);
  const [alphabetTab, setAlphabetTab] = useState('video');

  // Module Learning State (for A1-C2 levels)
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleTab, setModuleTab] = useState('video');
  const [lessonTab, setLessonTab] = useState('video'); // Dars sahifalari uchun

  const apiKey = "AIzaSyBsmkZPeYer67MBM8Ac-hkUFMsrgNaUrc4"; // API key integration point

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
          // If user was on a protected view, stay there, otherwise go to levels
          // For simplicity, we can redirect to levels if currently on home/auth
          if (view === 'auth') setView('levels');
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Auth check failed', err);
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  // Function to refresh user data (to get updated purchasedLevels)
  const fetchMySubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/submissions/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMySubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Failed to fetch my submissions:", err);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        console.log('🔄 User data refreshed:', data.user.name);
        console.log('💰 Purchased Levels:', data.user.purchasedLevels);
        setUser(data.user);
        fetchMySubmissions(); // Update submissions history too

        // Legacy chat history restore removed to support multi-chat system
      }
    } catch (err) {
      console.error('User refresh failed', err);
    }
  };

  // Enhanced CEFR Levels with complete structure
  const [levels, setLevels] = useState([]);

  // Purchase Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseProof, setPurchaseProof] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Grant Level Modal State (Admin)
  const [showGrantLevelModal, setShowGrantLevelModal] = useState(false);
  const [grantingLevelTo, setGrantingLevelTo] = useState(null);
  const [selectedGrantLevel, setSelectedGrantLevel] = useState('');

  // Google Sign-In Logic
  const handleGoogleCallback = async (response) => {
    try {
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setView('levels');
      } else {
        alert('Xatolik: ' + data.message);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Tizim xatosi');
    }
  };

  useEffect(() => {
    if (view === 'auth' && window.google) {
      const initGoogle = () => {
        if (window.google?.accounts) {
          window.google.accounts.id.initialize({
            client_id: "645466008042-5c2r49etqtdd0srgou6tfvqrlo9vr272.apps.googleusercontent.com",
            callback: handleGoogleCallback
          });

          const googleDiv = document.getElementById("googleDiv");
          if (googleDiv) {
            window.google.accounts.id.renderButton(
              googleDiv,
              { theme: "outline", size: "large", width: 400, text: "continue_with" }
            );
          }
        }
      };

      // Check if script loaded, if not wait a bit or it runs on load
      if (typeof window.google === 'undefined') {
        setTimeout(initGoogle, 500);
      } else {
        initGoogle();
      }
    }
  }, [view]);

  const isLevelUnlocked = (levelId) => {
    // Check if user purchased it
    const unlocked = user?.purchasedLevels?.includes(levelId);
    console.log(`🔓 Checking ${levelId}: ${unlocked ? 'UNLOCKED ✅' : 'LOCKED 🔒'}`, user?.purchasedLevels);
    return unlocked;
  };

  const handleLevelClick = (level) => {
    // Admin uchun barcha darajalar bepul, boshqalar uchun to'lov kerak
    if (user?.role === 'admin' || isLevelUnlocked(level.id)) {
      setSelectedLevel(level);
      setView('level-lessons');
    } else {
      setSelectedLevel(level);
      setShowPurchaseModal(true);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseProof) return alert('Iltimos, chek raqami yoki ID ni kiriting');

    setIsSubmittingOrder(true);
    try {
      const token = localStorage.getItem('token');
      // Set fixed price for all levels
      const amount = 300000;

      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          levelId: selectedLevel.id,
          amount,
          paymentType: 'bank_transfer',
          transactionProof: purchaseProof
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Buyurtma qabul qilindi! Admin tasdiqlagandan so\'ng daraja ochiladi.');
        setShowPurchaseModal(false);
        setPurchaseProof('');
      } else {
        alert('❌ Xatolik: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Tizim xatosi');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState({
    language: localStorage.getItem('language') || 'uz',
    theme: localStorage.getItem('theme') || 'dark'
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const handleSettingsChange = (key, value) => {
    setAdminSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value);
    // Here you could also apply the theme class to body/html if implementing real dark/light mode toggle
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      alert("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Parol muvaffaqiyatli yangilandi!');
        setPasswordForm({ oldPassword: '', newPassword: '' });
      } else {
        alert('Xatolik: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Server xatosi');
    }
  };

  const fetchLevels = async () => {
    try {
      // Add timestamp to prevent caching
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/levels?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        // Map _id to id for frontend compatibility
        const formattedLevels = data.levels.map(l => ({
          ...l,
          lessons: l.lessons.map(lesson => ({
            ...lesson,
            id: lesson._id
          }))
        }));
        setLevels(formattedLevels);

        // Sync editingLevel if active
        // Note: functionality relies on fetchLevels being called after updates
        // We will manually sync in the handlers or let the user re-open, but better to sync here if we can access editingLevel state
        // Since we are inside the component, we can check editingLevel id
        if (editingLevel) {
          const updated = formattedLevels.find(l => l.id === editingLevel.id);
          if (updated) setEditingLevel(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };


  // Refresh user data (background polling) to catch updates instantly
  useEffect(() => {
    // Only run if user is logged in
    if (!user) return;

    // Refresh initially
    refreshUser();

    // If on levels page or home page, refresh frequently (every 10s) to catch grants
    if (view === 'levels' || view === 'home') {
      const interval = setInterval(() => {
        refreshUser();
      }, 10000); // 10 soniyada bir marta tekshirish

      return () => clearInterval(interval);
    }
  }, [view, user?.id]);

  useEffect(() => {
    fetchLevels();
  }, []); // Initial load

  // Effect to keep editingLevel in sync when levels change (e.g. after fetchLevels)
  useEffect(() => {
    if (editingLevel && levels.length > 0) {
      const updated = levels.find(l => l.id === editingLevel.id);
      if (updated && updated !== editingLevel) {
        setEditingLevel(updated);
      }
    }
  }, [levels]);

  // Placement test questions - 12 questions (2 from each level)
  const placementQuestions = [
    // A1 Level
    { q: "Arab tilida harflar qaysi tomondan yoziladi?", a: ["Chapdan o'ngga", "O'ngdan chapga", "Yuqoridan pastga"], c: 1, level: 'A1' },
    { q: "'Fatha' belgisi qanday talaffuz qilinadi?", a: ["i tovushi", "u tovushi", "a tovushi"], c: 2, level: 'A1' },

    // A2 Level
    { q: "'Kitabun' so'zining ma'nosi nima?", a: ["Qalam", "Kitob", "Uy"], c: 1, level: 'A2' },
    { q: "Qaysi ibora 'Salom' ma'nosini beradi?", a: ["Shukran", "Assalamu alaykum", "Ma'assalama"], c: 1, level: 'A2' },

    // B1 Level
    { q: "Arab tilida nechta asosiy fe'l zamoni mavjud?", a: ["2 ta", "3 ta", "4 ta"], c: 1, level: 'B1' },
    { q: "'Mudarri'' fe'li qaysi zamonni bildiradi?", a: ["O'tmish zamon", "Hozirgi/Kelajak zamon", "Buyruq mayli"], c: 1, level: 'B1' },

    // B2 Level
    { q: "'I'rob' grammatikada nimani anglatadi?", a: ["So'z shakli", "So'z oxiridagi o'zgarish", "Fe'l turi"], c: 1, level: 'B2' },
    { q: "'Ism mawsul' (موصول اسم) nima?", a: ["Sifat oti", "Bog'lovchi ot", "Fe'l shakli"], c: 1, level: 'B2' },

    // C1 Level
    { q: "'Balagha' ilmida 'majoz' nimani anglatadi?", a: ["To'g'ridan-to'g'ri ma'no", "Ko'chma ma'no", "Grammatik qoida"], c: 1, level: 'C1' },
    { q: "Qur'on tilida 'Qasam uslubi'ni qaysi so'z boshlaydi?", a: ["Inna", "Wa", "La"], c: 1, level: 'C1' },

    // C2 Level
    { q: "'Sarf' va 'Nahv' o'rtasidagi asosiy farq nima?", a: ["Sarf-morfologiya, Nahv-sintaksis", "Ikkisi bir xil", "Sarf-fonetika"], c: 0, level: 'C2' },
    { q: "Klassik arab she'riyatida eng mashhur vazn qaysi?", a: ["Rajaz", "Tawil", "Kamil"], c: 1, level: 'C2' }
  ];

  // Generate lesson test (5 questions)
  const generateLessonTest = (lessonId) => {
    const questions = [
      "Bu mavzudagi asosiy tushuncha nima?",
      "Qaysi variant grammatik jihatdan to'g'ri?",
      "Bu so'zning to'g'ri talaffuzi qanday?",
      "Matn kontekstida bu ifoda nimani anglatadi?",
      "Qaysi javob mavzuga mos kelmaydi?"
    ];

    return questions.map((q, i) => ({
      q: `${lessonId}-dars: Savol ${i + 1} - ${q}`,
      a: ["Variant A", "Variant B", "Variant C"],
      c: Math.floor(Math.random() * 3)
    }));
  };

  // Generate level exam (15 questions)
  const generateLevelExam = (levelId) => {
    return Array.from({ length: 15 }, (_, i) => ({
      q: `${levelId} daraja imtihoni: ${i + 1}-savol - Professional darajadagi savol`,
      a: ["Variant A", "Variant B", "Variant C"],
      c: Math.floor(Math.random() * 3)
    }));
  };

  // AI Placement Analysis
  const callAIForPlacement = async (score) => {
    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('https://arabiyya-pro-backend.onrender.com/api/ai/placement-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          score,
          answers: testAnswers
        })
      });

      const data = await response.json();

      if (data.success) {
        setPlacementResult({ level: data.level, feedback: data.feedback });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('AI Error:', error);
      const assignedLevel = score >= 10 ? "C1" : score >= 8 ? "B2" : score >= 6 ? "B1" : score >= 4 ? "A2" : "A1";
      setPlacementResult({
        level: assignedLevel,
        feedback: `DARAJA: ${assignedLevel}\n\nTAHLIL: Sizning natijangiz ${score}/12 to'g'ri javob. Bu ${assignedLevel} darajadan boshlash uchun yaxshi ko'rsatkichdir.\n\nSizning kuchli tomonlaringiz:\n- Asosiy tushunchalarni bilasiz\n- Savollarga diqqat bilan yondashyapsiz\n- O'rganishga tayyor ekansiz\n\nTavsiya: ${assignedLevel} darajadan boshlang va ketma-ket oldinga boring. Har bir dars muhim asos yaratadi!\n\nMuvaffaqiyatlar! 🚀`
      });
    }

    setIsAnalyzing(false);
  };

  // Handle placement test answer
  const handleTestAnswer = (index) => {
    const newAnswers = [...testAnswers, index];
    setTestAnswers(newAnswers);

    if (testStep < placementQuestions.length - 1) {
      setTestStep(testStep + 1);
    } else {
      const correctCount = newAnswers.filter((ans, i) => ans === placementQuestions[i].c).length;
      callAIForPlacement(correctCount);
    }
  };

  // Start learning after placement
  const startLearning = () => {
    setUser({ ...user, level: placementResult.level });
    setView('levels');
  };

  // Handle lesson test
  const handleLessonTestAnswer = async (index) => {
    const currentTest = generateLessonTest(selectedLesson.id);
    const newAnswers = [...lessonTestAnswers, index];
    setLessonTestAnswers(newAnswers);

    if (lessonTestStep < 4) {
      setLessonTestStep(lessonTestStep + 1);
    } else {
      const correctCount = newAnswers.filter((ans, i) => ans === currentTest[i].c).length;

      setIsAnalyzing(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('https://arabiyya-pro-backend.onrender.com/api/ai/lesson-test-analysis', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            lessonTitle: selectedLesson.title,
            score: correctCount,
            totalQuestions: '5'
          })
        });

        const data = await response.json();
        const aiFeedback = data.success ? data.analysis : "Yaxshi ish qildingiz!";

        if (correctCount >= 4) {
          alert(`✅ Ajoyib! ${correctCount}/5 to'g'ri javob\n\n💡 AI Tahlil:\n${aiFeedback}\n\n🎯 Keyingi mavzuga o'tishingiz mumkin!`);
          setCompletedLessons([...completedLessons, `${selectedLevel.id}-${selectedLesson.id}`]);
          setSelectedLesson(null);
          setView('level-lessons');
        } else {
          alert(`📚 ${correctCount}/5 to'g'ri javob (kamida 4 ta kerak)\n\n💡 AI Tahlil:\n${aiFeedback}\n\n🔄 Bu mavzuni yana takrorlang va yangi bilimlarga ega bo'ling!`);
        }
      } catch (error) {
        if (correctCount >= 4) {
          alert(`✅ Tabriklaymiz! ${correctCount}/5 to'g'ri javob. Keyingi mavzuga o'tishingiz mumkin!`);
          setCompletedLessons([...completedLessons, `${selectedLevel.id}-${selectedLesson.id}`]);
          setSelectedLesson(null);
          setView('level-lessons');
        } else {
          alert(`📚 ${correctCount}/5 to'g'ri. Kamida 4 ta to'g'ri javob kerak. Mavzuni takrorlang!`);
        }
      }

      setIsAnalyzing(false);
      setLessonTestAnswers([]);
      setLessonTestStep(0);
    }
  };

  // Handle level exam
  const handleExamAnswer = async (index) => {
    const currentExam = generateLevelExam(selectedLevel.id);
    const newAnswers = [...examAnswers, index];
    setExamAnswers(newAnswers);

    if (examStep < 14) {
      setExamStep(examStep + 1);
    } else {
      const correctCount = newAnswers.filter((ans, i) => ans === currentExam[i].c).length;

      setIsAnalyzing(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('https://arabiyya-pro-backend.onrender.com/api/ai/level-exam-analysis', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            levelId: selectedLevel.id,
            score: correctCount
          })
        });

        const data = await response.json();
        const aiFeedback = data.success ? data.analysis : "Yaxshi natija!";

        if (correctCount >= 13) {
          alert(`🎉 Imtihondan muvaffaqiyatli o'tdingiz! ${correctCount}/15 to'g'ri\n\n💡 AI Professional Tahlil:\n${aiFeedback}\n\n🚀 Keyingi darajaga o'tishingiz mumkin!`);
          setCompletedLevels([...completedLevels, selectedLevel.id]);

          // Certificate for C2 completion
          if (selectedLevel.id === 'C2') {
            setCertificates([...certificates, {
              id: Date.now(),
              name: user.name,
              level: 'C2 - Professional Mastery',
              date: new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' }),
              score: `${Math.round((correctCount / 15) * 100)}%`,
              certificateNumber: `ARABPRO-${Date.now().toString().slice(-8)}`
            }]);
          }

          setView('levels');
        } else {
          alert(`📚 ${correctCount}/15 to'g'ri javob (kamida 13 ta kerak)\n\n💡 AI Professional Tahlil:\n${aiFeedback}\n\n🔄 Bu darajani takrorlash va mustahkamlash tavsiya etiladi.`);
          setView('level-lessons');
        }
      } catch (error) {
        if (correctCount >= 13) {
          alert(`🎉 Imtihondan o'tdingiz! ${correctCount}/15. Keyingi darajaga o'tishingiz mumkin!`);
          setCompletedLevels([...completedLevels, selectedLevel.id]);
          setView('levels');
        } else {
          alert(`📚 ${correctCount}/15 to'g'ri. Kamida 13 ta kerak. Darajani takrorlang.`);
          setView('level-lessons');
        }
      }

      setIsAnalyzing(false);
      setExamAnswers([]);
      setExamStep(0);
    }
  };

  /* === NEW CHAT LOGIC === */
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/ai/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setChats(data.chats);
    } catch (err) { console.error(err); }
  };

  const loadChat = async (id) => {
    try {
      setIsChatLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/ai/chats/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActiveChatId(id);
        // Map messages with ID
        setChatMessages(data.chat.messages.map(m => ({ _id: m._id, role: m.role, content: m.content })));
        setChatView('messages');
      }
      setIsChatLoading(false);
    } catch (err) { console.error(err); setIsChatLoading(false); }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setChatMessages([]);
    setChatView('messages'); // Force view to messages for mobile/desktop split
    setChatInput('');
  };

  const deleteMessage = async (msgId) => {
    if (!activeChatId || !msgId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/ai/chats/${activeChatId}/messages/${msgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChatMessages(prev => prev.filter(m => m._id !== msgId));
      }
    } catch (err) { console.error(err); }
  };

  const editMessage = async (msgId, newContent) => {
    if (!activeChatId || !msgId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/ai/chats/${activeChatId}/messages/${msgId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });
      if (res.ok) {
        setChatMessages(prev => prev.map(m => m._id === msgId ? { ...m, content: newContent } : m));
      }
    } catch (err) { console.error(err); }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm("Haqiqatan ham bu suhbatni o'chirmoqchimisiz?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/ai/chats/${chatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChats(prev => prev.filter(c => c._id !== chatId));
        if (activeChatId === chatId) startNewChat();
      }
    } catch (err) { console.error(err); }
  };

  const clearAllChats = async () => {
    if (!confirm("Barcha suhbatlar tarixini o'chirasizmi? (Qaytarib bo'lmaydi!)")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/ai/chats/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChats([]);
        startNewChat();
      }
    } catch (err) { console.error(err); }
  };

  // Auto-load chats when opened
  useEffect(() => {
    if (showChat) {
      fetchChats();
      if (!activeChatId) setChatView('list');
    }
  }, [showChat]);

  // AI Chat function
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    const tempId = Date.now().toString();
    setChatMessages(prev => [...prev, { _id: tempId, role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body = { message: userMessage };
      if (activeChatId) body.chatId = activeChatId;

      const response = await fetch('https://arabiyya-pro-backend.onrender.com/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      const aiResponse = data.success ? data.response : "Kechirasiz, texnik xatolik yuz berdi.";

      // Update User Message ID
      if (data.userMessageId) {
        setChatMessages(prev => prev.map(m => m._id === tempId ? { ...m, _id: data.userMessageId } : m));
      }

      // Add AI Message
      setChatMessages(prev => [...prev, { _id: data.aiMessageId, role: 'ai', content: aiResponse }]);

      // Update active chat ID if new chat created
      if (data.chatId && !activeChatId) {
        setActiveChatId(data.chatId);
        fetchChats();
      }

    } catch (error) {
      console.error('Chat Error:', error);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: "Uzr, hozirda javob bera olmayman."
      }]);
    }

    setIsChatLoading(false);
  };



  // Fetch admin stats and users
  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch stats
      const statsRes = await fetch('https://arabiyya-pro-backend.onrender.com/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setAdminStats({ ...statsData.stats, recentUsers: statsData.recentUsers });
      }

      // Fetch all users
      const usersRes = await fetch('https://arabiyya-pro-backend.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setAdminUsers(usersData.users);
      }
    } catch (error) {
      console.error('Admin Data Error:', error);
    }
  };

  // Fetch Admin Orders
  const fetchAdminOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminOrders(data.orders);
      }
    } catch (error) {
      console.error('Fetch Orders Error:', error);
    }
  };


  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/submissions/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleGrade = async (status) => {
    if (!editingSubmission) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/submissions/${editingSubmission._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status,
          score: editingSubmission.score,
          comment: editingSubmission.comment
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Topshiriq baholandi!");
        setShowGradeModal(false);
        setEditingSubmission(null);
        fetchSubmissions();
      } else {
        alert("Xatolik: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error grading submission");
    }
  };

  // Approve Order
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('Haqiqatan ham bu buyurtmani tasdiqlaysizmi?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/admin/orders/${orderId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Buyurtma tasdiqlandi!');
        fetchAdminOrders(); // Refresh list
      } else {
        alert('❌ Xatolik: ' + data.message);
      }
    } catch (error) {
      console.error('Approve Error:', error);
      alert('Tizim xatosi');
    }
  };

  // Admin Data Fetching based on Active Tab
  useEffect(() => {
    if (view !== 'admin') return;

    // Refresh data based on tab
    if (adminTab === 'courses') fetchLevels();
    if (adminTab === 'submissions') {
      fetchSubmissions();
      if (levels.length === 0) fetchLevels(); // Dars nomlarini bilish uchun
    }
    if (adminTab === 'orders') fetchAdminOrders();
    if (adminTab === 'dashboard' || adminTab === 'users') fetchAdminStats();

  }, [view, adminTab]);

  // Handle user role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://arabiyya-pro-backend.onrender.com/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Foydalanuvchi roli o'zgartirildi: ${newRole}`);
        fetchAdminStats(); // Refresh data
      } else {
        alert(`❌ Xatolik: ${data.message}`);
      }
    } catch (error) {
      console.error('Role Update Error:', error);
      alert('Tizim xatosi yuz berdi');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId, listUserName) => {
    if (!window.confirm(`Siz rostlarini ham ${listUserName} foydalanuvchisini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://arabiyya-pro-backend.onrender.com/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAdminUsers(adminUsers.filter(u => u._id !== userId));
        setAdminStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          // We can't strictly know if they were active without checking, 
          // but for UI responsiveness we decrement total.
        }));
        // Refresh fully to be sure
        fetchAdminStats();
        alert(`✅ Foydalanuvchi o'chirildi`);
      } else {
        alert(`❌ Xatolik: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete User Error:', error);
      alert('Tizim xatosi yuz berdi');
    }
  };

  useEffect(() => {
    if (view === 'admin') {
      fetchAdminStats();
      if (adminTab === 'orders') {
        fetchAdminOrders();
      }
    }
  }, [view, adminTab]);

  // Restore session on load
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('https://arabiyya-pro-backend.onrender.com/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Session restore error:', error);
          localStorage.removeItem('token');
        }
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 text-white font-sans relative overflow-x-hidden">

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <div onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <BookOpen size={28} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Arabiyya Pro
                </span>
                <span className="text-[10px] font-bold text-white/40 -mt-1 tracking-wider">AI-POWERED PLATFORM</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Kurslar', view: 'levels', icon: GraduationCap },
                { label: 'Sertifikatlar', view: 'certificates', icon: Award },
                { label: 'Yordam', view: 'help', icon: HelpCircle }
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${view === item.view
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {!user ? (
                <button
                  onClick={() => setView('auth')}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur group-hover:blur-lg transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2">
                    <Rocket size={18} />
                    Boshlash
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setView('profile')}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-bold">{user.name}</div>
                      <div className="text-[10px] text-white/50">{user.level || 'Yangi'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUser(null);
                      setView('home');
                      setCompletedLessons([]);
                      setCompletedLevels([]);
                      setCertificates([]);
                    }}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20"
                  >
                    <LogOut size={20} />
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => setView('admin')}
                      className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-all border border-red-500/20"
                      title="Admin Panel"
                    >
                      <Shield size={20} />
                    </button>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/5 backdrop-blur-2xl border-t border-white/10 p-6 space-y-3">
            {[
              { label: 'Kurslar', view: 'levels', icon: GraduationCap },
              { label: 'Sertifikatlar', view: 'certificates', icon: Award },
              { label: 'Yordam', view: 'help', icon: HelpCircle }
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setView(item.view);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      < main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen" >

        {/* ============================================ */}
        {/* HOME PAGE */}
        {/* ============================================ */}
        {
          view === 'home' && (
            <div className="space-y-32">

              {/* Hero Section */}
              <div className="text-center space-y-10 py-16">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl px-8 py-4 rounded-full border border-white/20 mb-6 group hover:scale-105 transition-all duration-300">
                  <Sparkles size={24} className="text-blue-400 animate-pulse" />
                  <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AI bilan professional arab tilini o'rganing
                  </span>
                  <Sparkles size={24} className="text-purple-400 animate-pulse" />
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
                    Arab tilini <br />
                    <span className="relative inline-block">
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 blur-2xl opacity-50 animate-pulse"></span>
                      <span className="relative bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Professional
                      </span>
                    </span>
                    <br />
                    darajada o'rganing
                  </h1>

                  <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-4xl mx-auto font-medium leading-relaxed">
                    Sun'iy intellekt yordamida shaxsiy ta'lim rejangizni yarating. <br className="hidden sm:block" />
                    A1 boshlang'ich darajadan C2 professional darajagacha.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-12">
                  <button
                    onClick={() => setView('auth')}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all duration-300 shadow-2xl flex items-center gap-3">
                      <Rocket size={24} />
                      Bepul Boshlash
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                    </div>
                  </button>

                  <button
                    onClick={() => setView('levels')}
                    className="bg-white/10 backdrop-blur-xl text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/20 hover:border-white/40 flex items-center gap-3"
                  >
                    <BookOpen size={24} />
                    Kurslarni Ko'rish
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
                  {[
                    // { icon: Users, num: '5,000+', label: 'Faol O\'quvchi' }, -> Removed
                    { icon: GraduationCap, num: `${levels.reduce((acc, lvl) => acc + (lvl.lessons?.length || 0), 0)}+`, label: 'Jami Darslar' },
                    { icon: Brain, num: '24/7', label: 'AI Yordamchi' },
                    { icon: Award, num: '100%', label: 'Muvaffaqiyat harakatga bog\'liq' }
                  ].map((stat, i) => (
                    <div key={i} className="group bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                      <stat.icon className="w-10 h-10 mx-auto mb-3 text-blue-400 group-hover:text-purple-400 transition-colors" />
                      <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        {stat.num}
                      </div>
                      <div className="text-white/60 font-bold text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black">Nima uchun Arabiyya Pro?</h2>
                  <p className="text-xl text-white/60">Professional ta'lim platformasining afzalliklari</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    // {
                    //   icon: Target,
                    //   title: 'AI Darajani Aniqlash',
                    //   desc: '12 savollik professional test orqali aniq darajangizni aniqlang va to\'g\'ri boshlang',
                    //   color: 'from-blue-500 to-cyan-500'
                    // }, -> Removed
                    {
                      icon: Brain,
                      title: '24/7 AI Shaxsiy Yordamchi',
                      desc: 'Istalgan vaqtda savol bering va professional javob oling. Grammatika, lug\'at, mashqlar',
                      color: 'from-purple-500 to-pink-500'
                    },
                    {
                      icon: Award,
                      title: 'Sertifikat',
                      desc: 'Har bir darajani tugatgandan so\'ng sertifikat bilan tasdiqlanadi',
                      color: 'from-orange-500 to-red-500'
                    },
                    // {
                    //   icon: Video,
                    //   title: 'HD Video Darslar',
                    //   desc: 'Professional o\'qituvchilar tomonidan tayyorlangan yuqori sifatli video darslar',
                    //   color: 'from-green-500 to-teal-500'
                    // }, -> Removed
                    {
                      icon: Book,
                      title: 'Elektron Kitoblar',
                      desc: 'Har bir dars uchun maxsus tayyorlangan PDF kitoblar va materiallar',
                      color: 'from-indigo-500 to-blue-500'
                    },
                    {
                      icon: TrendingUp,
                      title: 'Progress Tracking',
                      desc: 'Real vaqtda o\'z rivojlanishingizni kuzatib boring va maqsadlarga erishing',
                      color: 'from-yellow-500 to-orange-500'
                    }
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative z-10">
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                          <feature.icon size={32} className="text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                        <p className="text-white/70 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CEFR Levels Preview */}
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black">CEFR Darajalari</h2>
                  <p className="text-xl text-white/60">Boshlang'ichdan professional darajagacha</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {levels.filter(l => l.id !== 'INTRO' && !l.title.includes('Arab Harflari')).map((level, i) => {
                    const isUnlocked = user && (user.role === 'admin' || user.purchasedLevels?.includes(level.id));
                    const isLocked = !isUnlocked;

                    return (
                      <div
                        key={level.id}
                        className={`group relative bg-white/5 backdrop-blur-xl p-8 rounded-3xl border transition-all duration-300 hover:scale-105 cursor-pointer ${!user ? 'border-white/10 hover:bg-white/10' :
                          isLocked ? 'border-white/10 hover:border-red-500/30' : 'border-green-500/30 hover:border-green-500/60 bg-green-500/5'
                          }`}
                        onClick={() => {
                          if (!user) {
                            setView('auth');
                          } else {
                            if (isUnlocked) {
                              setSelectedLevel(level);
                              setView('level-lessons');
                            } else {
                              setSelectedLevel(level);
                              setShowPurchaseModal(true);
                            }
                          }
                        }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-5 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-5xl">{level.icon}</span>
                            <div className="flex flex-col items-end gap-2">
                              {user && (
                                <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${isUnlocked ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                                  }`}>
                                  {isUnlocked ? (
                                    <><CheckCircle2 size={12} /> Ochiq</>
                                  ) : (
                                    <><Lock size={12} /> Yopiq</>
                                  )}
                                </div>
                              )}
                              <div className={`px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r ${level.color} text-white shadow-lg`}>
                                {level.lessons.length} Dars
                              </div>
                            </div>
                          </div>

                          <h3 className="text-2xl font-black mb-3">{level.title}</h3>
                          <p className="text-white/70 mb-4 leading-relaxed">{level.description}</p>

                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                              {/* Duration removed as it's not in level object currently, or replace with generic */}
                              <Play size={16} />
                              <span>Video Darslar</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Call to Action */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-blue-950/80 via-indigo-950/80 to-purple-950/80 backdrop-blur-2xl p-16 rounded-3xl border border-white/10 text-center space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black">Bugun boshlang!</h2>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                      Professional arab tilini o'rganish sayohatingizni AI bilan birga boshlang
                    </p>
                  </div>

                  <button
                    onClick={() => setView('auth')}
                    className="group relative inline-block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl flex items-center gap-3">
                      <Rocket size={28} />
                      Bepul Ro'yxatdan O'tish
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
                    </div>
                  </button>
                </div>
              </div>

            </div>
          )
        }

        {/* ============================================ */}
        {/* AUTH & PLACEMENT TEST PAGE */}
        {/* ============================================ */}
        {
          view === 'auth' && (
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>

                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl">
                  {!user ? (
                    // Registration Form
                    <div className="space-y-10">
                      <div className="text-center space-y-6">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl"></div>
                          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                            <User size={48} className="text-white" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h2 className="text-5xl font-black">Xush kelibsiz!</h2>
                          <p className="text-xl text-white/70">Professional ta'lim sayohatingizni boshlang</p>
                        </div>
                      </div>

                      {/* Google Sign-In Only */}
                      <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-full relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                          <div id="googleDiv" className="relative flex justify-center w-full transform transition-transform duration-300 hover:scale-[1.02]"></div>
                        </div>
                        <p className="text-white/40 text-sm font-medium">
                          Xavfsiz va tezkor kirish
                        </p>
                      </div>

                      <div className="text-center text-sm text-white/50 mt-8">
                        Google orqali kirish bilan siz <a href="#" className="text-blue-400 hover:underline">Foydalanish shartlari</a>ga rozilik bildirasiz
                      </div>
                    </div>
                  ) : !placementResult ? (
                    // Placement Test
                    <div className="space-y-10">
                      {/* Progress Bar */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h2 className="text-3xl font-black flex items-center gap-3">
                            <Target className="text-blue-400" />
                            Darajani Aniqlash Testi
                          </h2>
                          <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20">
                            <span className="text-2xl font-black">{testStep + 1}</span>
                            <span className="text-white/60 font-bold"> / 12</span>
                          </div>
                        </div>

                        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                            style={{ width: `${((testStep + 1) / 12) * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm font-bold text-white/60">
                          <span>Boshlash</span>
                          <span>Tugash</span>
                        </div>
                      </div>

                      {isAnalyzing ? (
                        <div className="py-24 text-center space-y-8">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-blue-500/50 rounded-full blur-2xl animate-pulse"></div>
                            <Loader2 size={80} className="relative animate-spin text-blue-400" strokeWidth={3} />
                          </div>
                          <div className="space-y-3">
                            <p className="text-3xl font-black">AI tahlil qilmoqda...</p>
                            <p className="text-lg text-white/60">Sizning javoblaringiz professional tahlil qilinmoqda</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Question */}
                          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
                                {testStep + 1}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white/60 mb-3">
                                  Savol {testStep + 1} / 12 • {placementQuestions[testStep].level} Daraja
                                </div>
                                <p className="text-2xl font-bold leading-relaxed">{placementQuestions[testStep].q}</p>
                              </div>
                            </div>
                          </div>

                          {/* Answer Options */}
                          <div className="grid gap-5">
                            {placementQuestions[testStep].a.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleTestAnswer(i)}
                                className="group relative w-full p-7 bg-white/5 backdrop-blur-xl rounded-2xl text-left font-bold text-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 transition-all duration-300 flex items-center justify-between border-2 border-white/10 hover:border-blue-400 hover:scale-105"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 flex items-center justify-center font-black transition-all duration-300 shadow-lg">
                                    {String.fromCharCode(65 + i)}
                                  </div>
                                  <span className="group-hover:text-white transition-colors">{opt}</span>
                                </div>
                                <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-blue-400" size={24} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Placement Result
                    <div className="text-center space-y-10">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative w-40 h-40 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl">
                          <Trophy size={80} strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-5xl font-black">Sizning darajangiz</h2>
                        <div className="text-8xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                          {placementResult.level}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-3xl text-left border border-white/20 space-y-5 shadow-xl">
                        <div className="flex items-center gap-3 text-blue-400 font-bold text-lg">
                          <Brain size={24} />
                          <span>AI Professional Tahlil</span>
                        </div>
                        <p className="text-white/90 leading-relaxed text-lg whitespace-pre-line">{placementResult.feedback}</p>
                      </div>

                      <button
                        onClick={startLearning}
                        className="group relative inline-block"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                        <div className="relative px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl flex items-center gap-4">
                          <Rocket size={28} />
                          O'qishni Boshlash
                          <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* ============================================ */}
        {/* LEVELS PAGE */}
        {/* ============================================ */}
        {
          view === 'levels' && (
            <div className="space-y-16">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl animate-pulse"></div>
                  <h2 className="relative text-5xl md:text-6xl font-black">CEFR Darajalari</h2>
                </div>
                <p className="text-2xl text-white/70">Boshlang'ichdan professional darajagacha sayohat</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Special Alphabet Learning Card */}
                <div
                  onClick={() => setView('alphabet-learning')}
                  className="md:col-span-2 lg:col-span-3 relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 cursor-pointer hover:scale-[1.01] transition-all shadow-2xl group overflow-hidden border-2 border-white/20"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <span className="text-9xl font-black text-white">ا ب ت</span>
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                        <BookOpen size={40} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-3xl md:text-4xl font-black text-white">Arab Harflari</h3>
                          <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white border border-white/20 shadow-sm">Bepul</span>
                        </div>
                        <p className="text-lg text-emerald-100 max-w-2xl font-medium">
                          Arab tilini noldan o'rganuvchilar uchun maxsus bo'lim. Harflar, talaffuz va yozish qoidalarini mukammal o'rganing.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-white font-bold group-hover:gap-5 transition-all bg-white/10 w-fit px-6 py-3 rounded-xl hover:bg-white/20">
                      <span>Darslarni Boshlash</span>
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
                {levels.map((lvl, index) => {
                  const isCompleted = completedLevels.includes(lvl.id);
                  const isUnlocked = isLevelUnlocked(lvl.id);
                  const isLocked = user?.role !== 'admin' && !isUnlocked; // Admin uchun barcha ochiq
                  const isActive = user?.level === lvl.id;

                  return (
                    <div
                      key={lvl.id}
                      onClick={() => handleLevelClick(lvl)}
                      className="group relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl border-2 border-white/20"
                    >
                      {/* Vibrant Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${lvl.color} opacity-100`}></div>

                      {/* Animated Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 group-hover:from-black/60 transition-all"></div>

                      {/* Glassmorphism Overlay for Locked */}
                      {isLocked && (
                        <div className="absolute inset-0 backdrop-blur-sm bg-white/10"></div>
                      )}

                      {/* Content */}
                      <div className="relative p-8 space-y-6">
                        {/* Header with Icon and Status */}
                        <div className="flex items-start justify-between">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-5xl shadow-lg border border-white/30">
                            {lvl.icon}
                          </div>

                          {isLocked ? (
                            <div className="flex flex-col gap-2 items-end">
                              <div className="px-4 py-2 bg-amber-500/30 backdrop-blur-xl rounded-xl border border-amber-400/40 flex items-center gap-2 shadow-lg">
                                <Lock size={18} className="text-amber-200" />
                                <span className="text-xs font-black text-amber-100 uppercase tracking-widest">Yopiq</span>
                              </div>
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-emerald-500/30 backdrop-blur-xl rounded-xl border border-emerald-400/40 shadow-lg">
                              <span className="text-xs font-black text-emerald-100 uppercase tracking-widest">Ochiq</span>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="absolute top-8 right-8 p-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 animate-bounce">
                              <CheckCircle2 size={24} className="text-white" />
                            </div>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-4xl font-black text-white drop-shadow-lg">{lvl.id}</h3>
                          </div>
                          <div className="text-2xl font-bold text-white/95 drop-shadow">{lvl.title}</div>
                          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{lvl.description}</p>
                        </div>

                        {/* Lesson Count */}
                        <div className="flex items-center gap-2 text-white/90">
                          <BookOpen size={18} />
                          <span className="text-sm font-bold">{lvl.lessons?.length || 0} ta dars</span>
                        </div>

                        {/* Progress Bar (Only if unlocked) */}
                        {!isLocked && lvl.lessons?.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-white/80 uppercase tracking-wider">
                              <span>Jarayon</span>
                              <span>{Math.round((completedLessons.filter(l => l.startsWith(lvl.id)).length / lvl.lessons.length) * 100) || 0}%</span>
                            </div>
                            <div className="h-2.5 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                              <div
                                className="h-full bg-gradient-to-r from-white to-emerald-200 rounded-full transition-all duration-1000 shadow-lg"
                                style={{ width: `${(completedLessons.filter(l => l.startsWith(lvl.id)).length / lvl.lessons.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <button className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${isLocked
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 border-2 border-amber-400/30'
                          : 'bg-white text-black hover:scale-[1.02] shadow-xl hover:shadow-2xl'
                          }`}>
                          {isLocked ? (
                            <>
                              <Lock size={22} />
                              Sotib Olish
                            </>
                          ) : (
                            <>
                              Kirish
                              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        }

        {/* ============================================ */}
        {/* ALPHABET LEARNING PAGE */}
        {/* ============================================ */}



        {/* ============================================ */}
        {/* MODULE LESSONS PAGE (Modul ichidagi 5 ta dars) */}
        {/* ============================================ */}
        {
          view === 'module-detail' && selectedModule && selectedLevel && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Header */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('level-lessons')}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                  <div className={`inline-block px-4 py-1 rounded-lg bg-gradient-to-r ${selectedLevel.color} text-white font-bold text-xs mb-2`}>
                    {selectedLevel.icon} {selectedLevel.id}
                  </div>
                  <h2 className="text-3xl font-black">{selectedModule.title}</h2>
                  <p className="text-white/60 text-sm">5 ta dars • Har biri 5 sahifadan</p>
                </div>
              </div>

              {/* 5 ta Dars - Modul ichidagi real darslar */}
              <div className="grid md:grid-cols-2 gap-6">
                {selectedModule.lessons && selectedModule.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      if (lesson.title.includes('Yakuniy Imtihon') || lesson.title.includes('Yakuniy Test')) {
                        setSelectedLesson(lesson);
                        setView('level-exam');
                        // Reset exam state if needed
                        setExamStep(0);
                        setExamScore(0);
                        setExamAnswers({});
                      } else {
                        setSelectedLesson(lesson);
                        setLessonTab('video');
                        setView('lesson-detail');
                      }
                    }}
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 cursor-pointer hover:scale-105 hover:shadow-2xl hover:border-white/40 transition-all duration-300"
                  >
                    <div className="p-6 space-y-4">
                      {/* Lesson Number */}
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg bg-gradient-to-br ${selectedLevel.color} text-white`}>
                          {lessonIndex + 1}
                        </div>
                        <ArrowRight size={20} className="text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all" />
                      </div>

                      {/* Lesson Title */}
                      <div>
                        <h3 className="font-black text-xl leading-tight mb-2">{lesson.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Clock size={14} />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>

                      {/* Topics preview */}
                      <div className="flex flex-wrap gap-2">
                        {lesson.topics.slice(0, 3).map((topic, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70">
                            {topic}
                          </span>
                        ))}
                      </div>

                      {/* 5 Sahifa Icons */}
                      <div className="flex gap-2 flex-wrap pt-2 border-t border-white/10">
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📹 Video</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📝 Amaliy</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📖 Nazariy</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">✍️ Uyga</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📊 Test</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* ============================================ */}
        {/* LESSON DETAIL PAGE (5 Sahifa) */}
        {/* ============================================ */}
        {
          view === 'lesson-detail' && selectedLesson && selectedLevel && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Header */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('module-detail')}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                  <div className={`inline-block px-4 py-1 rounded-lg bg-gradient-to-r ${selectedLevel.color} text-white font-bold text-xs mb-2`}>
                    {selectedLevel.icon} {selectedLevel.id}
                  </div>
                  <h2 className="text-3xl font-black">{selectedLesson.title}</h2>
                  <p className="text-white/60 text-sm">5 sahifa • Professional kontent</p>
                </div>
              </div>

              {/* 5 Sahifa Tabs */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10">
                <div className="flex overflow-x-auto gap-2 scrollbar-hide">
                  {[
                    { id: 'kitob', label: '📚 Kitob' },
                    { id: 'amaliy', label: '📝 Amaliy (100b)' },
                    { id: 'nazariy', label: '📖 Nazariy' },
                    { id: 'uyga', label: '✍️ Uyga (100b)' },
                    { id: 'test', label: '📊 Test (100b)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLessonTab(tab.id)}
                      className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${lessonTab === tab.id
                        ? 'bg-white text-black shadow-lg scale-105'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 min-h-[500px]">
                {/* Kitob & Ustoz Tab */}
                {lessonTab === 'kitob' && (
                  <div className="space-y-8 animate-in fade-in duration-300">

                    {/* KITOB SECTION */}
                    <div className="bg-gradient-to-br from-indigo-500/20 to-blue-600/20 p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-40 h-56 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center border-4 border-white/5 relative overflow-hidden group">
                        {/* Book Cover Placeholder */}
                        <BookOpen size={64} className="text-white/40 group-hover:scale-110 transition-transform" />
                        <div className="absolute bottom-0 w-full bg-black/50 text-center text-xs py-2 text-white/80 font-bold">PDF</div>
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                          <h3 className="text-3xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
                            <Download className="text-blue-400" /> Darslik (PDF)
                          </h3>
                          <p className="text-white/60 text-lg">Ushbu dars uchun maxsus tayyorlangan elektron kitobni yuklab oling.</p>
                        </div>

                        {true ? (
                          <a href={selectedLesson.ebookUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-blue-600/30">
                            <Download size={24} /> Yuklab Olish (PDF)
                          </a>
                        ) : (
                          <button disabled className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 text-white/40 rounded-xl font-bold text-lg cursor-not-allowed border border-white/10">
                            <Lock size={24} /> Hozircha mavjud emas
                          </button>
                        )}
                      </div>
                    </div>


                  </div>
                )}

                {/* Nazariy Tab */}
                {lessonTab === 'nazariy' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 leading-relaxed space-y-4">
                      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="text-blue-400" /> Nazariy Ma'lumot
                      </h3>
                      {selectedLesson.theory ? (
                        <div className="whitespace-pre-wrap text-white/90 font-serif leading-loose text-lg">{selectedLesson.theory}</div>
                      ) : (
                        <div className="whitespace-pre-wrap text-white/90">
                          {typeof selectedLesson.content === 'string'
                            ? selectedLesson.content
                            : selectedLesson.content?.mainContent || "Nazariy ma'lumotlar kiritilmagan."}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Amaliy Tab */}
                {lessonTab === 'amaliy' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 leading-relaxed">
                      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <PenTool className="text-yellow-400" /> Amaliy Mashg'ulot
                      </h3>
                      <div className="whitespace-pre-wrap text-white/90 font-serif leading-loose text-lg">
                        {selectedLesson.practice || "Amaliy mashg'ulotlar kiritilmagan."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Uyga Vazifa Tab */}
                {lessonTab === 'uyga' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                        <Home className="text-emerald-400" /> Uyga Vazifa
                      </h3>
                      <div className="whitespace-pre-wrap text-white/90 font-serif leading-loose text-lg min-h-[100px]">
                        {selectedLesson.homework || "Uyga vazifa kiritilmagan."}
                      </div>
                    </div>

                    {(() => {
                      const submission = mySubmissions.find(s =>
                        s.levelId === selectedLevel.id &&
                        s.lessonId === selectedLesson.id &&
                        s.type === 'homework'
                      );

                      if (submission) {
                        return (
                          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 text-center animate-in zoom-in duration-300">
                            <div className="flex flex-col items-center gap-4">
                              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl ${submission.status === 'approved' ? 'bg-green-500 text-white shadow-green-500/50' :
                                submission.status === 'rejected' ? 'bg-red-500 text-white shadow-red-500/50' :
                                  'bg-yellow-500 text-white shadow-yellow-500/50 animate-pulse'
                                }`}>
                                {submission.status === 'approved' ? <CheckCircle size={40} /> :
                                  submission.status === 'rejected' ? <XCircle size={40} /> :
                                    <Clock size={40} />}
                              </div>

                              <div>
                                <h3 className="text-2xl font-black mb-1">
                                  {submission.status === 'approved' ? '✅ Qabul Qilindi!' :
                                    submission.status === 'rejected' ? '❌ Rad Etildi' :
                                      '⏳ Tekshirilmoqda...'}
                                </h3>
                                <p className="text-white/60">
                                  {submission.status === 'approved' ? 'Tabriklaymiz! Vazifangiz mukammal bajarildi.' :
                                    submission.status === 'rejected' ? 'Qayta urinib ko\'ring.' :
                                      'Ustoz tez orada tekshirib, baho qo\'yadi.'}
                                </p>
                              </div>
                            </div>

                            {submission.status === 'approved' && (
                              <div className="bg-green-500/10 p-6 rounded-2xl border border-green-500/20 max-w-sm mx-auto">
                                <div className="text-sm font-bold text-green-400 uppercase tracking-widest mb-1">SIZNING BAHOINGIZ</div>
                                <div className="text-5xl font-black text-white mb-2">{submission.score || 0}</div>
                                <div className="text-white/60 text-xs">100 balldan</div>
                              </div>
                            )}

                            {submission.comment && (
                              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left max-w-2xl mx-auto relative">
                                <MessageCircle className="absolute top-4 right-4 text-white/20" size={24} />
                                <div className="text-xs font-bold text-white/40 uppercase mb-2">USTOZ IZOHI</div>
                                <p className="italic text-lg text-white/90 leading-relaxed">"{submission.comment}"</p>
                              </div>
                            )}

                            {/* Rejected bo'lsa qayta yuklash */}
                            {submission.status === 'rejected' && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center space-y-6 mt-6">
                                <h4 className="text-xl font-bold text-red-400">Qayta Yuklash</h4>
                                <label className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold cursor-pointer inline-flex items-center gap-3 shadow-lg shadow-red-500/20 transition-all">
                                  <Upload size={24} />
                                  Yangi Fayl Yuklash
                                  <input type="file" className="hidden" onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    if (file.size > 10 * 1024 * 1024) return alert("Fayl 10MB dan katta bo'lmasin");

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('levelId', selectedLevel.id);
                                    formData.append('lessonId', selectedLesson.id);

                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/submissions/upload', {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData
                                      });
                                      const data = await res.json();
                                      if (data.success) {
                                        alert("✅ Qayta yuklandi!");
                                        fetchMySubmissions(); // Update status
                                      } else alert("Xatolik: " + data.message);
                                    } catch (err) {
                                      console.error(err);
                                      alert("Server xatosi");
                                    }
                                  }} />
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Agar submission bo'lmasa -> Upload Form
                      return (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-6">
                          <Download size={48} className="mx-auto text-emerald-400" />
                          <div>
                            <h4 className="text-xl font-bold text-emerald-400 mb-2">Vazifani Yuklash</h4>
                            <p className="text-white/60 text-sm max-w-md mx-auto">Vazifani bajarib bo'lgach, uni rasmga olib yoki audio yozib shu yerga yuklang.</p>
                          </div>

                          <div className="flex justify-center">
                            <label className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer flex items-center gap-3 shadow-lg shadow-emerald-500/20">
                              <Upload size={24} />
                              Fayl Tanlash (Rasm/Audio)
                              <input type="file" className="hidden" onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                if (file.size > 10 * 1024 * 1024) return alert("Fayl hajmi 10MB dan oshmasligi kerak!");

                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('levelId', selectedLevel.id);
                                formData.append('lessonId', selectedLesson.id);

                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/submissions/upload', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}` },
                                    body: formData
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert("✅ Vazifa muvaffaqiyatli yuklandi!");
                                    fetchMySubmissions(); // Update UI instantly
                                  }
                                  else alert("Xatolik: " + data.message);
                                } catch (err) {
                                  console.error(err);
                                  alert("Server xatosi: Fayl yuklanmadi");
                                }
                              }} />
                            </label>
                          </div>
                          <p className="text-white/40 text-xs mt-4">Fayl hajmi 10MB dan oshmasligi kerak (JPG, PNG, MP3)</p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Test Tab */}
                {lessonTab === 'test' && (
                  <div className="py-6 space-y-6 animate-in fade-in duration-300">
                    {!lessonTestStarted ? (
                      <div className="text-center py-16 space-y-8 bg-white/5 rounded-3xl border border-white/10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                          <Brain size={48} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white mb-2">📊 Test (100 ball)</h3>
                          <p className="text-white/60 max-w-md mx-auto text-lg">
                            Mavzu bo'yicha {selectedLesson.quiz?.length || 0} ta savol. Bilimingizni sinab ko'ring!
                          </p>
                        </div>

                        {(!selectedLesson.quiz || selectedLesson.quiz.length === 0) ? (
                          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl inline-block text-yellow-200">
                            ⚠️ Bu dars uchun testlar hali kiritilmagan.
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setLessonTestStarted(true);
                              setLessonTestStep(0);
                              setLessonTestAnswers([]);
                            }}
                            className="bg-white text-black px-10 py-4 rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10"
                          >
                            Testni Boshlash 🚀
                          </button>
                        )}
                      </div>
                    ) : (
                      // Test Jarayoni
                      <div className="max-w-3xl mx-auto bg-slate-900 border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${((lessonTestStep + 1) / (selectedLesson.quiz?.length || 1)) * 100}%` }}
                          ></div>
                        </div>

                        {lessonTestStep < (selectedLesson.quiz?.length || 0) ? (
                          <div className="space-y-8 mt-4 animate-in slide-in-from-right-8 duration-300">
                            <div className="flex justify-between items-center text-sm font-bold text-white/50 border-b border-white/10 pb-4">
                              <span>Savol {lessonTestStep + 1} / {selectedLesson.quiz.length}</span>
                              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20">Test Jarayoni</span>
                            </div>

                            <h3 className="text-2xl font-bold leading-relaxed">{selectedLesson.quiz[lessonTestStep].question}</h3>

                            <div className="space-y-3 grid gap-3">
                              {selectedLesson.quiz[lessonTestStep].options.map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    const newAnswers = [...lessonTestAnswers];
                                    newAnswers[lessonTestStep] = idx;
                                    setLessonTestAnswers(newAnswers);

                                    // Keyingi savolga o'tish
                                    if (lessonTestStep + 1 < selectedLesson.quiz.length) {
                                      setTimeout(() => setLessonTestStep(prev => prev + 1), 200);
                                    } else {
                                      // Test tugadi, process results
                                      setTimeout(async () => {
                                        setLessonTestStep(prev => prev + 1);
                                        // Save results to backend
                                        try {
                                          const score = newAnswers.filter((ans, i) => ans === selectedLesson.quiz[i].correctAnswer).length;
                                          const token = localStorage.getItem('token');
                                          await fetch('https://arabiyya-pro-backend.onrender.com/api/submissions/quiz', {
                                            method: 'POST',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({
                                              levelId: selectedLevel.id,
                                              lessonId: selectedLesson.id,
                                              score,
                                              totalQuestions: selectedLesson.quiz.length
                                            })
                                          });
                                        } catch (err) {
                                          console.error("Failed to save quiz result", err);
                                        }
                                      }, 200);
                                    }
                                  }}
                                  className="w-full text-left p-5 rounded-xl bg-white/5 hover:bg-blue-500 hover:text-white border border-white/10 hover:border-blue-500 transition-all font-medium text-lg flex items-center gap-4 group"
                                >
                                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold group-hover:bg-white group-hover:text-blue-500 transition-colors">
                                    {['A', 'B', 'C', 'D'][idx]}
                                  </span>
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-8 py-8 animate-in zoom-in duration-300">
                            <div className="relative inline-block">
                              <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse"></div>
                              <Trophy size={80} className="relative z-10 text-yellow-400 mx-auto drop-shadow-lg" />
                            </div>

                            <div>
                              <h3 className="text-4xl font-black mb-2">Test Yakunlandi!</h3>
                              <p className="text-white/60 text-lg">Sizning natijangiz:</p>
                            </div>

                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                              {lessonTestAnswers.filter((ans, idx) => ans === selectedLesson.quiz[idx].correctAnswer).length}
                              <span className="text-3xl text-white/40 font-bold mx-2">/</span>
                              {selectedLesson.quiz.length}
                            </div>

                            <div className="flex gap-4 justify-center pt-8 border-t border-white/10">
                              <button
                                onClick={() => {
                                  setLessonTestStarted(false);
                                  setLessonTestStep(0);
                                  setLessonTestAnswers([]);
                                }}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                              >
                                Qayta topshirish
                              </button>
                              <button
                                onClick={() => {
                                  // Keyingi darsga o'tish logikasi (agar kerak bo'lsa)
                                  // Yoki shunchaki modalni yopish/boshqa joyga o'tish
                                  setView('level-lessons');
                                }}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
                              >
                                Darslarni davom ettirish
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        }
        {/* ============================================ */}
        {/* LEVEL MODULES PAGE (Modullar ro'yxati) */}
        {/* ============================================ */}
        {
          view === 'level-lessons' && selectedLevel && (
            <div className="space-y-12">
              {/* Header */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setView('levels')}
                  className="group p-4 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all border border-white/20 hover:scale-110"
                >
                  <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex-1">
                  <div className={`inline-block px-6 py-2 rounded-xl bg-gradient-to-r ${selectedLevel.color} text-white font-black text-sm mb-3`}>
                    {selectedLevel.icon} {selectedLevel.id}
                  </div>
                  <h2 className="text-5xl font-black mb-2">{selectedLevel.title}</h2>
                  <p className="text-xl text-white/70">{selectedLevel.description}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black">Sizning jarayoningiz</h3>
                  <span className="text-2xl font-black">
                    {completedLessons.filter(l => l.startsWith(selectedLevel.id)).length} / {selectedLevel.lessons.length}
                  </span>
                </div>
                <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${selectedLevel.color} rounded-full transition-all duration-1000 shadow-lg`}
                    style={{ width: `${(completedLessons.filter(l => l.startsWith(selectedLevel.id)).length / selectedLevel.lessons.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Modules Grid - 5 ta darsdan 1 modul */}
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: Math.ceil(selectedLevel.lessons.length / 5) }, (_, moduleIndex) => {
                  const moduleLessons = selectedLevel.lessons.slice(moduleIndex * 5, (moduleIndex + 1) * 5);
                  const moduleNumber = moduleIndex + 1;
                  const completedCount = moduleLessons.filter(lesson =>
                    completedLessons.includes(`${selectedLevel.id}-${lesson.id}`)
                  ).length;
                  const isCompleted = completedCount === moduleLessons.length;

                  return (
                    <div
                      key={moduleIndex}
                      onClick={() => {
                        setSelectedModule({
                          id: moduleIndex,
                          title: `Modul ${moduleNumber}`,
                          lessons: moduleLessons
                        });
                        setView('module-detail');
                      }}
                      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 cursor-pointer hover:scale-105 hover:shadow-2xl hover:border-white/40 transition-all duration-300"
                    >
                      <div className="relative p-6 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg bg-gradient-to-br ${selectedLevel.color} text-white`}>
                              {moduleNumber}
                            </div>

                            <div>
                              <h3 className="font-black text-2xl leading-tight mb-1">Modul {moduleNumber}</h3>
                              <div className="flex items-center gap-3 text-xs text-white/60">
                                <div className="flex items-center gap-1">
                                  <BookOpen size={14} />
                                  <span>{moduleLessons.length} ta dars</span>
                                </div>
                                {isCompleted && (
                                  <div className="flex items-center gap-1 text-green-400">
                                    <CheckCircle size={14} />
                                    <span>Tugatilgan</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <ArrowRight size={24} className="text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        </div>

                        {/* Progress bar */}
                        {completedCount > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/60">
                              <span>Jarayon</span>
                              <span>{completedCount}/{moduleLessons.length}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${selectedLevel.color} rounded-full transition-all`}
                                style={{ width: `${(completedCount / moduleLessons.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* First 3 lessons preview */}
                        <div className="space-y-2">
                          {moduleLessons.slice(0, 3).map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center gap-2 text-sm text-white/70">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </div>
                              <span className="truncate">{lesson.title}</span>
                            </div>
                          ))}
                          {moduleLessons.length > 3 && (
                            <div className="text-xs text-white/40 font-bold pl-7">
                              + yana {moduleLessons.length - 3} ta dars
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Final Exam Section */}
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                <div className="relative p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Trophy size={40} className="text-yellow-400" />
                        <h3 className="text-3xl font-black text-white">
                          {selectedLevel.id} Daraja Yakuniy Imtihon
                        </h3>
                      </div>
                      <p className="text-white/90 text-lg">
                        15 ta savol • Kamida 13 ta to'g'ri javob kerak • AI professional tahlil
                      </p>
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>~30 daqiqa</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain size={16} />
                          <span>AI Tahlil</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setView('level-exam')}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-white rounded-2xl blur group-hover:blur-lg transition-all"></div>
                      <div className="relative px-8 py-4 bg-white text-purple-600 rounded-2xl font-black text-lg hover:scale-110 transition-all shadow-xl flex items-center gap-3">
                        <Trophy size={24} />
                        Imtihon Topshirish
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }


        {/* ============================================ */}
        {/* LESSON TEST PAGE */}
        {/* ============================================ */}
        {
          view === 'lesson-test' && selectedLesson && (
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>

                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl">
                  <div className="space-y-10">
                    {/* Progress */}
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-3xl font-black mb-2">{selectedLesson.title}</h2>
                          <p className="text-white/60 font-bold">Dars Testi</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black">{lessonTestStep + 1}/5</div>
                          <div className="text-sm text-white/60">Savol</div>
                        </div>
                      </div>

                      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-700 shadow-lg"
                          style={{ width: `${((lessonTestStep + 1) / 5) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {isAnalyzing ? (
                      <div className="py-24 text-center space-y-8">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-blue-500/50 rounded-full blur-2xl animate-pulse"></div>
                          <Loader2 size={80} className="relative animate-spin text-blue-400" strokeWidth={3} />
                        </div>
                        <div className="space-y-3">
                          <p className="text-3xl font-black">AI natijani tahlil qilmoqda...</p>
                          <p className="text-lg text-white/60">Sizning javoblaringiz baholanmoqda</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Question */}
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl">
                          <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
                              {lessonTestStep + 1}
                            </div>
                            <p className="text-2xl font-bold leading-relaxed flex-1">
                              {generateLessonTest(selectedLesson.id)[lessonTestStep].q}
                            </p>
                          </div>
                        </div>

                        {/* Answers */}
                        <div className="grid gap-5">
                          {generateLessonTest(selectedLesson.id)[lessonTestStep].a.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleLessonTestAnswer(i)}
                              className="group relative w-full p-7 bg-white/5 backdrop-blur-xl rounded-2xl text-left font-bold text-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 transition-all duration-300 flex items-center justify-between border-2 border-white/10 hover:border-blue-400 hover:scale-105"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 flex items-center justify-center font-black transition-all shadow-lg">
                                  {String.fromCharCode(65 + i)}
                                </div>
                                <span>{opt}</span>
                              </div>
                              <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-blue-400" size={24} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* ============================================ */}
        {/* LEVEL EXAM PAGE */}
        {/* ============================================ */}
        {
          view === 'level-exam' && selectedLevel && (
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-3xl blur-3xl"></div>

                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl">
                  <div className="space-y-10">
                    {/* Progress */}
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Trophy className="text-yellow-400" size={40} />
                          <div>
                            <h2 className="text-3xl font-black">{selectedLevel.id} Imtihon</h2>
                            <p className="text-white/60 font-bold">Yakuniy Baholash</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black">{examStep + 1}/15</div>
                          <div className="text-sm text-white/60">Savol</div>
                        </div>
                      </div>

                      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-700 shadow-lg"
                          style={{ width: `${((examStep + 1) / 15) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm font-bold text-white/60">
                        <span>O'tish bali: 13/15</span>
                        <span>AI Professional Tahlil</span>
                      </div>
                    </div>

                    {isAnalyzing ? (
                      <div className="py-24 text-center space-y-8">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-purple-500/50 rounded-full blur-2xl animate-pulse"></div>
                          <Loader2 size={80} className="relative animate-spin text-purple-400" strokeWidth={3} />
                        </div>
                        <div className="space-y-3">
                          <p className="text-3xl font-black">AI imtihonni tahlil qilmoqda...</p>
                          <p className="text-lg text-white/60">Professional baholash jarayoni</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Question */}
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
                              {examStep + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-purple-400 mb-3">
                                Imtihon savoli {examStep + 1} / 15
                              </div>
                              <p className="text-2xl font-bold leading-relaxed">
                                {generateLevelExam(selectedLevel.id)[examStep].q}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Answers */}
                        <div className="grid gap-5">
                          {generateLevelExam(selectedLevel.id)[examStep].a.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleExamAnswer(i)}
                              className="group relative w-full p-7 bg-white/5 backdrop-blur-xl rounded-2xl text-left font-bold text-lg hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-600/20 transition-all duration-300 flex items-center justify-between border-2 border-white/10 hover:border-purple-400 hover:scale-105"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-600 flex items-center justify-center font-black transition-all shadow-lg">
                                  {String.fromCharCode(65 + i)}
                                </div>
                                <span>{opt}</span>
                              </div>
                              <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-purple-400" size={24} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* ============================================ */}
        {/* CERTIFICATES PAGE */}
        {/* ============================================ */}
        {
          view === 'certificates' && (
            <div className="space-y-16">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl blur-3xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <Award size={48} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black">Sertifikatlar</h2>
                <p className="text-2xl text-white/70">Sizning yutuqlaringiz va muvaffaqiyatlaringiz</p>
              </div>

              {certificates.length === 0 ? (
                <div className="text-center py-24 space-y-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white/20">
                      <Award size={80} className="text-white/30" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black">Hali sertifikat yo'q</h3>
                    <p className="text-xl text-white/60 max-w-lg mx-auto">
                      Barcha darajalarni muvaffaqiyatli tugatib professional sertifikat oling
                    </p>
                  </div>
                  <button
                    onClick={() => setView('levels')}
                    className="group relative inline-block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur group-hover:blur-lg transition-all"></div>
                    <div className="relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                      <Rocket size={24} />
                      Kursga Qaytish
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-10">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="group relative overflow-hidden rounded-3xl"
                    >
                      {/* Certificate Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600"></div>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                      {/* Content */}
                      <div className="relative p-12 space-y-8">
                        {/* Top Decoration */}
                        <div className="flex justify-between items-start">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/30">
                            <Award size={40} className="text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-white/80 text-sm font-bold mb-1">Sertifikat №</div>
                            <div className="text-white font-black text-lg">{cert.certificateNumber}</div>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="text-center space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-white/90 text-lg font-bold">Sertifikat berildi</h4>
                            <h3 className="text-4xl font-black text-white">{cert.name}</h3>
                          </div>

                          <div className="py-6 px-8 bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/30">
                            <div className="text-3xl font-black text-white mb-2">{cert.level}</div>
                            <div className="text-white/90 font-bold">Arab Tili Professional Kursi</div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-white">
                            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl">
                              <div className="text-2xl font-black">{cert.score}</div>
                              <div className="text-sm font-bold text-white/80">Natija</div>
                            </div>
                            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl">
                              <div className="text-sm font-black">{cert.date}</div>
                              <div className="text-xs font-bold text-white/80">Sana</div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                          <button className="flex-1 py-4 bg-white text-orange-600 rounded-xl font-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                            <Download size={20} />
                            Yuklab Olish
                          </button>
                          <button className="flex-1 py-4 bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 rounded-xl font-black hover:scale-105 transition-all flex items-center justify-center gap-2">
                            <Send size={20} />
                            Ulashish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }

        {/* ============================================ */}
        {/* PROFILE PAGE */}
        {/* ============================================ */}
        {
          view === 'profile' && user && (
            <div className="max-w-5xl mx-auto space-y-10">
              {/* Profile Header */}
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"></div>
                <div className="relative p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-white rounded-full blur-2xl"></div>
                      <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
                        <User size={64} className="text-blue-600" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-4xl font-black text-white mb-2">{user.name}</h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl text-white font-bold border border-white/30">
                          {user.level || 'Yangi O\'quvchi'}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl text-white font-bold border border-white/30">
                          {completedLevels.length} Daraja
                        </span>
                      </div>
                      <p className="text-white/90 max-w-2xl">
                        Professional arab tili o'rganish sayohatingizda muvaffaqiyatlar!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    icon: BookOpen,
                    value: completedLessons.length,
                    label: 'Tugatilgan Darslar',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: Trophy,
                    value: completedLevels.length,
                    label: 'Tugatilgan Darajalar',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: Award,
                    value: certificates.length,
                    label: 'Sertifikatlar',
                    color: 'from-yellow-500 to-orange-500'
                  },
                  {
                    icon: Target,
                    value: `${Math.round((completedLessons.length / (levels.reduce((acc, l) => acc + l.lessons.length, 0))) * 100)}%`,
                    label: 'Umumiy Progress',
                    color: 'from-purple-500 to-pink-500'
                  }
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-3xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90`}></div>
                    <div className="relative p-8 text-center space-y-3">
                      <stat.icon className="w-12 h-12 mx-auto text-white group-hover:scale-110 transition-all" />
                      <div className="text-4xl font-black text-white">{stat.value}</div>
                      <div className="text-sm font-bold text-white/90">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <TrendingUp className="text-blue-400" />
                  So'nggi Faoliyat
                </h3>

                <div className="space-y-4">
                  {completedLessons.slice(-5).reverse().map((lessonKey, i) => {
                    const [levelId, lessonId] = lessonKey.split('-');
                    const level = levels.find(l => l.id === levelId);
                    const lesson = level?.lessons.find(l => l.id === parseInt(lessonId));

                    return lesson ? (
                      <div key={i} className="flex items-center gap-4 p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <CheckCircle className="text-green-400" size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{lesson.title}</h4>
                          <p className="text-sm text-white/60">{level.title}</p>
                        </div>
                        <span className="text-xs font-bold text-white/50">Tugatilgan</span>
                      </div>
                    ) : null;
                  })}

                  {completedLessons.length === 0 && (
                    <div className="text-center py-12 text-white/50">
                      <p>Hali faoliyat yo'q. O'qishni boshlang!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* ============================================ */}
        {/* HELP PAGE */}
        {/* ============================================ */}
        {
          view === 'help' && (
            <div className="max-w-6xl mx-auto space-y-16">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <HelpCircle size={48} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black">Yordam Markazi</h2>
                <p className="text-2xl text-white/70">Tez-tez so'raladigan savollar</p>
              </div>

              {/* FAQ Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Target,
                    title: 'Darajani aniqlash testi qanday ishlaydi?',
                    desc: '12 savollik professional test har bir CEFR darajasidan (A1, A2, B1, B2, C1, C2) 2 tadan savolni o\'z ichiga oladi. AI sizning javoblaringizni chuqur tahlil qilib, eng mos darajani belgilaydi va batafsil tavsiyalar beradi.',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: Brain,
                    title: '24/7 AI Chat qanday yordam beradi?',
                    desc: 'Professional AI yordamchi har doim tayyor. Grammatika qoidalari, lug\'at, talaffuz, mashqlar va boshqa barcha savollaringizga darhol javob olasiz. Har bir savol uchun batafsil tushuntirish va misollar beriladi.',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: BookOpen,
                    title: 'Har bir darsda qanday materiallar bor?',
                    desc: 'Har bir darsda: HD video dars, professional elektron kitob (PDF), amaliy mashqlar, interaktiv testlar va uy vazifalari mavjud. Barcha materiallar yuklab olinadi va offline foydalanish mumkin.',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: ClipboardCheck,
                    title: 'Dars testlari qanday baholanadi?',
                    desc: '5 ta professional savoldan iborat test. Kamida 4 ta to\'g\'ri javob kerak. AI har bir testdan keyin batafsil tahlil va tavsiyalar beradi. Test natijalari real vaqtda saqlanadi.',
                    color: 'from-orange-500 to-red-500'
                  },
                  {
                    icon: Trophy,
                    title: 'Daraja imtihonlari qanday o\'tkaziladi?',
                    desc: 'Har bir daraja oxirida 15 savollik professional imtihon. Kamida 13 ta to\'g\'ri javob kerakимtихонни topshirilgandan keyin AI batafsil tahlil va keyingi qadamlar bo\'yicha maslahat beradi.',
                    color: 'from-indigo-500 to-purple-500'
                  },
                  {
                    icon: Award,
                    title: 'Sertifikat qanday olinadi?',
                    desc: 'Har bir darajani (A1 dan C2 gacha) muvaffaqiyatli tugatganingizda professional rasmiy sertifikat beriladi. Sertifikatda sizning natijangiz, sanasi va noyob raqami ko\'rsatiladi.',
                    color: 'from-yellow-500 to-orange-500'
                  },
                  {
                    icon: Shield,
                    title: 'Ma\'lumotlar xavfsizligi',
                    desc: 'Barcha shaxsiy ma\'lumotlaringiz, o\'quv jarayoningiz va natijalaringiz xavfsiz shifrlangan va maxfiy hisoblanadi. Sizning ma\'lumotlaringiz hech qachon uchinchi shaxslarga berilmaydi.',
                    color: 'from-red-500 to-pink-500'
                  },
                  {
                    icon: Zap,
                    title: 'Qancha vaqtda o\'rganish mumkin?',
                    desc: 'O\'rganish tezligi sizning imkoniyatlaringizga bog\'liq. O\'rtacha: A1-A2 (2-4 oy), B1-B2 (4-6 oy), C1-C2 (6-10 oy). Siz o\'z jadvalingiz bo\'yicha o\'rganishingiz mumkin.',
                    color: 'from-cyan-500 to-blue-500'
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-105"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                    <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all h-full">
                      <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                        <item.icon size={32} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xl font-black mb-4">{item.title}</h3>
                      <p className="text-white/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Section */}
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"></div>
                <div className="relative p-12 text-center space-y-6">
                  <h3 className="text-3xl font-black text-white">Yana savol bormi?</h3>
                  <p className="text-xl text-white/90 max-w-2xl mx-auto">
                    Bizning 24/7 AI yordamchimiz sizga yordam berishga tayyor!
                  </p>
                  <button
                    onClick={() => setShowChat(true)}
                    className="group relative inline-block"
                  >
                    <div className="absolute inset-0 bg-white rounded-2xl blur group-hover:blur-lg transition-all"></div>
                    <div className="relative px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg hover:scale-110 transition-all shadow-2xl flex items-center gap-3">
                      <MessageCircle size={24} />
                      AI Chat Ochish
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )
        }


        {/* ============================================ */}
        {/* PROFILE PAGE */}
        {/* ============================================ */}
        {
          view === 'profile' && user && (
            <div className="max-w-6xl mx-auto space-y-12">

              {/* Profile Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/10">
                    <User size={48} className="text-white" />
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl font-black">{user.name}</h2>
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                      <span className="px-4 py-2 bg-white/10 rounded-xl font-bold text-blue-300 border border-white/10 flex items-center gap-2">
                        <Target size={18} />
                        Daraja: {user.currentLevel || "Aniqlanmagan"}
                      </span>
                      <span className="px-4 py-2 bg-white/10 rounded-xl font-bold text-purple-300 border border-white/10 flex items-center gap-2">
                        <User size={18} />
                        ID: {user.id ? user.id.slice(-6).toUpperCase() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Placement Test Result */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                      <Target size={24} />
                    </div>
                    <h3 className="text-xl font-black">Test Natijasi</h3>
                  </div>
                  <div className="text-3xl font-black">{user.placementTestScore ?? 0}/12</div>
                  <p className="text-white/60 text-sm font-bold">To'g'ri javoblar</p>
                </div>

                {/* Completed Levels */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                      <Trophy size={24} />
                    </div>
                    <h3 className="text-xl font-black">Tugatilgan Darajalar</h3>
                  </div>
                  <div className="text-3xl font-black">{user.completedLevels?.length || 0}</div>
                  <p className="text-white/60 text-sm font-bold">Muvaffaqiyatli yakunlandi</p>
                </div>

                {/* Chat Messages Count */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400">
                      <MessageCircle size={24} />
                    </div>
                    <h3 className="text-xl font-black">AI Suhbatlar</h3>
                  </div>
                  <div className="text-3xl font-black">{chatMessages.length}</div>
                  <p className="text-white/60 text-sm font-bold">Xabarlar almashinuvi</p>
                </div>
              </div>

              {/* Chat History Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <MessageCircle className="text-blue-400" />
                  So'nggi AI Suhbatlari
                </h3>

                {chatMessages.length > 0 ? (
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 max-h-[500px] overflow-y-auto space-y-4 custom-scrollbar">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-2 p-4 rounded-xl ${msg.role === 'user' ? 'bg-white/5 border border-white/5 ml-auto max-w-[80%]' : 'bg-blue-500/10 border border-blue-500/20 mr-auto max-w-[80%]'}`}>
                        <div className="flex items-center gap-2 text-xs font-bold opacity-50 mb-1">
                          {msg.role === 'user' ? <User size={12} /> : <Brain size={12} />}
                          {msg.role === 'user' ? 'Siz' : 'AI Yordamchi'}
                          <span>•</span>
                          <span>Hozirgina</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center text-white/40 font-bold">
                    Hozircha faol suhbatlar yo'q
                  </div>
                )}
              </div>

            </div>
          )
        }


        {/* ============================================ */}
        {/* ADMIN PANEL */}
        {/* ============================================ */}
        {
          view === 'admin' && user && user.role === 'admin' && (
            <div className="max-w-7xl mx-auto min-h-[600px] flex gap-8">

              {/* Sidebar Navigation */}
              <div className="w-64 flex-shrink-0 hidden md:block">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sticky top-32 space-y-2">
                  <div className="px-4 py-3 mb-2">
                    <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider">Menu</h3>
                  </div>
                  {[
                    { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
                    { id: 'orders', label: 'Buyurtmalar', icon: ClipboardCheck },
                    { id: 'submissions', label: 'Topshiriqlar', icon: CheckCircle2 },
                    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
                    { id: 'courses', label: 'Kurslar', icon: BookOpen },
                    { id: 'settings', label: 'Sozlamalar', icon: Settings },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${adminTab === item.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 space-y-8">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                      {adminTab === 'dashboard' && <LayoutDashboard className="text-blue-400" size={32} />}
                      {adminTab === 'orders' && <ClipboardCheck className="text-blue-400" size={32} />}
                      {adminTab === 'submissions' && <CheckCircle2 className="text-blue-400" size={32} />}
                      {adminTab === 'users' && <Users className="text-blue-400" size={32} />}
                      {adminTab === 'courses' && <BookOpen className="text-blue-400" size={32} />}
                      {adminTab === 'settings' && <Settings className="text-blue-400" size={32} />}
                      {adminTab === 'dashboard' ? 'Boshqaruv Paneli' :
                        adminTab === 'orders' ? 'Buyurtmalar' :
                          adminTab === 'submissions' ? 'Topshiriqlar' :
                            adminTab === 'users' ? 'Foydalanuvchilar' :
                              adminTab === 'courses' ? 'Kurslar' : 'Sozlamalar'}
                    </h2>
                    <p className="text-white/60">
                      {adminTab === 'dashboard' ? 'Platforma statistikasi va umumiy ko\'rsatkichlar' :
                        adminTab === 'orders' ? 'Yangi kelib tushgan to\'lovlar va buyurtmalar' :
                          adminTab === 'submissions' ? 'O\'quvchilarning uyga vazifalari va test natijalari' :
                            adminTab === 'users' ? 'Foydalanuvchilarni boshqarish va nazorat qilish' :
                              adminTab === 'courses' ? 'O\'quv dasturlari va darslar ro\'yxati' : 'Tizim sozlamalari'}
                    </p>
                  </div>
                  <button
                    onClick={fetchAdminStats}
                    className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                    title="Yangilash"
                  >
                    <TrendingUp size={20} />
                  </button>
                </div>

                {adminStats ? (
                  <>
                    {/* DASHBOARD TAB */}
                    {adminTab === 'dashboard' && (
                      <div className="space-y-8">
                        <div className="grid md:grid-cols-4 gap-6">
                          {[
                            { label: "Jami Foydalanuvchilar", val: adminStats.totalUsers, icon: Users, color: "blue" },
                            { label: "Faol Foydalanuvchilar", val: adminStats.activeUsers, icon: Zap, color: "green" },
                            { label: "Tugatilgan Darslar", val: adminStats.totalCompletedLessons, icon: BookOpen, color: "purple" },
                            { label: "Sertifikatlar", val: adminStats.totalCertificates, icon: Award, color: "orange" }
                          ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:scale-105 transition-all">
                              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-${stat.color}-500 rounded-bl-3xl`}>
                                <stat.icon size={64} />
                              </div>
                              <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-2xl flex items-center justify-center text-${stat.color}-400 mb-4`}>
                                <stat.icon size={24} />
                              </div>
                              <div className="text-3xl font-black mb-1">{stat.val}</div>
                              <div className="text-white/60 font-bold text-sm">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                              <TrendingUp size={20} className="text-green-400" />
                              So'ngi Faollik
                            </h3>
                            <div className="space-y-4">
                              {adminStats.recentUsers && adminStats.recentUsers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xs">
                                      {u.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-sm">{u.name}</div>
                                      <div className="text-xs text-white/40">Yangi a'zo</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-white/40 font-mono">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10">
                              <h3 className="text-2xl font-black mb-2">Arabiyya Pro</h3>
                              <p className="text-white/80 text-sm mb-6">Tizim holati barqaror. Barcha xizmatlar ishlamoqda.</p>
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-md">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Online v1.2.0
                              </div>
                            </div>
                            <Sparkles className="absolute bottom-4 right-4 text-white/20 w-32 h-32" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ORDERS TAB */}
                    {adminTab === 'orders' && (
                      <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <ClipboardCheck className="text-blue-400" />
                            Barcha Buyurtmalar
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">Foydalanuvchi</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">Daraja</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">Summa</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">Holat</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">Isbot</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase text-right">Amallar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {adminOrders.length === 0 ? (
                                  <tr>
                                    <td colSpan="6" className="p-8 text-center text-white/40 font-bold">
                                      Hozircha buyurtmalar yo'q
                                    </td>
                                  </tr>
                                ) : (
                                  adminOrders.map((order, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                      <td className="p-4">
                                        <div className="font-bold">{order.user?.name || 'Noma\'lum'}</div>
                                        <div className="text-xs text-white/40">{order.user?.email}</div>
                                      </td>
                                      <td className="p-4 font-black text-xl text-blue-400">{order.levelId}</td>
                                      <td className="p-4 font-mono">{order.amount?.toLocaleString()} so'm</td>
                                      <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                          order.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                          }`}>
                                          {order.status}
                                        </span>
                                      </td>
                                      <td className="p-4 text-sm text-white/60 truncate max-w-[200px]" title={order.transactionProof}>
                                        {order.transactionProof || 'N/A'}
                                      </td>
                                      <td className="p-4 text-right">
                                        {order.status === 'pending' && (
                                          <button
                                            onClick={() => handleApproveOrder(order._id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                          >
                                            Tasdiqlash
                                          </button>
                                        )}
                                        {order.status === 'approved' && (
                                          <span className="text-green-500 flex items-center justify-end gap-1 font-bold text-sm">
                                            <CheckCircle size={16} /> Tasdiqlangan
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBMISSIONS TAB */}
                    {adminTab === 'submissions' && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                          <h3 className="text-xl font-bold flex items-center gap-3">
                            <CheckCircle2 className="text-blue-400" />
                            Barcha Topshiriqlar
                          </h3>
                          <button onClick={fetchSubmissions} className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors" title="Yangilash">
                            <TrendingUp size={20} />
                          </button>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10 text-white/60 text-xs uppercase font-bold">
                              <tr>
                                <th className="p-4">O'quvchi</th>
                                <th className="p-4">Dars</th>
                                <th className="p-4">Turi</th>
                                <th className="p-4">Natija</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Amal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {submissions.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-white/40">Hozircha topshiriqlar yo'q</td></tr>
                              ) : (
                                submissions.map((sub) => {
                                  const level = levels.find(l => l.id === sub.levelId);
                                  const lesson = level?.lessons.find(l => l.id === sub.lessonId);
                                  return (
                                    <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                                      <td className="p-4">
                                        <div className="font-bold">{sub.user?.name || "Noma'lum"}</div>
                                        <div className="text-xs text-white/40">{sub.user?.email}</div>
                                      </td>
                                      <td className="p-4 text-sm">
                                        <div className="font-bold text-white">{lesson ? lesson.title : sub.lessonId}</div>
                                        <div className="text-white/40 text-xs font-mono">{level ? level.title : sub.levelId}</div>
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${sub.type === 'quiz' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                          {sub.type}
                                        </span>
                                      </td>
                                      <td className="p-4">
                                        {sub.type === 'quiz' ? (
                                          <span className="font-bold text-lg">{sub.score} ball</span>
                                        ) : (
                                          sub.fileUrl ? (
                                            <a href={`https://arabiyya-pro-backend.onrender.com${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                              <Download size={14} /> Fayl
                                            </a>
                                          ) : <span className="text-white/40">Fayl yo'q</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${sub.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                          sub.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                          }`}>
                                          {sub.status}
                                        </span>
                                      </td>
                                      <td className="p-4 text-right">
                                        <button
                                          onClick={() => {
                                            setEditingSubmission(sub);
                                            setShowGradeModal(true);
                                          }}
                                          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                                        >
                                          Baholash
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* GRADE MODAL */}
                        {showGradeModal && editingSubmission && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-[#0f172a] border border-white/20 rounded-3xl p-8 max-w-lg w-full space-y-6 relative shadow-2xl">
                              <button onClick={() => setShowGradeModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={24} /></button>

                              <h3 className="text-2xl font-black mb-4 border-b border-white/10 pb-4">Topshiriqni Baholash</h3>

                              <div className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-xl">
                                  <div className="text-xs font-bold text-white/40 uppercase mb-1">O'quvchi</div>
                                  <div className="text-lg font-bold">{editingSubmission.user?.name}</div>
                                  <div className="text-white/60 text-xs">{editingSubmission.user?.email}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white/5 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-white/40 uppercase mb-1">Turi</div>
                                    <div className="font-mono text-blue-300">{editingSubmission.type}</div>
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-white/40 uppercase mb-1">Status</div>
                                    <div className="font-bold uppercase">{editingSubmission.status}</div>
                                  </div>
                                </div>

                                {editingSubmission.type === 'homework' && editingSubmission.fileUrl && (
                                  <div>
                                    <label className="text-xs font-bold text-white/40 uppercase mb-1 block">YUKLANGAN FAYL</label>
                                    <a href={`https://arabiyya-pro-backend.onrender.com${editingSubmission.fileUrl}`} target="_blank" rel="noreferrer" className="w-full bg-blue-600/20 text-blue-400 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-colors border border-blue-500/20 font-bold">
                                      <Download size={18} /> Yuklab olish / Ko'rish
                                    </a>
                                  </div>
                                )}

                                <div>
                                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Baho (Ball)</label>
                                  <input
                                    type="number"
                                    value={editingSubmission.score || 0}
                                    onChange={(e) => setEditingSubmission({ ...editingSubmission, score: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xl focus:border-blue-500 transition-colors"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Ustoz Izohi</label>
                                  <textarea
                                    value={editingSubmission.comment || ''}
                                    onChange={(e) => setEditingSubmission({ ...editingSubmission, comment: e.target.value })}
                                    placeholder="O'quvchiga izoh qoldiring..."
                                    className="w-full h-24 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:border-blue-500 transition-colors"
                                  ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                  <button
                                    onClick={() => handleGrade('rejected')}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl transition-colors border border-red-500/20"
                                  >
                                    Rad etish ❌
                                  </button>
                                  <button
                                    onClick={() => handleGrade('approved')}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20"
                                  >
                                    Tasdiqlash ✅
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* USERS TAB */}
                    {adminTab === 'users' && (
                      <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                            <div className="relative w-full md:w-96">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-white/40" />
                              </div>
                              <input
                                type="text"
                                placeholder="Ism yoki email bo'yicha qidirish..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-black/20 text-white placeholder-white/40 focus:outline-none focus:bg-black/40 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                              />
                            </div>
                            <div className="text-sm text-white/40 font-bold">
                              Jami: {adminUsers.length} ta
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">Foydalanuvchi</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">Email</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">Daraja</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">Rol</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider text-right">Amallar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {adminUsers
                                  .filter(u =>
                                    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                  )
                                  .map((u, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                      <td className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                            {u.name.charAt(0)}
                                          </div>
                                          <div>
                                            <div className="font-bold text-white">{u.name}</div>
                                            <div className="text-[10px] text-white/40 font-mono">ID: {u._id.slice(-6).toUpperCase()}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4 text-white/70 text-sm font-medium">{u.email}</td>
                                      <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${u.currentLevel ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/10 text-white/40 border-white/10'
                                          }`}>
                                          {u.currentLevel || 'N/A'}
                                        </span>
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${u.role === 'admin'
                                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                          }`}>
                                          {u.role}
                                        </span>
                                      </td>
                                      <td className="p-4 text-right">
                                        {u._id !== user.id && (
                                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Daraja berish tugmasi */}
                                            <button
                                              onClick={() => {
                                                setGrantingLevelTo(u);
                                                setShowGrantLevelModal(true);
                                              }}
                                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/20 transition-all flex items-center gap-1"
                                              title="Bepul daraja berish"
                                            >
                                              <Gift size={14} />
                                              Daraja berish
                                            </button>

                                            <button
                                              onClick={() => handleRoleUpdate(u._id, u.role === 'admin' ? 'user' : 'admin')}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.role === 'admin'
                                                ? 'bg-white/10 text-white hover:bg-white/20'
                                                : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/20'
                                                }`}
                                            >
                                              {u.role === 'admin' ? 'User qilish' : 'Admin qilish'}
                                            </button>
                                            <button
                                              onClick={() => handleDeleteUser(u._id, u.name)}
                                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                                              title="O'chirish"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COURSES TAB */}
                    {adminTab === 'courses' && (
                      <div className="space-y-6">
                        {!editingLevel ? (
                          // VIEW MODE: List of Levels
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {levels.map((level) => (
                              <div key={level.id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all">
                                <div className={`h-2 bg-gradient-to-r ${level.color}`}></div>
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">{level.icon}</div>
                                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold border border-white/10">
                                      {Math.ceil(level.lessons.length / 5)} ta modul • {level.lessons.length} dars
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-black mb-2">{level.title}</h3>
                                  <p className="text-sm text-white/60 mb-6 line-clamp-2">{level.description}</p>

                                  <div className="space-y-2">
                                    {level.lessons.slice(0, 3).map((lesson, idx) => (
                                      <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-xs text-white/70">
                                        <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">
                                          {idx + 1}
                                        </div>
                                        <span className="truncate">{lesson.title}</span>
                                      </div>
                                    ))}
                                    {level.lessons.length > 3 && (
                                      <div className="text-center text-xs text-white/40 py-1 font-bold">
                                        + yana {level.lessons.length - 3} ta dars
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => setEditingLevel(level)}
                                    className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                  >
                                    <Settings size={16} />
                                    Boshqarish
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // EDIT MODE: Detailed Lesson Management
                          <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => setEditingLevel(null)}
                                  className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                >
                                  <ArrowLeft size={24} />
                                </button>
                                <div>
                                  <h3 className="text-2xl font-black flex items-center gap-3">
                                    <span className="text-3xl">{editingLevel.icon}</span>
                                    {editingLevel.title}
                                  </h3>
                                  <p className="text-white/60 text-sm">Darslarni boshqarish</p>
                                </div>
                              </div>
                              <div className={`px-4 py-2 rounded-xl text-xs font-bold border bg-white/5 border-white/10`}>
                                {editingLevel.lessons.length} ta dars
                              </div>
                            </div>

                            {/* Add New Lesson Form */}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-green-400" />
                                Yangi dars qo'shish
                              </h4>
                              <div className="grid md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                  <input
                                    type="text"
                                    placeholder="Dars mavzusi (Sarlavha)"
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                                    value={newLessonData.title}
                                    onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Davomiylik (masalan: 10:00)"
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                                    value={newLessonData.duration}
                                    onChange={(e) => setNewLessonData({ ...newLessonData, duration: e.target.value })}
                                  />
                                </div>
                                <button
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                  onClick={async () => {
                                    if (!newLessonData.title) return;
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/levels/${editingLevel.id}/lessons`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                          title: newLessonData.title,
                                          duration: newLessonData.duration || "00:00",
                                          videoUrl: newLessonData.videoUrl
                                        })
                                      });
                                      const data = await res.json();
                                      if (data.success) {
                                        // Refresh levels to get updated data
                                        fetchLevels();
                                        setNewLessonData({ title: '', duration: '', videoUrl: '' });
                                      } else {
                                        alert('Xatolik: ' + data.message);
                                      }
                                    } catch (err) {
                                      console.error(err);
                                      alert('Server xatosi');
                                    }
                                  }}
                                >
                                  <Plus size={18} />
                                  Qo'shish
                                </button>
                              </div>
                            </div>

                            {/* Lessons List - Grouped by Modules */}
                            <div className="space-y-4">
                              {Array.from({ length: Math.ceil(editingLevel.lessons.length / 5) }, (_, moduleIndex) => {
                                const moduleLessons = editingLevel.lessons.slice(moduleIndex * 5, (moduleIndex + 1) * 5);
                                const moduleNumber = moduleIndex + 1;

                                return (
                                  <div key={moduleIndex} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                    {/* Module Header */}
                                    <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${editingLevel.color} text-white font-black flex items-center justify-center text-lg`}>
                                          {moduleNumber}
                                        </div>
                                        <div>
                                          <h5 className="font-black text-lg">Modul {moduleNumber}</h5>
                                          <p className="text-xs text-white/60">{moduleLessons.length} ta dars</p>
                                        </div>
                                      </div>
                                      <div className="text-sm text-white/60 font-bold">
                                        Darslar: {moduleIndex * 5 + 1} - {moduleIndex * 5 + moduleLessons.length}
                                      </div>
                                    </div>

                                    {/* Module Lessons Table */}
                                    <table className="w-full text-left">
                                      <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                          <th className="p-3 font-bold text-white/60 text-xs w-12 text-center">#</th>
                                          <th className="p-3 font-bold text-white/60 text-xs">Mavzu</th>
                                          <th className="p-3 font-bold text-white/60 text-xs">Vaqt</th>
                                          <th className="p-3 font-bold text-white/60 text-xs text-right">Amallar</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/5">
                                        {moduleLessons.map((lesson, lessonIndex) => {
                                          const globalIndex = moduleIndex * 5 + lessonIndex;
                                          return (
                                            <tr key={lesson.id} className="hover:bg-white/5 group">
                                              <td className="p-3 text-center font-bold text-white/40 text-sm">{globalIndex + 1}</td>
                                              <td className="p-3 font-medium text-sm">{lesson.title}</td>
                                              <td className="p-3 text-white/60 text-xs font-mono">{lesson.duration}</td>
                                              <td className="p-3 text-right">
                                                <button
                                                  className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 mr-2"
                                                  title="Tahrirlash"
                                                  onClick={() => {
                                                    setEditingLessonId(lesson.id);
                                                    setEditLessonTab('main');
                                                    setEditLessonData({
                                                      title: lesson.title,
                                                      duration: lesson.duration,
                                                      ebookUrl: lesson.ebookUrl || '',
                                                      theory: lesson.theory || (lesson.content?.mainContent || ''),
                                                      practice: lesson.practice || '',
                                                      homework: typeof lesson.homework === 'string' ? lesson.homework : (lesson.homework?.description || ''),
                                                      quiz: lesson.quiz || []
                                                    });
                                                    setShowEditLessonModal(true);
                                                  }}
                                                >
                                                  <Settings size={16} />
                                                </button>
                                                <button
                                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                  title="O'chirish"
                                                  onClick={async () => {
                                                    if (!window.confirm('Rostdan ham o\'chirmoqchimisiz?')) return;
                                                    try {
                                                      const token = localStorage.getItem('token');
                                                      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/levels/${editingLevel.id}/lessons/${lesson.id}`, {
                                                        method: 'DELETE',
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                      });
                                                      const data = await res.json();
                                                      if (data.success) {
                                                        fetchLevels();
                                                      } else {
                                                        alert('O\'chirishda xatolik: ' + data.message);
                                                      }
                                                    } catch (err) {
                                                      console.error(err);
                                                      alert('Server xatosi');
                                                    }
                                                  }}
                                                >
                                                  <Trash2 size={16} />
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                );
                              })}
                              {editingLevel.lessons.length === 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center text-white/40">
                                  Ushbu darajada hali darslar yo'q
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SETTINGS TAB */}
                    {adminTab === 'settings' && (
                      <div className="space-y-8">
                        {/* Section 1: General Settings (Mock) */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Globe size={20} className="text-blue-400" />
                            Umumiy Sozlamalar
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">Tizim Tili</label>
                              <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                                <option value="uz">O'zbekcha</option>
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">Mavzu (Theme)</label>
                              <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                                <option value="dark">Qorong'u (Dark)</option>
                                <option value="light">Yorug' (Light)</option>
                                <option value="system">Tizim moslashuvi</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-sm font-bold transition-all">
                              Saqlash
                            </button>
                          </div>
                        </div>

                        {/* Section 2: Admin Users Management */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-purple-400" />
                            Adminlar Boshqaruvi
                          </h3>
                          <p className="text-sm text-white/60 mb-6">
                            Quyidagi foydalanuvchilar tizimda <b>Admin</b> huquqiga ega.
                          </p>

                          <div className="space-y-4">
                            {adminUsers.filter(u => u.role === 'admin').map(admin => (
                              <div key={admin._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                                    {admin.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold">{admin.name}</div>
                                    <div className="text-xs text-white/50">{admin.email}</div>
                                  </div>
                                </div>
                                {admin._id !== user.id && (
                                  <button
                                    onClick={() => handleRoleUpdate(admin._id, 'user')}
                                    className="text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                                  >
                                    Adminlikdan olish
                                  </button>
                                )}
                                {admin._id === user.id && (
                                  <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-lg border border-green-500/20">
                                    Siz
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-6 border-t border-white/10">
                            <h4 className="font-bold text-sm mb-2">Yangi Admin qo'shish</h4>
                            <p className="text-xs text-white/50 mb-4">Foydalanuvchilar ro'yxatidan kerakli odamni topib, "Admin qilish" tugmasini bosing.</p>
                            <button
                              onClick={() => setAdminTab('users')}
                              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                            >
                              Foydalanuvchilarga o'tish
                            </button>
                          </div>
                        </div>

                        {/* Section 3: Security */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-red-400" />
                            Xavfsizlik
                          </h3>
                          <div className="space-y-4">
                            <input
                              type="password"
                              placeholder="Eski parol"
                              className="w-full bg-black/20 px-4 py-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                              value={passwordForm.oldPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                            />
                            <input
                              type="password"
                              placeholder="Yangi parol (kamida 6 ta belgi)"
                              className="w-full bg-black/20 px-4 py-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            />
                            <button
                              onClick={handleUpdatePassword}
                              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all border border-red-500/20"
                            >
                              Parolni yangilash
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </>
                ) : (
                  <div className="text-center py-24">
                    <Loader2 className="animate-spin mx-auto text-white/40 mb-4" size={40} />
                    <p className="text-white/40 font-bold">Ma'lumotlar yuklanmoqda...</p>
                  </div>
                )}

              </div>

            </div>
          )
        }

      </main >

      {/* ============================================ */}
      {/* 24/7 AI CHAT ASSISTANT */}
      {/* ============================================ */}
      <div className="z-50">
        {/* Toggle Button (Only visible if chat is hidden) */}
        {!showChat && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={() => setShowChat(true)}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center">
                <div className="relative">
                  <MessageCircle size={32} className="text-white" strokeWidth={2.5} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* FULL SCREEN MODAL CHAT */}
        {showChat && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full h-full max-w-7xl bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden relative">

              {/* SIDEBAR (Desktop: Visible, Mobile: Hidden unless in list view) */}
              <div className={`${chatView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-white/10 bg-black/20`}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="font-black text-white text-lg flex items-center gap-2">
                    <Brain className="text-blue-500" /> Arabiyya AI
                  </h3>
                  <button onClick={startNewChat} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 text-white transition-colors" title="Yangi Chat">
                    <Plus size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {chats.length === 0 ? (
                    <div className="text-center text-white/40 py-10 text-sm">Suhbatlar tarixi bo'sh</div>
                  ) : (
                    chats.map(chat => (
                      <div
                        key={chat._id}
                        onClick={() => { loadChat(chat._id); if (window.innerWidth < 768) setChatView('messages'); }}
                        className={`group flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-all ${activeChatId === chat._id ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        <div className="truncate pr-2 overflow-hidden flex-1">
                          <div className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400">{chat.title}</div>
                          <span className="text-xs text-white/40">{new Date(chat.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button onClick={(e) => deleteChat(chat._id, e)} className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="O'chirish">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {chats.length > 0 && (
                  <div className="p-4 border-t border-white/10">
                    <button onClick={clearAllChats} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                      <Trash2 size={16} /> Barcha suhbatlarni o'chirish
                    </button>
                  </div>
                )}
              </div>

              {/* MAIN CHAT AREA */}
              <div className={`${chatView === 'messages' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-slate-900/50 relative`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <button className="md:hidden p-2 hover:bg-white/10 rounded-lg text-white" onClick={() => setChatView('list')}>
                      <ChevronLeft size={24} />
                    </button>
                    <div>
                      <h3 className="font-bold text-white text-lg">AI Yordamchi</h3>
                      <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Onlayn</p>
                    </div>
                  </div>
                  <button onClick={() => setShowChat(false)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-white/60">
                    <X size={24} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-20 space-y-6">
                      <Brain size={64} className="mx-auto text-blue-500/50 animate-pulse" />
                      <h3 className="text-2xl font-bold text-white">Assalomu alaykum!</h3>
                      <p className="text-white/60">Sizga qanday yordam bera olaman?</p>
                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        {["Grammatika", "So'zlashuv", "Tarjima", "Mashqlar"].map(t => (
                          <button key={t} onClick={() => setChatInput(t)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all">{t}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn relative`}>
                      {msg.role === 'user' && (
                        <div className="absolute -top-3 -right-2 hidden group-hover:flex items-center gap-1 bg-gray-900 border border-white/20 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                          <button onClick={() => { const t = prompt("Tahrirlash:", msg.content); if (t && t !== msg.content) editMessage(msg._id, t); }} className="p-1.5 hover:text-blue-400 text-white/60"><PenTool size={14} /></button>
                          <button onClick={() => deleteMessage(msg._id)} className="p-1.5 hover:text-red-400 text-white/60"><Trash2 size={14} /></button>
                        </div>
                      )}
                      <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-white/10 border border-white/10 text-white'}`}>
                        {msg.role === 'ai' && (
                          <div className="flex justify-between items-center mb-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-2"><Brain size={14} /> AI</span>
                            <button onClick={() => navigator.clipboard.writeText(msg.content)} className="hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><ClipboardCheck size={14} /></button>
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && <div className="flex items-center gap-2 text-white/50 bg-white/5 p-4 rounded-xl w-fit"><Loader2 className="animate-spin" size={18} /> Javob yozilmoqda...</div>}
                </div>

                {/* Input Area */}
                <div className="p-5 border-t border-white/10 bg-black/20 backdrop-blur-md">
                  <div className="flex gap-3 max-w-4xl mx-auto w-full">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && !isChatLoading && sendChatMessage()}
                      placeholder="Xabar yozing..."
                      disabled={isChatLoading}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20"
                    />
                    <button onClick={sendChatMessage} disabled={!chatInput.trim() || isChatLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl text-white hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100">
                      <Send size={24} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="relative mt-32 bg-gradient-to-br from-blue-950/50 via-indigo-950/50 to-purple-950/50 backdrop-blur-xl border-t border-white/10 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">

            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <BookOpen size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-2xl font-black">Arabiyya Pro</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                AI texnologiyasi bilan professional arab tili ta'limi platformasi.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, link: '#' },
                  { icon: Facebook, link: '#' },
                  { icon: Youtube, link: '#' },
                  { icon: Twitter, link: '#' }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.link}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 transition-all duration-300 border border-white/10 hover:border-transparent">
                      <social.icon size={20} className="text-white/70 group-hover:text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Kurslar */}
            <div className="space-y-5">
              <h4 className="font-black text-blue-400 text-sm tracking-wider">KURSLAR</h4>
              <div className="space-y-3">
                {[
                  { label: 'Barcha darajalar', view: 'levels' },
                  { label: 'A1 - Boshlang\'ich', level: 'A1' },
                  { label: 'B1 - O\'rta', level: 'B1' },
                  { label: 'C1 - Ilg\'or', level: 'C1' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setView(item.view || 'levels')}
                    className="block text-white/60 hover:text-white text-sm font-bold transition-all duration-300 hover:translate-x-2"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforma */}
            <div className="space-y-5">
              <h4 className="font-black text-purple-400 text-sm tracking-wider">PLATFORMA</h4>
              <div className="space-y-3">
                {[
                  { label: 'Yordam markazi', view: 'help' },
                  { label: 'Sertifikatlar', view: 'certificates' },
                  { label: 'Ro\'yxatdan o\'tish', view: 'auth' },
                  { label: 'Maxfiylik siyosati', view: 'home' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setView(item.view)}
                    className="block text-white/60 hover:text-white text-sm font-bold transition-all duration-300 hover:translate-x-2"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aloqa */}
            <div className="space-y-5">
              <h4 className="font-black text-pink-400 text-sm tracking-wider">ALOQA</h4>
              <div className="space-y-4">
                {[
                  { icon: Mail, text: 'humoyunanvarjonov466@gmail.com', link: 'mailto:humoyunanvarjonov466@gmail.com' },
                  { icon: Phone, text: '+998 97 632 63 64', link: 'tel:+998976326364' },
                  { icon: MapPin, text: 'Toshkent, O\'zbekiston', link: '#' }
                ].map((contact, i) => (
                  <a
                    key={i}
                    href={contact.link}
                    className="flex items-center gap-3 text-white/60 hover:text-white transition-all duration-300 group text-sm font-bold"
                  >
                    <contact.icon size={18} className="text-blue-400 group-hover:text-purple-400 transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform">{contact.text}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/40 text-xs font-bold">
              © 2026 Arabiyya Pro. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex gap-8">
              {['Maxfiylik siyosati', 'Foydalanish shartlari', 'Cookie siyosati'].map((item, i) => (
                <button
                  key={i}
                  className="text-xs font-bold text-white/40 hover:text-white transition-colors duration-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        body {
          overflow-x: hidden;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        ::-webkit-scrollbar {
          width: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          border: 2px solid rgba(255,255,255,0.1);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #7c3aed);
        }
      `}</style>

      {/* Purchase Modal */}
      {
        showPurchaseModal && selectedLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1e1e2e] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl relative">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>

              <div className="text-center space-y-6">
                <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${selectedLevel.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Lock size={40} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{selectedLevel.title} ({selectedLevel.id})</h3>
                  <p className="text-white/60">Kursni to'liq ochish uchun to'lov qiling</p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-white/60">
                    <span>Kurs narxi:</span>
                    <span className="text-xl text-green-400 font-black">300,000 so'm</span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="text-left space-y-2">
                    <p className="text-xs font-bold text-white/40 uppercase">To'lov uchun karta:</p>
                    <div className="bg-black/40 p-4 rounded-xl font-mono text-xl text-center tracking-widest border border-white/10 select-all text-white font-bold shadow-inner">
                      9860 0825 3462 9983
                    </div>
                    <p className="text-center text-xs text-white/40 mt-1 uppercase font-bold tracking-wider">Humo • Arabiyya Pro</p>
                  </div>
                </div>

                <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-white/80 ml-1">To'lov isboti</label>
                    <input
                      type="text"
                      required
                      value={purchaseProof}
                      onChange={(e) => setPurchaseProof(e.target.value)}
                      placeholder="Chek raqami yoki Telegram username..."
                      className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-colors text-white"
                    />
                    <p className="text-xs text-white/40 ml-1">Admin to'lovni tekshirib tasdiqlaydi (1-2 soat)</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                  >
                    {isSubmittingOrder ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Tasdiqlash uchun yuborish</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )
      }

      {/* Grant Level Modal (Admin) */}
      {
        showGrantLevelModal && grantingLevelTo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/20 shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-500 relative">
              <button
                onClick={() => {
                  setShowGrantLevelModal(false);
                  setGrantingLevelTo(null);
                  setSelectedGrantLevel('');
                }}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Gift size={40} className="text-white" />
                </div>

                <div>
                  <h3 className="text-2xl font-black">Bepul Daraja Berish</h3>
                  <p className="text-white/60 mt-2">
                    <span className="font-bold text-white">{grantingLevelTo.name}</span> ga daraja bering
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-white/80 ml-1">Darajani tanlang</label>
                    <select
                      value={selectedGrantLevel}
                      onChange={(e) => setSelectedGrantLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:border-green-500 transition-colors text-white font-bold"
                    >
                      <option value="" className="bg-slate-900">Darajani tanlash...</option>
                      {levels.filter(l => !grantingLevelTo.purchasedLevels?.includes(l.id)).map(lvl => (
                        <option key={lvl.id} value={lvl.id} className="bg-slate-900">
                          {lvl.icon} {lvl.id} - {lvl.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={async () => {
                      if (!selectedGrantLevel) return alert('Iltimos, daraja tanlang!');

                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/admin/grant-level`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            userId: grantingLevelTo._id,
                            levelId: selectedGrantLevel
                          })
                        });

                        const data = await res.json();
                        if (data.success) {
                          alert(`✅ ${grantingLevelTo.name} uchun ${selectedGrantLevel} darajasi ochildi!`);
                          setShowGrantLevelModal(false);
                          setGrantingLevelTo(null);
                          setSelectedGrantLevel('');
                          // Refresh users list
                          if (view === 'admin' && adminTab === 'users') {
                            const token2 = localStorage.getItem('token');
                            const usersRes = await fetch('https://arabiyya-pro-backend.onrender.com/api/admin/users', {
                              headers: { 'Authorization': `Bearer ${token2}` }
                            });
                            const usersData = await usersRes.json();
                            if (usersData.success) setAdminUsers(usersData.users);
                          }
                        } else {
                          alert('Xatolik: ' + data.message);
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Server xatosi');
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2 text-white"
                  >
                    <Gift size={20} />
                    Bepul Berish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* ADMIN: Edit Lesson Modal */}
      {/* ADMIN: Edit Lesson Modal - Enhanced with Tabs */}
      {
        showEditLessonModal && editingLessonId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">

              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <Settings className="text-blue-400" />
                  Darsni Tahrirlash: <span className="text-blue-400">{editLessonData.title}</span>
                </h3>
                <button onClick={() => setShowEditLessonModal(false)} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              {/* Content Area with Sidebar/Tabs */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-64 bg-black/20 border-r border-white/10 p-4 space-y-2 overflow-y-auto hidden md:block">
                  {[
                    { id: 'main', label: 'Asosiy', icon: <Video size={18} /> },
                    { id: 'theory', label: 'Nazariy', icon: <BookOpen size={18} /> },
                    { id: 'practice', label: 'Amaliy', icon: <PenTool size={18} /> },
                    { id: 'homework', label: 'Uyga Vazifa', icon: <Home size={18} /> },
                    { id: 'quiz', label: 'Test', icon: <CheckCircle2 size={18} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setEditLessonTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${editLessonTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto bg-slate-900/30">

                  {/* Mobile Tabs (Visible only on small screens) */}
                  <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2">
                    {[
                      { id: 'main', label: 'Asosiy' },
                      { id: 'theory', label: 'Nazariy' },
                      { id: 'practice', label: 'Amaliy' },
                      { id: 'homework', label: 'Vazifa' },
                      { id: 'quiz', label: 'Test' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setEditLessonTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap ${editLessonTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-white/60'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* TAB: Main */}
                  {editLessonTab === 'main' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Video size={20} className="text-blue-400" /> Asosiy Ma'lumotlar</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-white/60 mb-1 block uppercase">Mavzu (Title)</label>
                          <input
                            type="text"
                            value={editLessonData.title}
                            onChange={e => setEditLessonData({ ...editLessonData, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-white/60 mb-1 block uppercase">Davomiyligi</label>
                            <input
                              type="text"
                              value={editLessonData.duration}
                              onChange={e => setEditLessonData({ ...editLessonData, duration: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-mono"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-bold text-white/60 uppercase">Kitob (PDF)</label>
                              {editLessonData.ebookUrl && (
                                <button
                                  onClick={() => setEditLessonData({ ...editLessonData, ebookUrl: '' })}
                                  className="text-red-400 text-xs hover:text-red-300"
                                >
                                  O'chirish
                                </button>
                              )}
                            </div>

                            {editLessonData.ebookUrl ? (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                                <span className="text-green-400 text-sm truncate max-w-[200px]">{editLessonData.ebookUrl}</span>
                                <CheckCircle2 size={16} className="text-green-500" />
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <label className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white cursor-pointer transition-all flex items-center justify-center gap-2">
                                  <Upload size={18} className="text-blue-400" />
                                  <span className="text-sm">PDF Yuklash</span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;

                                      // Upload logic
                                      const formData = new FormData();
                                      formData.append('file', file);

                                      try {
                                        const token = localStorage.getItem('token');
                                        // Show loading if needed
                                        e.target.parentElement.innerHTML = '<span class="text-xs">Yuklanmoqda...</span>';

                                        const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/upload', {
                                          method: 'POST',
                                          body: formData
                                          // No Content-Type header needed for FormData, functionality handled by browser
                                        });
                                        const data = await res.json();

                                        if (data.success) {
                                          setEditLessonData({ ...editLessonData, ebookUrl: data.fileUrl });
                                        } else {
                                          alert('Xatolik: ' + data.message);
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert('Server xatosi');
                                      }
                                    }}
                                  />
                                </label>
                                {/* Fallback text input */}
                                <input
                                  type="text"
                                  className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white/60 focus:text-white outline-none"
                                  placeholder="Yoki URL"
                                  value={editLessonData.ebookUrl}
                                  onChange={e => setEditLessonData({ ...editLessonData, ebookUrl: e.target.value })}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: Theory */}
                  {editLessonTab === 'theory' && (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold flex items-center gap-2"><BookOpen size={20} className="text-blue-400" /> Nazariy Qism</h4>
                        <span className="text-xs text-white/40">Markdown va HTML qo'llab-quvvatlanadi</span>
                      </div>
                      <textarea
                        value={editLessonData.theory}
                        onChange={e => setEditLessonData({ ...editLessonData, theory: e.target.value })}
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-white focus:border-blue-500 outline-none text-base leading-relaxed font-mono min-h-[400px]"
                        placeholder="# Darsning nazariy qismi
Bu yerga dars matnini yozing..."
                      ></textarea>
                    </div>
                  )}

                  {/* TAB: Practice */}
                  {editLessonTab === 'practice' && (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><PenTool size={20} className="text-blue-400" /> Amaliy Mashg'ulotlar</h4>
                      <textarea
                        value={editLessonData.practice}
                        onChange={e => setEditLessonData({ ...editLessonData, practice: e.target.value })}
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-white focus:border-blue-500 outline-none text-base leading-relaxed font-mono min-h-[400px]"
                        placeholder="Amaliy mashqlar va ko'rsatmalar..."
                      ></textarea>
                    </div>
                  )}

                  {/* TAB: Homework */}
                  {editLessonTab === 'homework' && (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Home size={20} className="text-blue-400" /> Uyga Vazifa</h4>
                      <textarea
                        value={editLessonData.homework}
                        onChange={e => setEditLessonData({ ...editLessonData, homework: e.target.value })}
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-white focus:border-blue-500 outline-none text-base leading-relaxed font-mono min-h-[400px]"
                        placeholder="Uyga vazifa tavsifi..."
                      ></textarea>
                    </div>
                  )}

                  {/* TAB: Quiz */}
                  {editLessonTab === 'quiz' && (
                    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
                      <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-900/90 backdrop-blur z-10 py-4 border-b border-white/10">
                        <h4 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 size={20} className="text-blue-400" /> Test Savollari ({editLessonData.quiz?.length || 0})</h4>
                        <button
                          onClick={() => setEditLessonData({
                            ...editLessonData,
                            quiz: [...(editLessonData.quiz || []), { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                          })}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                          <Plus size={16} /> Savol Qo'shish
                        </button>
                      </div>

                      <div className="space-y-6">
                        {editLessonData.quiz?.map((q, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 relative group hover:border-white/20 transition-colors">
                            <div className="absolute top-4 right-4 flex gap-2">
                              <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-white/50">#{idx + 1}</span>
                              <button
                                onClick={() => {
                                  if (!confirm("Bu savolni o'chirmoqchimisiz?")) return;
                                  const newQuiz = [...editLessonData.quiz];
                                  newQuiz.splice(idx, 1);
                                  setEditLessonData({ ...editLessonData, quiz: newQuiz });
                                }}
                                className="text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-white/40 mb-1 block">Savol Matni</label>
                              <input
                                type="text"
                                value={q.question}
                                onChange={e => {
                                  const newQuiz = [...editLessonData.quiz];
                                  newQuiz[idx].question = e.target.value;
                                  setEditLessonData({ ...editLessonData, quiz: newQuiz });
                                }}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-blue-500 outline-none font-medium"
                                placeholder="Savol matnini kiriting..."
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${q.correctAnswer === optIdx ? 'bg-green-500/10 border-green-500/50' : 'bg-black/20 border-white/5'}`}>
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={q.correctAnswer === optIdx}
                                    onChange={() => {
                                      const newQuiz = [...editLessonData.quiz];
                                      newQuiz[idx].correctAnswer = optIdx;
                                      setEditLessonData({ ...editLessonData, quiz: newQuiz });
                                    }}
                                    className="w-4 h-4 text-green-500 accent-green-500 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={e => {
                                      const newQuiz = [...editLessonData.quiz];
                                      newQuiz[idx].options[optIdx] = e.target.value;
                                      setEditLessonData({ ...editLessonData, quiz: newQuiz });
                                    }}
                                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-white/20"
                                    placeholder={`Variant ${optIdx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {editLessonData.quiz?.length === 0 && (
                          <div className="text-center py-16 text-white/30 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4">
                            <CheckCircle2 size={48} className="text-white/10" />
                            <p>Test savollari yo'q. "Savol Qo'shish" tugmasini bosing.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl flex justify-end gap-4">
                <button
                  onClick={() => setShowEditLessonModal(false)}
                  className="px-6 py-3 rounded-xl text-white/60 hover:text-white font-bold transition-colors hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const formPayload = {
                        ...editLessonData,
                        quiz: editLessonData.quiz || []
                      };

                      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/levels/${editingLevel.id}/lessons/${editingLessonId}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(formPayload)
                      });

                      const data = await res.json();
                      if (data.success) {
                        setShowEditLessonModal(false);
                        // Refresh data
                        const levelsRes = await fetch('https://arabiyya-pro-backend.onrender.com/api/levels');
                        const levelsData = await levelsRes.json();
                        if (levelsData.success) {
                          setLevels(levelsData.levels);
                          const updatedLevel = levelsData.levels.find(l => l.id === editingLevel.id);
                          if (updatedLevel) setEditingLevel(updatedLevel);
                        }
                        alert('✅ Dars muvaffaqiyatli saqlandi!');
                      } else {
                        alert('Xatolik: ' + data.message);
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Server xatosi');
                    }
                  }}
                >
                  <Save size={20} />
                  Saqlash
                </button>
              </div>

            </div>
          </div>
        )
      }

    </div >
  );
};

export default App;