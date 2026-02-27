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
  Info, PenTool, Home, Save, List, Sun, Moon
} from 'lucide-react';

import ArabiyyaCertificateFinal from './components/ArabiyyaCertificateFinal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { translations } from './translations';

const App = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'uz');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = (key) => {
    return translations[language]?.[key] || translations['uz'][key] || key;
  };
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
  const [uploadingLevelBook, setUploadingLevelBook] = useState(false);
  const [uploadingLessonBook, setUploadingLessonBook] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Alphabet Learning State
  const [alphabetModule, setAlphabetModule] = useState(1);
  const [alphabetTab, setAlphabetTab] = useState('video');

  // Module Learning State (for A1-C2 levels)
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleTab, setModuleTab] = useState('video');
  const [lessonTab, setLessonTab] = useState('video'); // Dars sahifalari uchun

  // Level Exam Editor State (Admin)
  const [showExamEditor, setShowExamEditor] = useState(false);
  const [editingExamQuestions, setEditingExamQuestions] = useState([]);

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
          if (view === 'auth') setView('levels');
        } else {
          if (data.code === 'CONCURRENT_SESSION') {
            alert(t('error_prefix') + data.message);
          }
          localStorage.removeItem('token');
          setUser(null);
          setView('auth');
        }
      } catch (err) {
        console.error('Auth check failed', err);
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  // Theme Applying Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Language Saving Logic
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Time Tracking Logic: Send heartbeat every minute if user is logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch('https://arabiyya-pro-backend.onrender.com/api/users/update-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ minutes: 1 })
        });
      } catch (err) {
        console.error('Failed to update time:', err);
      }
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Anti-Copy & Security Logic
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85) ||
        (e.ctrlKey && e.keyCode === 67) || // Ctrl+C
        (e.ctrlKey && e.keyCode === 83)    // Ctrl+S
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  // Sync certificates from user profile
  useEffect(() => {
    if (user && user.certificates) {
      setCertificates(user.certificates);
    }
  }, [user]);

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

        // Sync completed levels from backend (array of objects -> array of IDs)
        if (data.user.completedLevels && Array.isArray(data.user.completedLevels)) {
          setCompletedLevels(data.user.completedLevels.map(l => l.levelId));
        }

        fetchMySubmissions(); // Update submissions history too

        // Legacy chat history restore removed to support multi-chat system
      } else if (data.code === 'CONCURRENT_SESSION') {
        alert(t('error_prefix') + data.message);
        localStorage.removeItem('token');
        setUser(null);
        setView('auth');
      }
    } catch (err) {
      console.error('User refresh failed', err);
    }
  };

  // Avtomatik daraja ochilishini tekshirish (10 sekundda bir polling)
  useEffect(() => {
    let interval;
    if (user && view !== 'home' && view !== 'auth') {
      interval = setInterval(() => {
        refreshUser();
      }, 10000); // 10,000ms = 10s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, view]);

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
    if (!purchaseProof) return alert(t('fill_all_fields'));

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
      alert(t('fill_all_fields'));
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
        alert(t('password_updated'));
      } else {
        alert(t('error_prefix') + data.message);
      }
    } catch (err) {
      console.error(err);
      alert(t('connection_error'));
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
        if (selectedLevel) {
          const updatedSelected = formattedLevels.find(l => l.id === selectedLevel.id);
          if (updatedSelected) {
            setSelectedLevel(updatedSelected);
            // Also sync current lesson if open
            if (selectedLesson) {
              const updatedLesson = updatedSelected.lessons.find(ls => ls.id === selectedLesson.id);
              if (updatedLesson) setSelectedLesson(updatedLesson);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  // Kitobni xavfsiz yuklab olish: backend dan vaqtinchalik havola olamiz
  const handleDownloadBook = async (rawUrl) => {
    if (!rawUrl) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `https://arabiyya-pro-backend.onrender.com/api/download?key=${encodeURIComponent(rawUrl)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success && data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('Yuklab olishda xatolik: ' + (data.message || 'Noma\'lum xato'));
      }
    } catch (err) {
      console.error('Download xatosi:', err);
      alert('Aloqa xatosi. Iltimos qayta urinib ko\'ring.');
    }
  };

  const handleCleanupLinks = async () => {

    if (!window.confirm("Barcha buzilgan (localhost va /book-) linklarni tozalashni xohlaysizmi? Bu darsliklarni qayta yuklashni talab qilishi mumkin.")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('https://arabiyya-pro-backend.onrender.com/api/admin/cleanup-links', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchLevels(); // Refresh UI
      } else {
        alert("Xatolik: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server bilan aloqa xatosi");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevelSettings = async () => {
    if (!editingLevel) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/levels/${editingLevel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingLevel.title,
          description: editingLevel.description,
          icon: editingLevel.icon,
          color: editingLevel.color,
          levelBookUrl: editingLevel.levelBookUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Daraja sozlamalari saqlandi!');
        fetchLevels();
      } else {
        alert('Xatolik: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Server xatosi');
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
          alert(t('quiz_pass').replace('{correct}', correctCount).replace('{total}', 5).replace('{feedback}', aiFeedback));
          setCompletedLessons(prev => [...prev, selectedLesson.id]);
          // Mark as recently passed to prevent immediate re-take UI flash
          // setLessonPassFeedback(aiFeedback); // This line was not in the original code, adding it would be an unrelated edit.
          setSelectedLesson(null);
          setView('level-lessons');
        } else {
          alert(t('quiz_fail').replace('{correct}', correctCount).replace('{total}', 5).replace('{required}', 4).replace('{feedback}', aiFeedback));
        }
      } catch (error) {
        if (correctCount >= 4) {
          alert(t('quiz_pass').replace('{correct}', correctCount).replace('{total}', 5));
          setCompletedLessons(prev => [...prev, selectedLesson.id]);
          setSelectedLesson(null);
          setView('level-lessons');
        } else {
          alert(t('quiz_fail').replace('{correct}', correctCount).replace('{total}', 5).replace('{required}', 4));
        }
      }

      setIsAnalyzing(false);
      setLessonTestAnswers([]);
      setLessonTestStep(0);
    }
  };

  // Handle level exam
  const handleExamAnswer = async (index) => {
    // Helper to get questions
    let currentExam = [];
    if (selectedLevel.examQuestions && selectedLevel.examQuestions.length > 0) {
      currentExam = selectedLevel.examQuestions.map(q => ({
        q: q.question,
        a: q.options,
        c: q.correctAnswer
      }));
    } else {
      currentExam = []; // No fallback
      // Optional: alert handling for no exam configured
      if (currentExam.length === 0) {
        alert(t('exam_not_ready'));
        return;
      }
    }

    const newAnswers = [...examAnswers, index];
    setExamAnswers(newAnswers);

    const questionsCount = currentExam.length || 15; // Default 15 if fallback

    if (examStep < questionsCount - 1) {
      setExamStep(examStep + 1);
    } else {
      const correctCount = newAnswers.filter((ans, i) => ans === currentExam[i].c).length;
      const requiredCount = Math.ceil(questionsCount * 0.86);
      const isPassed = correctCount >= requiredCount;

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

        if (isPassed) {
          // Save completion to backend
          try {
            const token = localStorage.getItem('token');
            await fetch('https://arabiyya-pro-backend.onrender.com/api/users/complete-level', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                levelId: selectedLevel.id,
                examScore: correctCount
              })
            });
          } catch (err) {
            console.error('Failed to save progress', err);
          }

          setCompletedLevels(prev => [...prev, selectedLevel.id]);

          // Certificate Logic
          if (selectedLevel.id === 'C2') {
            const requiredLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
            // Check if user has all required levels OR is admin
            const hasAllLevels = requiredLevels.every(lvl => completedLevels.includes(lvl) || lvl === selectedLevel.id);

            if (user?.role === 'admin' || hasAllLevels) {
              const newCert = {
                level: 'Certified Arabic Language Specialist',
                score: `${Math.round((correctCount / questionsCount) * 100)}%`,
                certificateNumber: `AP-${Date.now().toString().slice(-8)}`,
                issueDate: new Date()
              };

              setCertificates(prev => [...prev, {
                ...newCert,
                id: Date.now(),
                name: user.name,
                date: newCert.issueDate.toLocaleDateString('en-US')
              }]);

              try {
                const token = localStorage.getItem('token');
                fetch('https://arabiyya-pro-backend.onrender.com/api/auth/certificates', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    level: newCert.level,
                    score: correctCount,
                    certificateNumber: newCert.certificateNumber
                  })
                }).then(res => res.json())
                  .then(d => {
                    if (d.success) console.log("Certificate saved!", d);
                  });
              } catch (e) {
                console.error("Certificate request error", e);
              }

              alert(`🎉 Tabriklaymiz! Siz C2 darajasini muvaffaqiyatli tugatdingiz va MAXSUS SERTIFIKAT bilan taqdirlandingiz!\n\nTog'ri javoblar: ${correctCount}/${questionsCount}`);
            } else {
              alert(`🎉 C2 Imtihonidan o'tdingiz! (${correctCount}/${questionsCount})\nLekin Sertifikat olish uchun barcha oldingi darajalarni (A1-C1) tugatishingiz kerak.`);
            }
          } else {
            alert(t('exam_pass').replace('{correct}', correctCount).replace('{total}', questionsCount).replace('{feedback}', aiFeedback));
            refreshUser(); // Refresh user data to show newly unlocked level
            setView('levels'); // Assuming setExamView is not defined, reverting to original behavior
          }
        } else {
          alert(t('exam_fail').replace('{correct}', correctCount).replace('{total}', questionsCount).replace('{required}', requiredCount).replace('{feedback}', aiFeedback));
          setView('level-lessons'); // Assuming setExamView is not defined, reverting to original behavior
        }
      } catch (error) {
        if (correctCount >= Math.ceil(questionsCount * 0.86)) {
          alert(`🎉 Imtihondan o'tdingiz! ${correctCount}/${questionsCount}. Keyingi darajaga o'tishingiz mumkin!`);
          setCompletedLevels([...completedLevels, selectedLevel.id]);
          setView('levels');
        } else {
          alert(`📚 ${correctCount}/${questionsCount} to'g'ri. Kamida ${Math.ceil(questionsCount * 0.86)} ta kerak. Darajani takrorlang.`);
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
        alert(t('order_received'));
        fetchAdminOrders(); // Refresh list
      } else {
        alert(t('error_prefix') + data.message);
      }
    } catch (error) {
      console.error('Approve Error:', error);
      alert(t('system_error'));
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
    <div className={`min-h-screen transition-all duration-700 ${theme === 'dark' ? 'bg-[#08090a] text-zinc-100' : 'bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 text-white'} font-sans relative overflow-x-hidden`}>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-500/20'} rounded-full blur-[120px] animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-[500px] h-[500px] ${theme === 'dark' ? 'bg-purple-600/10' : 'bg-purple-500/20'} rounded-full blur-[140px] animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-3xl ${theme === 'dark' ? 'bg-[#08090a]/80 border-white/5' : 'bg-white/5 border-white/10'} border-b shadow-2xl transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">

            <div onClick={() => setView('home')} className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl blur group-hover:blur-lg transition-all duration-300"></div>
                <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <BookOpen size={20} className="text-white sm:w-7 sm:h-7" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Arabiyya Pro
                </span>
                <span className="hidden sm:block text-[10px] font-bold text-white/40 -mt-1 tracking-wider">AI-POWERED PLATFORM</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: t('courses'), view: 'levels', icon: GraduationCap },
                { label: t('certificates'), view: 'certificates', icon: Award },
                { label: t('about'), view: 'help', icon: HelpCircle }
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
              {/* User Section */}
              <div className="flex items-center gap-2">
                {/* Theme & Language Toggles */}
                <div className="flex items-center gap-1 sm:gap-2 mr-2">
                  {/* Language Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10 flex items-center gap-1"
                    >
                      <Globe size={18} className="text-white/60" />
                      <span className="text-xs font-bold uppercase text-white/60">{language}</span>
                    </button>
                    {langDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setLangDropdownOpen(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-32 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100] animate-fadeIn">
                          {['uz', 'en', 'ru'].map(lang => (
                            <button
                              key={lang}
                              onClick={() => {
                                setLanguage(lang);
                                setLangDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/10 transition-colors uppercase ${language === lang ? 'text-blue-400 bg-blue-500/10' : 'text-white/60'}`}
                            >
                              {lang === 'uz' ? t('uzbek') : lang === 'ru' ? t('russian') : t('english')}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                    title={theme === 'dark' ? t('light_mode') : t('dark_mode')}
                  >
                    {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-400" />}
                  </button>
                </div>

                {!user ? (
                  <button
                    onClick={() => setView('auth')}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur group-hover:blur-lg transition-all duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2">
                      <Rocket size={16} />
                      <span className="hidden xs:inline sm:inline">{t('login')}</span>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => setView('profile')}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-2 sm:px-4 py-2 rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all group"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all">
                        <User size={16} className="text-white" />
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-sm font-bold">{user.name}</div>
                        <div className="text-[10px] text-white/50">{user.level || 'A1'}</div>
                      </div>
                    </div>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-all border border-red-500/20"
                        title={t('admin_panel')}
                      >
                        <Shield size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        setUser(null);
                        setView('home');
                        setCompletedLessons([]);
                        setCompletedLevels([]);
                        setCertificates([]);
                      }}
                      className="hidden sm:flex p-2 hover:bg-white/10 rounded-xl transition-all"
                      title={t('logout')}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown — To'liq menyu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-2xl border-t border-white/10 py-4 px-4 space-y-2">
            {[
              { label: t('courses'), view: 'levels', icon: GraduationCap },
              { label: t('certificates'), view: 'certificates', icon: Award },
              { label: t('profile'), view: 'profile', icon: User },
              { label: t('about'), view: 'help', icon: HelpCircle }
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${view === item.view
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            {user?.role === 'admin' && (
              <button
                onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl font-bold text-sm text-red-400 bg-red-500/10 border border-red-500/20"
              >
                <Shield size={20} />
                Admin Panel
              </button>
            )}
            {user && (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                  setView('home');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl font-bold text-sm text-white/50 hover:text-white hover:bg-white/10"
              >
                <LogOut size={20} />
                Chiqish
              </button>
            )}
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative pt-24 sm:pt-32 pb-20 px-3 sm:px-6 max-w-7xl mx-auto min-h-screen">

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
                    {t('hero_badge')}
                  </span>
                  <Sparkles size={24} className="text-purple-400 animate-pulse" />
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
                    {t('hero_title_1')} <br />
                    <span className="relative inline-block">
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 blur-2xl opacity-50 animate-pulse"></span>
                      <span className="relative bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {t('hero_title_2')}
                      </span>
                    </span>
                    <br />
                    {t('hero_title_3')}
                  </h1>

                  <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-4xl mx-auto font-medium leading-relaxed">
                    {t('hero_subtitle')}
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
                      {t('start_free')}
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                    </div>
                  </button>

                  <button
                    onClick={() => setView('levels')}
                    className="bg-white/10 backdrop-blur-xl text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/20 hover:border-white/40 flex items-center gap-3"
                  >
                    <BookOpen size={24} />
                    {t('view_courses')}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
                  {[
                    // { icon: Users, num: '5,000+', label: 'Faol O\'quvchi' }, -> Removed
                    { icon: GraduationCap, num: `${levels.reduce((acc, lvl) => acc + (lvl.lessons?.length || 0), 0)}+`, label: t('stats_total_lessons') },
                    { icon: Brain, num: '24/7', label: t('stats_ai_assistant') },
                    { icon: Award, num: '100%', label: t('stats_success_rate') }
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
                  <h2 className="text-4xl md:text-5xl font-black">{t('features_title')}</h2>
                  <p className="text-xl text-white/60">{t('features_subtitle')}</p>
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
                      title: t('feature_ai_chat_title'),
                      desc: t('feature_ai_chat_desc'),
                      color: 'from-purple-500 to-pink-500'
                    },
                    {
                      icon: Award,
                      title: t('certificates'),
                      desc: t('feature_cert_desc'),
                      color: 'from-orange-500 to-red-500'
                    },
                    {
                      icon: Book,
                      title: t('feature_books_title'),
                      desc: t('feature_books_desc'),
                      color: 'from-indigo-500 to-blue-500'
                    },
                    {
                      icon: TrendingUp,
                      title: t('feature_tracking_title'),
                      desc: t('feature_tracking_desc'),
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
                  <h2 className="text-4xl md:text-5xl font-black">{t('levels_preview_title')}</h2>
                  <p className="text-xl text-white/60">{t('levels_preview_subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {levels.filter(l => l.id !== 'INTRO').map((level, i) => {
                    // Dynamic translation for levels
                    const displayTitle = t(`level_${level.id}_title`) || level.title;
                    const displayDesc = t(`level_${level.id}_desc`) || level.description;
                    let finalTitle = displayTitle;
                    let finalDesc = displayDesc;

                    // Quick Fix Override for ALPHABET display if backend script hasn't run
                    if (level.id === 'ALPHABET' || (level.title && level.title.includes('Arab Harflari'))) {
                      finalTitle = t('alphabet_title');
                      finalDesc = t('alphabet_desc');
                    }
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
                                    <><CheckCircle2 size={12} /> {t('unlocked')}</>
                                  ) : (
                                    <><Lock size={12} /> {t('locked')}</>
                                  )}
                                </div>
                              )}
                              <div className={`px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r ${level.color} text-white shadow-lg`}>
                                {level.lessons.length} {t('lessons')}
                              </div>
                            </div>
                          </div>

                          <h3 className="text-2xl font-black mb-3">{finalTitle}</h3>
                          <p className="text-white/70 mb-4 leading-relaxed">{finalDesc}</p>

                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                              {/* Duration removed as it's not in level object currently, or replace with generic */}
                              <Play size={16} />
                              <span>{t('video_lessons')}</span>
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
                    <h2 className="text-4xl md:text-5xl font-black">{t('cta_title')}</h2>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                      {t('cta_subtitle')}
                    </p>
                  </div>

                  <button
                    onClick={() => setView('auth')}
                    className="group relative inline-block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl flex items-center gap-3">
                      <Rocket size={28} />
                      {t('cta_btn')}
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
                          <h2 className="text-5xl font-black">{t('welcome')}</h2>
                          <p className="text-xl text-white/70">{t('welcome_subtitle')}</p>
                        </div>
                      </div>

                      {/* Google Sign-In Only */}
                      <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-full relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                          <div id="googleDiv" className="relative flex justify-center w-full transform transition-transform duration-300 hover:scale-[1.02]"></div>
                        </div>
                        <p className="text-white/40 text-sm font-medium">
                          {t('google_hint')}
                        </p>
                      </div>

                      <div className="text-center text-sm text-white/50 mt-8">
                        {t('google_terms')} <a href="#" className="text-blue-400 hover:underline">{t('terms_link')}</a>{t('terms_suffix')}
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
                            {t('placement_test_title')}
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
                          <span>{t('start')}</span>
                          <span>{t('finish')}</span>
                        </div>
                      </div>

                      {isAnalyzing ? (
                        <div className="py-24 text-center space-y-8">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-blue-500/50 rounded-full blur-2xl animate-pulse"></div>
                            <Loader2 size={80} className="relative animate-spin text-blue-400" strokeWidth={3} />
                          </div>
                          <div className="space-y-3">
                            <p className="text-3xl font-black">{t('ai_analyzing')}</p>
                            <p className="text-lg text-white/60">{t('ai_analyzing_sub')}</p>
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
                                  {t('question')} {testStep + 1} / 12 • {placementQuestions[testStep].level} {t('level_label')}
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
                        <h2 className="text-5xl font-black">{t('your_level')}</h2>
                        <div className="text-8xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                          {placementResult.level}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-3xl text-left border border-white/20 space-y-5 shadow-xl">
                        <div className="flex items-center gap-3 text-blue-400 font-bold text-lg">
                          <Brain size={24} />
                          <span>{t('ai_prof_analysis')}</span>
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
                          {t('start_learning_btn')}
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
                  <h2 className="relative text-5xl md:text-6xl font-black">{t('cefr_levels')}</h2>
                </div>
                <p className="text-2xl text-white/70">{t('cefr_subtitle')}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {levels.filter(l => l.id !== 'INTRO').map((lvl, index) => {
                  // Quick Fix Override for ALPHABET display
                  if (lvl.id === 'ALPHABET' || lvl.title.includes('Arab Harflari')) {
                    lvl.title = t('alphabet_title');
                    lvl.description = t('alphabet_desc');
                    lvl.icon = "ا";
                  } else {
                    // Dynamic translation for A1-C2 levels
                    const titleKey = `level_${lvl.id}_title`;
                    const descKey = `level_${lvl.id}_desc`;
                    if (translations[language]?.[titleKey]) {
                      lvl.title = t(titleKey);
                      lvl.description = t(descKey);
                    }
                  }
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
                                <span className="text-xs font-black text-amber-100 uppercase tracking-widest">{t('locked')}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-emerald-500/30 backdrop-blur-xl rounded-xl border border-emerald-400/40 shadow-lg">
                              <span className="text-xs font-black text-emerald-100 uppercase tracking-widest">{t('unlocked')}</span>
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
                          <span className="text-sm font-bold">{lvl.lessons?.length || 0} {t('lesson_label')}</span>
                        </div>

                        {/* Progress Bar (Only if unlocked) */}
                        {!isLocked && lvl.lessons?.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-white/80 uppercase tracking-wider">
                              <span>{t('progress')}</span>
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
                              {t('buy_now')}
                            </>
                          ) : (
                            <>
                              {t('start')}
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
                  <p className="text-white/60 text-sm">5 {t('lesson_label')} • {t('prof_content')}</p>
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
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📹 {t('tab_book')}</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📝 {t('tab_practice')}</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📖 {t('tab_theory')}</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">✍️ {t('tab_homework')}</span>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📊 {t('tab_test')}</span>
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
                  <p className="text-white/60 text-sm">5 {t('tab_test').toLowerCase()} • {t('prof_content')}</p>
                </div>
              </div>

              {/* 5 Sahifa Tabs */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                <div className="flex overflow-x-auto gap-1 pb-0.5" style={{ scrollbarWidth: 'none' }}>
                  {[
                    { id: 'kitob', label: `📚 ${t('tab_book')}` },
                    { id: 'amaliy', label: `📝 ${t('tab_practice')}` },
                    { id: 'nazariy', label: `📖 ${t('tab_theory')}` },
                    { id: 'uyga', label: `✍️ ${t('tab_homework')}` },
                    { id: 'test', label: `📊 ${t('tab_test')}` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLessonTab(tab.id)}
                      className={`px-3 sm:px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all text-sm sm:text-base flex-shrink-0 ${lessonTab === tab.id
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/60 hover:bg-white/10'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-white/10 min-h-[400px]">
                {/* Kitob Tab */}
                {lessonTab === 'kitob' && (
                  <div className="space-y-6 animate-in fade-in duration-300">

                    {/* KITOB SECTION */}
                    <div className="bg-gradient-to-br from-indigo-500/20 to-blue-600/20 p-5 sm:p-8 rounded-2xl border border-white/10 flex flex-col items-center gap-6 text-center">
                      <div className="w-32 h-44 sm:w-40 sm:h-56 bg-white/10 rounded-xl shadow-2xl flex items-center justify-center border-4 border-white/5 relative overflow-hidden">
                        <BookOpen size={52} className="text-white/40" />
                        <div className="absolute bottom-0 w-full bg-black/50 text-center text-xs py-2 text-white/80 font-bold">PDF</div>
                      </div>
                      <div className="space-y-4 w-full">
                        <h3 className="text-2xl sm:text-3xl font-black flex items-center justify-center gap-3">
                          <Download className="text-blue-400" /> {t('tab_book')} (PDF)
                        </h3>
                        <p className="text-white/60">{t('hero_subtitle')}</p>

                        {(() => {
                          const isValid = (url) => url && !url.includes('/book-') && !url.includes('localhost');
                          const lessonBook = isValid(selectedLesson.ebookUrl) ? selectedLesson.ebookUrl : null;
                          const levelBook = isValid(selectedLevel.levelBookUrl) ? selectedLevel.levelBookUrl : null;
                          const rawUrl = lessonBook || levelBook;

                          if (!rawUrl) return (
                            <button disabled className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white/40 rounded-xl font-bold text-lg cursor-not-allowed border border-white/10">
                              <Lock size={24} /> {t('pdf_not_available')}
                            </button>
                          );

                          const token = localStorage.getItem('token');
                          const finalUrl = (rawUrl.startsWith('http')
                            ? rawUrl
                            : `https://arabiyya-pro-backend.onrender.com/${rawUrl.replace(/^\//, '')}`) +
                            (token ? `?token=${token}` : '');

                          console.log('📖 Kitob linki:', finalUrl);

                          return (
                            <a
                              href={finalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-blue-600/30"
                            >
                              <Download size={24} /> {t('download_pdf')}
                            </a>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                )}

                {/* Nazariy Tab */}
                {lessonTab === 'nazariy' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 leading-relaxed space-y-4">
                      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="text-blue-400" /> {t('tab_theory')}
                      </h3>
                      {selectedLesson.theory ? (
                        <div className="whitespace-pre-wrap text-white/90 font-serif leading-loose text-lg">{selectedLesson.theory}</div>
                      ) : (
                        <div className="whitespace-pre-wrap text-white/90">
                          {typeof selectedLesson.content === 'string'
                            ? selectedLesson.content
                            : selectedLesson.content?.mainContent || t('no_theory')}
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
                        <PenTool className="text-yellow-400" /> {t('tab_practice')}
                      </h3>
                      <div className="whitespace-pre-wrap text-white/90 font-serif leading-loose text-lg">
                        {selectedLesson.practice || t('no_practice')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Uyga Vazifa Tab */}
                {lessonTab === 'uyga' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                        <Home className="text-emerald-400" /> {t('tab_homework')}
                      </h3>
                      <div className="whitespace-pre-wrap text-white/90 font-serif leading-loose text-lg min-h-[100px]">
                        {selectedLesson.homework || t('no_homework')}
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
                                  {submission.status === 'approved' ? `✅ ${t('hw_approved')}` :
                                    submission.status === 'rejected' ? `❌ ${t('hw_rejected')}` :
                                      `⏳ ${t('hw_pending')}`}
                                </h3>
                                <p className="text-white/60">
                                  {submission.status === 'approved' ? t('hw_success_msg') :
                                    submission.status === 'rejected' ? t('hw_retry_msg') :
                                      t('hw_waiting_msg')}
                                </p>
                              </div>
                            </div>

                            {submission.status === 'approved' && (
                              <div className="bg-green-500/10 p-6 rounded-2xl border border-green-500/20 max-w-sm mx-auto">
                                <div className="text-sm font-bold text-green-400 uppercase tracking-widest mb-1">{t('your_grade')}</div>
                                <div className="text-5xl font-black text-white mb-2">{submission.score || 0}</div>
                                <div className="text-white/60 text-xs">{t('out_of_100')}</div>
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
                                <h4 className="text-xl font-bold text-red-400">{t('re_upload')}</h4>
                                <label className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold cursor-pointer inline-flex items-center gap-3 shadow-lg shadow-red-500/20 transition-all">
                                  <Upload size={24} />
                                  {t('upload_new')}
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
                                        alert(`✅ ${t('re_uploaded')}!`);
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
                            <h4 className="text-xl font-bold text-emerald-400 mb-2">{t('upload_hw')}</h4>
                            <p className="text-white/60 text-sm max-w-md mx-auto">{t('upload_hw_desc')}</p>
                          </div>

                          <div className="flex justify-center">
                            <label className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer flex items-center gap-3 shadow-lg shadow-emerald-500/20">
                              <Upload size={24} />
                              {t('select_file_hw')}
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
                                    alert(`✅ ${t('tab_homework')} ${t('completed').toLowerCase()}!`);
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
                          <p className="text-white/40 text-xs mt-4">Max 10MB (JPG, PNG, MP3)</p>
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
                          <h3 className="text-3xl font-black text-white mb-2">📊 {t('tab_test')} (100 {t('points').toLowerCase()})</h3>
                          <p className="text-white/60 max-w-md mx-auto text-lg">
                            {t('quiz_count_desc')}
                          </p>
                        </div>

                        {(!selectedLesson.quiz || selectedLesson.quiz.length === 0) ? (
                          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl inline-block text-yellow-200">
                            ⚠️ {t('quiz_not_added')}
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
                            {t('start_test_btn')} 🚀
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
                              <span>{t('question')} {lessonTestStep + 1} / {selectedLesson.quiz.length}</span>
                              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20">{t('tab_test')}</span>
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
                              <h3 className="text-4xl font-black mb-2">{t('test_finished')}</h3>
                              <p className="text-white/60 text-lg">{t('your_score')}:</p>
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
                                {t('retake_test')}
                              </button>
                              <button
                                onClick={() => {
                                  setView('level-lessons');
                                }}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
                              >
                                {t('course_continue')}
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
                  <h3 className="text-xl font-black">{t('progress')}</h3>
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

              {/* Level Book Download Section */}
              {selectedLevel.levelBookUrl && (
                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-3xl border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <BookOpen size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black mb-1">{selectedLevel.id} {t('level_book')}</h3>
                      <p className="text-white/60">{t('hero_subtitle')}</p>
                    </div>
                  </div>
                  <a
                    href={(selectedLevel.levelBookUrl?.startsWith('http')
                      ? selectedLevel.levelBookUrl
                      : `https://arabiyya-pro-backend.onrender.com/${selectedLevel.levelBookUrl?.replace(/^\//, '')}`) +
                      (localStorage.getItem('token') ? `?token=${localStorage.getItem('token')}` : '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
                  >
                    <Download size={24} />
                    {t('download_level_pdf')}
                  </a>
                </div>
              )}

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
                          title: `${t('module')} ${moduleNumber}`,
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
                              <h3 className="font-black text-2xl leading-tight mb-1">{t('module')} {moduleNumber}</h3>
                              <div className="flex items-center gap-3 text-xs text-white/60">
                                <div className="flex items-center gap-1">
                                  <BookOpen size={14} />
                                  <span>{moduleLessons.length} {t('lessons')}</span>
                                </div>
                                {isCompleted && (
                                  <div className="flex items-center gap-1 text-green-400">
                                    <CheckCircle size={14} />
                                    <span>{t('completed')}</span>
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
                              <span>{t('progress')}</span>
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
                              {t('more_lessons_prefix')} {moduleLessons.length - 3} {t('more_lessons_suffix')}
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
                          {selectedLevel.id} {t('final_exam')}
                        </h3>
                      </div>
                      <p className="text-white/90 text-lg">
                        {t('exam_info')} • AI {t('usage_stats').toLowerCase()}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>~30 {t('minutes')}</span>
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
                        {t('take_exam')}
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

        {/* ============================================ */}
        {/* CERTIFICATES PAGE */}
        {/* ============================================ */}
        {
          view === 'certificates' && user && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black">{t('my_certificates')}</h2>
                <p className="text-xl text-white/60">{t('features_subtitle')}</p>
              </div>

              {certificates.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/10 space-y-6">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award size={48} className="text-white/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{t('no_certificates')}</h3>
                  <p className="text-white/60 max-w-lg mx-auto">
                    {t('welcome_subtitle')}
                  </p>
                  <button
                    onClick={() => setView('levels')}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                  >
                    {t('view_courses')}
                  </button>

                </div>
              ) : (
                <div className="space-y-12">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="space-y-6">
                      <div id={`cert-${cert.id}`} className="overflow-hidden rounded-3xl shadow-2xl">
                        <ArabiyyaCertificateFinal
                          studentName={cert.name}
                          completionDate={cert.date}
                          verificationId={cert.certificateNumber}
                          certificateType={cert.level}
                        />
                      </div>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={async () => {
                            const element = document.getElementById(`cert-${cert.id}`);
                            if (element) {
                              try {
                                const canvas = await html2canvas(element.querySelector('.certificate-node') || element);
                                const imgData = canvas.toDataURL('image/png');
                                const pdf = new jsPDF('l', 'mm', 'a4');
                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                const pdfHeight = pdf.internal.pageSize.getHeight();
                                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                pdf.save(`ArabiyyaPro_Certificate_${cert.id}.pdf`);
                              } catch (err) {
                                console.error("PDF generation failed", err);
                                alert(t('pdf_error'));
                              }
                            }
                          }}
                          className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                        >
                          <Download size={24} />
                          {t('download_pdf')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }

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
                          <div className="text-4xl font-black">{examStep + 1}/{(selectedLevel.examQuestions?.length) || 15}</div>
                          <div className="text-sm text-white/60">{t('exam_step')}</div>
                        </div>
                      </div>

                      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-700 shadow-lg"
                          style={{ width: `${((examStep + 1) / ((selectedLevel.examQuestions?.length) || 15)) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm font-bold text-white/60">
                        <span>{t('passing_score')}: {Math.ceil(((selectedLevel.examQuestions?.length) || 15) * 0.86)}/{(selectedLevel.examQuestions?.length) || 15}</span>
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
                          <p className="text-3xl font-black">{t('ai_analyzing_exam')}</p>
                          <p className="text-lg text-white/60">{t('prof_assessment_process')}</p>
                        </div>
                      </div>
                    ) : (
                      (() => {
                        const currentQuestions = (selectedLevel.examQuestions && selectedLevel.examQuestions.length > 0)
                          ? selectedLevel.examQuestions.map(q => ({ q: q.question, a: q.options }))
                          : []; // No fallback to hardcoded functions

                        const currentQ = currentQuestions[examStep];
                        if (!currentQ) return (
                          <div className="text-center py-16 space-y-6">
                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                              <FileText size={48} className="text-white/40" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">Imtihon savollari yo'q</h3>
                              <p className="text-white/60">Ushbu daraja uchun hali imtihon savollari kiritilmagan.</p>
                            </div>
                            <button
                              onClick={() => setView('level-lessons')}
                              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                            >
                              Ortga qaytish
                            </button>
                          </div>
                        );

                        return (
                          <div className="space-y-8">
                            {/* Question */}
                            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-xl">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
                                  {examStep + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-bold text-purple-400 mb-3">
                                    Imtihon savoli {examStep + 1} / {currentQuestions.length}
                                  </div>
                                  <div className="text-2xl font-bold leading-relaxed whitespace-pre-wrap">
                                    {currentQ.q}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Answers */}
                            <div className="grid gap-5">
                              {currentQ.a.map((opt, i) => (
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
                        );
                      })()
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
                <h2 className="text-5xl md:text-6xl font-black">{t('certificates')}</h2>
                <p className="text-2xl text-white/70">{t('cert_subtitle')}</p>
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
                    <h3 className="text-3xl font-black">{t('no_certificates_yet')}</h3>
                    <p className="text-xl text-white/60 max-w-lg mx-auto">
                      {t('no_cert_desc')}
                    </p>
                  </div>
                  <button
                    onClick={() => setView('levels')}
                    className="group relative inline-block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur group-hover:blur-lg transition-all"></div>
                    <div className="relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                      <Rocket size={24} />
                      {t('back_to_course')}
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
                            <div className="text-white/80 text-sm font-bold mb-1">{t('cert_num')}</div>
                            <div className="text-white font-black text-lg">{cert.certificateNumber}</div>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="text-center space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-white/90 text-lg font-bold">{t('cert_issued')}</h4>
                            <h3 className="text-4xl font-black text-white">{cert.name}</h3>
                          </div>

                          <div className="py-6 px-8 bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/30">
                            <div className="text-3xl font-black text-white mb-2">{cert.level}</div>
                            <div className="text-white/90 font-bold">{t('cert_course_name')}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-white">
                            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl">
                              <div className="text-2xl font-black">{cert.score}</div>
                              <div className="text-sm font-bold text-white/80">{t('cert_result')}</div>
                            </div>
                            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl">
                              <div className="text-sm font-black">{cert.date}</div>
                              <div className="text-xs font-bold text-white/80">{t('cert_date')}</div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                          <button className="flex-1 py-4 bg-white text-orange-600 rounded-xl font-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                            <Download size={20} />
                            {t('download')}
                          </button>
                          <button className="flex-1 py-4 bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 rounded-xl font-black hover:scale-105 transition-all flex items-center justify-center gap-2">
                            <Send size={20} />
                            {t('share')}
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
                          {user.level || t('new_student')}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl text-white font-bold border border-white/30">
                          {completedLevels.length} {t('level_label')}
                        </span>
                      </div>
                      <p className="text-white/90 max-w-2xl">
                        {t('profile_welcome_msg')}
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
                    label: t('stats_lessons'),
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: Trophy,
                    value: completedLevels.length,
                    label: t('stats_levels'),
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: Award,
                    value: certificates.length,
                    label: t('certificates'),
                    color: 'from-yellow-500 to-orange-500'
                  },
                  {
                    icon: Target,
                    value: `${Math.round((completedLessons.length / (levels.reduce((acc, l) => acc + l.lessons.length, 0))) * 100)}%`,
                    label: t('total_progress'),
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
                  {t('recent_activity')}
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
                        <span className="text-xs font-bold text-white/50">{t('completed')}</span>
                      </div>
                    ) : null;
                  })}

                  {completedLessons.length === 0 && (
                    <div className="text-center py-12 text-white/50">
                      <p>{t('no_activity_yet')}</p>
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
                <h2 className="text-5xl md:text-6xl font-black">{t('help_center')}</h2>
                <p className="text-2xl text-white/70">{t('faq_subtitle')}</p>
              </div>

              {/* FAQ Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { icon: Target, title: t('faq_q1_t'), desc: t('faq_q1_d'), color: 'from-blue-500 to-cyan-500' },
                  { icon: Brain, title: t('faq_q2_t'), desc: t('faq_q2_d'), color: 'from-purple-500 to-pink-500' },
                  { icon: BookOpen, title: t('faq_q3_t'), desc: t('faq_q3_d'), color: 'from-green-500 to-emerald-500' },
                  { icon: ClipboardCheck, title: t('faq_q4_t'), desc: t('faq_q4_d'), color: 'from-orange-500 to-red-500' },
                  { icon: Trophy, title: t('faq_q5_t'), desc: t('faq_q5_d'), color: 'from-indigo-500 to-purple-500' },
                  { icon: Award, title: t('faq_q6_t'), desc: t('faq_q6_d'), color: 'from-yellow-500 to-orange-500' },
                  { icon: Shield, title: t('faq_q7_t'), desc: t('faq_q7_d'), color: 'from-red-500 to-pink-500' },
                  { icon: Zap, title: t('faq_q8_t'), desc: t('faq_q8_d'), color: 'from-cyan-500 to-blue-500' }
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
                  <h3 className="text-3xl font-black text-white">{t('more_questions')}</h3>
                  <p className="text-xl text-white/90 max-w-2xl mx-auto">
                    {t('ai_help_ready')}
                  </p>
                  <button
                    onClick={() => setShowChat(true)}
                    className="group relative inline-block"
                  >
                    <div className="absolute inset-0 bg-white rounded-2xl blur group-hover:blur-lg transition-all"></div>
                    <div className="relative px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg hover:scale-110 transition-all shadow-2xl flex items-center gap-3">
                      <MessageCircle size={24} />
                      {t('open_ai_chat')}
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
                        {t('level_label')}: {user.currentLevel || t('undefined')}
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
                    <h3 className="text-xl font-black">{t('test_result')}</h3>
                  </div>
                  <div className="text-3xl font-black">{user.placementTestScore ?? 0}/12</div>
                  <p className="text-white/60 text-sm font-bold">{t('correct_answers')}</p>
                </div>

                {/* Completed Levels */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                      <Trophy size={24} />
                    </div>
                    <h3 className="text-xl font-black">{t('stats_levels')}</h3>
                  </div>
                  <div className="text-3xl font-black">{user.completedLevels?.length || 0}</div>
                  <p className="text-white/60 text-sm font-bold">{t('successly_completed')}</p>
                </div>

                {/* Chat Messages Count */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400">
                      <MessageCircle size={24} />
                    </div>
                    <h3 className="text-xl font-black">{t('ai_conversations')}</h3>
                  </div>
                  <div className="text-3xl font-black">{chatMessages.length}</div>
                  <p className="text-white/60 text-sm font-bold">{t('message_exchange')}</p>
                </div>
              </div>

              {/* Chat History Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <MessageCircle className="text-blue-400" />
                  {t('recent_ai_chats')}
                </h3>

                {chatMessages.length > 0 ? (
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 max-h-[500px] overflow-y-auto space-y-4 custom-scrollbar">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-2 p-4 rounded-xl ${msg.role === 'user' ? 'bg-white/5 border border-white/5 ml-auto max-w-[80%]' : 'bg-blue-500/10 border border-blue-500/20 mr-auto max-w-[80%]'}`}>
                        <div className="flex items-center gap-2 text-xs font-bold opacity-50 mb-1">
                          {msg.role === 'user' ? <User size={12} /> : <Brain size={12} />}
                          {msg.role === 'user' ? t('you') : t('ai_assistant')}
                          <span>•</span>
                          <span>{t('just_now')}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center text-white/40 font-bold">
                    {t('no_active_chats')}
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
            <div className="max-w-7xl mx-auto min-h-[600px] flex flex-col md:flex-row gap-8">

              {/* Sidebar Navigation (Desktop) */}
              <div className="w-64 flex-shrink-0 hidden md:block">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sticky top-32 space-y-2">
                  <div className="px-4 py-3 mb-2">
                    <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider">{t('admin_menu_title') || t('menu')}</h3>
                  </div>
                  {[
                    { id: 'dashboard', label: t('admin_menu_dashboard'), icon: LayoutDashboard },
                    { id: 'orders', label: t('admin_menu_orders'), icon: ClipboardCheck },
                    { id: 'submissions', label: t('admin_menu_submissions'), icon: CheckCircle2 },
                    { id: 'users', label: t('admin_menu_users'), icon: Users },
                    { id: 'certificates', label: t('admin_menu_certs'), icon: Award },
                    { id: 'courses', label: t('admin_menu_courses'), icon: BookOpen },
                    { id: 'settings', label: t('admin_menu_settings'), icon: Settings },
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

              {/* Mobile Navigation (Admin) */}
              <div className="md:hidden w-full overflow-x-auto pb-4 mb-4 custom-scrollbar">
                <div className="flex gap-2 min-w-max">
                  {[
                    { id: 'dashboard', label: t('admin_menu_dashboard'), icon: LayoutDashboard },
                    { id: 'orders', label: t('admin_menu_orders'), icon: ClipboardCheck },
                    { id: 'submissions', label: t('admin_menu_submissions'), icon: CheckCircle2 },
                    { id: 'users', label: t('admin_menu_users'), icon: Users },
                    { id: 'certificates', label: t('admin_menu_certs'), icon: Award },
                    { id: 'courses', label: t('admin_menu_courses'), icon: BookOpen },
                    { id: 'settings', label: t('admin_menu_settings'), icon: Settings },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${adminTab === item.id
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                        : 'bg-white/5 text-white/60 border-white/10'
                        }`}
                    >
                      <item.icon size={16} />
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
                      {adminTab === 'certificates' && <Award className="text-blue-400" size={32} />}
                      {adminTab === 'courses' && <BookOpen className="text-blue-400" size={32} />}
                      {adminTab === 'settings' && <Settings className="text-blue-400" size={32} />}
                      {adminTab === 'dashboard' ? t('dashboard_title') :
                        adminTab === 'orders' ? t('admin_orders') :
                          adminTab === 'submissions' ? t('admin_submissions') :
                            adminTab === 'users' ? t('menu_users') :
                              adminTab === 'certificates' ? t('certificates') :
                                adminTab === 'courses' ? t('admin_courses') : t('settings')}
                    </h2>
                    <p className="text-white/60">
                      {adminTab === 'dashboard' ? t('admin_stats_desc') :
                        adminTab === 'orders' ? t('admin_orders_desc') :
                          adminTab === 'submissions' ? t('admin_subs_desc') :
                            adminTab === 'users' ? t('admin_users_desc') :
                              adminTab === 'certificates' ? t('admin_certs_desc') :
                                adminTab === 'courses' ? t('admin_courses_desc') : t('admin_settings_desc')}
                    </p>
                  </div>
                  <button
                    onClick={fetchAdminStats}
                    className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                    title={t('update')}
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
                            { label: t('total_users'), val: adminStats.totalUsers, icon: Users, color: "blue" },
                            { label: t('active_now'), val: adminStats.activeUsers, icon: Zap, color: "green" },
                            { label: t('stats_total_lessons'), val: adminStats.totalCompletedLessons, icon: BookOpen, color: "purple" },
                            { label: t('certificates'), val: adminStats.totalCertificates, icon: Award, color: "orange" }
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
                              {t('recent_activity_admin')}
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
                                      <div className="text-xs text-white/40">{t('new_member')}</div>
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
                            {t('all_orders')}
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">{t('th_user')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">{t('th_level')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">{t('th_amount')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">{t('th_status')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase">{t('th_proof')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase text-right">{t('th_actions')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {adminOrders.length === 0 ? (
                                  <tr>
                                    <td colSpan="6" className="p-8 text-center text-white/40 font-bold">
                                      {t('no_orders')}
                                    </td>
                                  </tr>
                                ) : (
                                  adminOrders.map((order, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                      <td className="p-4">
                                        <div className="font-bold">{order.user?.name || t('unknown')}</div>
                                        <div className="text-xs text-white/40">{order.user?.email}</div>
                                      </td>
                                      <td className="p-4 font-black text-xl text-blue-400">{order.levelId}</td>
                                      <td className="p-4 font-mono">{order.amount?.toLocaleString()} {t('currency')}</td>
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
                                            {t('approve_btn')}
                                          </button>
                                        )}
                                        {order.status === 'approved' && (
                                          <span className="text-green-500 flex items-center justify-end gap-1 font-bold text-sm">
                                            <CheckCircle size={16} /> {t('approved_status')}
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
                            {t('all_submissions')}
                          </h3>
                          <button onClick={fetchSubmissions} className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors" title="Yangilash">
                            <TrendingUp size={20} />
                          </button>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10 text-white/60 text-xs uppercase font-bold">
                              <tr>
                                <th className="p-4">{t('th_user')}</th>
                                <th className="p-4">{t('th_lesson')}</th>
                                <th className="p-4">{t('th_type')}</th>
                                <th className="p-4">{t('th_result')}</th>
                                <th className="p-4">{t('th_status')}</th>
                                <th className="p-4 text-right">{t('th_actions')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {submissions.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-white/40">{t('no_submissions')}</td></tr>
                              ) : (
                                submissions.map((sub) => {
                                  const level = levels.find(l => l.id === sub.levelId);
                                  const lesson = level?.lessons.find(l => l.id === sub.lessonId);
                                  return (
                                    <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                                      <td className="p-4">
                                        <div className="font-bold">{sub.user?.name || t('unknown')}</div>
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
                                          <span className="font-bold text-lg">{sub.score} {t('points').toLowerCase()}</span>
                                        ) : (
                                          sub.fileUrl ? (
                                            <a href={`https://arabiyya-pro-backend.onrender.com${sub.fileUrl}${localStorage.getItem('token') ? `?token=${localStorage.getItem('token')}` : ''}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                              <Download size={14} /> {t('file')}
                                            </a>
                                          ) : <span className="text-white/40">{t('no_file')}</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${sub.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                          sub.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                          }`}>
                                          {t(`status_${sub.status}`)}
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
                                          {t('grading')}
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

                              <h3 className="text-2xl font-black mb-4 border-b border-white/10 pb-4">{t('grade_submission')}</h3>

                              <div className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-xl">
                                  <div className="text-xs font-bold text-white/40 uppercase mb-1">{t('student')}</div>
                                  <div className="text-lg font-bold">{editingSubmission.user?.name}</div>
                                  <div className="text-white/60 text-xs">{editingSubmission.user?.email}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white/5 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-white/40 uppercase mb-1">{t('type')}</div>
                                    <div className="font-mono text-blue-300 capitalize">{editingSubmission.type}</div>
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-xl">
                                    <div className="text-xs font-bold text-white/40 uppercase mb-1">{t('status')}</div>
                                    <div className="font-bold uppercase">{t(`status_${editingSubmission.status}`)}</div>
                                  </div>
                                </div>

                                {editingSubmission.type === 'homework' && editingSubmission.fileUrl && (
                                  <div>
                                    <label className="text-xs font-bold text-white/40 uppercase mb-1 block uppercase">{t('file')}</label>
                                    <a href={`https://arabiyya-pro-backend.onrender.com${editingSubmission.fileUrl}${localStorage.getItem('token') ? `?token=${localStorage.getItem('token')}` : ''}`} target="_blank" rel="noreferrer" className="w-full bg-blue-600/20 text-blue-400 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-colors border border-blue-500/20 font-bold">
                                      <Download size={18} /> {t('download_pdf')} / {t('view_courses').split(' ')[0]}
                                    </a>
                                  </div>
                                )}

                                <div>
                                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">{t('grade_label')}</label>
                                  <input
                                    type="number"
                                    value={editingSubmission.score || 0}
                                    onChange={(e) => setEditingSubmission({ ...editingSubmission, score: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xl focus:border-blue-500 transition-colors"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">{t('teacher_comment')}</label>
                                  <textarea
                                    value={editingSubmission.comment || ''}
                                    onChange={(e) => setEditingSubmission({ ...editingSubmission, comment: e.target.value })}
                                    placeholder={t('comment_placeholder')}
                                    className="w-full h-24 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:border-blue-500 transition-colors"
                                  ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                  <button
                                    onClick={() => handleGrade('rejected')}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl transition-colors border border-red-500/20"
                                  >
                                    {t('reject')} ❌
                                  </button>
                                  <button
                                    onClick={() => handleGrade('approved')}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20"
                                  >
                                    {t('approve')} ✅
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CERTIFICATES TAB */}
                    {adminTab === 'certificates' && (
                      <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Award className="text-yellow-400" />
                            {t('student_progress')}
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-white/5 border-b border-white/10 text-white/40 uppercase text-xs font-black">
                                <tr>
                                  <th className="p-4">{t('user')}</th>
                                  <th className="p-4">{t('completed_levels')}</th>
                                  <th className="p-4">{t('max_score')}</th>
                                  <th className="p-4">{t('certs_count')}</th>
                                  <th className="p-4 text-right">{t('progress')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {adminUsers.map((u, i) => {
                                  const completedCount = u.completedLevels?.length || 0;
                                  const maxScore = u.completedLevels?.length > 0
                                    ? Math.max(...u.completedLevels.map(cl => cl.examScore))
                                    : 0;

                                  return (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedAdminUser(u)}>
                                      <td className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center font-black text-yellow-500 border border-yellow-500/20">
                                            {u.name?.charAt(0)}
                                          </div>
                                          <div>
                                            <div className="font-bold text-white group-hover:text-yellow-400 transition-colors">{u.name}</div>
                                            <div className="text-[10px] text-white/40 font-mono">{u.email}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                          {u.completedLevels?.map(cl => (
                                            <span key={cl.levelId} className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded border border-green-500/20">
                                              {cl.levelId}
                                            </span>
                                          )) || <span className="text-white/20 text-xs">-</span>}
                                        </div>
                                      </td>
                                      <td className="p-4 font-black text-white/80">{maxScore}%</td>
                                      <td className="p-4">
                                        <div className="flex items-center gap-2">
                                          <Award size={14} className="text-yellow-500" />
                                          <span className="font-bold">{u.certificates?.length || 0}</span>
                                        </div>
                                      </td>
                                      <td className="p-4 text-right">
                                        <div className="w-24 bg-white/5 rounded-full h-1.5 ml-auto overflow-hidden">
                                          <div
                                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-1000"
                                            style={{ width: `${(completedCount / 6) * 100}%` }}
                                          ></div>
                                        </div>
                                        <div className="text-[10px] text-white/40 mt-1 font-bold">{completedCount}/6 {t('level_label')}</div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
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
                                placeholder={t('search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-black/20 text-white placeholder-white/40 focus:outline-none focus:bg-black/40 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                              />
                            </div>
                            <div className="text-sm text-white/40 font-bold">
                              {t('total')}: {adminUsers.length}
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">{t('user')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">{t('email')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">{t('level_label')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider">{t('role')}</th>
                                  <th className="p-4 font-bold text-white/60 text-sm uppercase tracking-wider text-right">{t('actions')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {adminUsers
                                  .filter(u =>
                                    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                  )
                                  .map((u, i) => (
                                    <tr
                                      key={i}
                                      onClick={() => setSelectedAdminUser(u)}
                                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                      <td className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                            {u.name.charAt(0)}
                                          </div>
                                          <div>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{u.name}</div>
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
                                          {t(`role_${u.role}`)}
                                        </span>
                                      </td>
                                      <td className="p-4 text-right">
                                        {u._id !== user.id && (
                                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Daraja berish tugmasi */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setGrantingLevelTo(u);
                                                setShowGrantLevelModal(true);
                                              }}
                                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/20 transition-all flex items-center gap-1"
                                              title={t('grant_level')}
                                            >
                                              <Gift size={14} />
                                              {t('grant_level')}
                                            </button>

                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleRoleUpdate(u._id, u.role === 'admin' ? 'user' : 'admin'); }}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.role === 'admin'
                                                ? 'bg-white/10 text-white hover:bg-white/20'
                                                : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/20'
                                                }`}
                                            >
                                              {u.role === 'admin' ? t('make_user') : t('make_admin')}
                                            </button>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id, u.name); }}
                                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                                              title={t('delete_user')}
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
                                      {t('all_lessons_count').replace('{modul}', Math.ceil(level.lessons.length / 5)).replace('{dars}', level.lessons.length)}
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-black mb-2">{t(`level_${level.id}_title`) || level.title}</h3>
                                  <p className="text-sm text-white/60 mb-6 line-clamp-2">{t(`level_${level.id}_desc`) || level.description}</p>

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
                                        {t('more_lessons_prefix')} {level.lessons.length - 3} {t('more_lessons_suffix')}
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => setEditingLevel(level)}
                                    className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                  >
                                    <Settings size={16} />
                                    {t('manage')}
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
                                  <p className="text-white/60 text-sm font-bold">{t('manage_lessons')}</p>
                                </div>
                              </div>
                              <div className={`px-4 py-2 rounded-xl text-xs font-bold border bg-white/5 border-white/10`}>
                                {editingLevel.lessons.length} {t('lesson_label')}
                              </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                  <Book size={20} className="text-blue-400" />
                                  {t('level_book_desc')}
                                </h4>
                                {editingLevel.levelBookUrl && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(t('delete_confirm'))) {
                                        setEditingLevel({ ...editingLevel, levelBookUrl: '' });
                                      }
                                    }}
                                    className="text-red-400 text-xs hover:text-red-300 font-bold"
                                  >
                                    {t('delete_user')}
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col md:flex-row gap-4">
                                {editingLevel.levelBookUrl ? (
                                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <span className="text-green-400 text-sm truncate max-w-[400px]">{editingLevel.levelBookUrl}</span>
                                    <CheckCircle2 size={16} className="text-green-500" />
                                  </div>
                                ) : (
                                  <div className="flex-1 flex gap-2">
                                    <label className={`flex-1 bg-white/5 ${uploadingLevelBook ? 'opacity-50 cursor-wait' : 'hover:bg-white/10 cursor-pointer'} border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white transition-all flex items-center justify-center gap-2`}>
                                      {uploadingLevelBook ? (
                                        <Loader2 size={18} className="animate-spin text-blue-400" />
                                      ) : (
                                        <Upload size={18} className="text-blue-400" />
                                      )}
                                      <span className="text-sm">{uploadingLevelBook ? t('uploading') : t('upload_pdf')}</span>
                                      {!uploadingLevelBook && (
                                        <input
                                          type="file"
                                          accept=".pdf"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            if (!file.name.toLowerCase().endsWith('.pdf')) {
                                              alert(t('pdf_only'));
                                              return;
                                            }

                                            const formData = new FormData();
                                            formData.append('file', file);
                                            setUploadingLevelBook(true);
                                            try {
                                              const token = localStorage.getItem('token');
                                              if (!token) {
                                                alert('❌ ' + t('token_error'));
                                                return;
                                              }
                                              console.log('📤 Yuklash boshlandi:', file.name, file.size);
                                              const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/admin/upload-book?levelId=${editingLevel.id}`, {
                                                method: 'POST',
                                                headers: { 'Authorization': `Bearer ${token}` },
                                                body: formData
                                              });

                                              console.log('📥 Server javobi status:', res.status);
                                              const data = await res.json();
                                              console.log('📥 Server javobi:', data);

                                              if (data.success && data.fileUrl) {
                                                setEditingLevel({ ...editingLevel, levelBookUrl: data.fileUrl });
                                                alert('✅ ' + t('upload_success'));
                                              } else {
                                                alert('❌ Yuklashda xatolik: ' + (data.message || 'Noma\'lum xato. Console-ni tekshiring.'));
                                              }
                                            } catch (err) {
                                              console.error('Upload xatosi:', err);
                                              alert('❌ ' + t('connection_error'));
                                            } finally {
                                              setUploadingLevelBook(false);
                                            }
                                          }}
                                        />
                                      )}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="URL manzil..."
                                      className="w-1/3 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm"
                                      value={editingLevel.levelBookUrl || ''}
                                      onChange={(e) => setEditingLevel({ ...editingLevel, levelBookUrl: e.target.value })}
                                    />
                                  </div>
                                )}

                                <button
                                  onClick={handleSaveLevelSettings}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                >
                                  <Save size={18} />
                                  {t('save')}
                                </button>
                              </div>
                              <p className="text-xs text-white/40">
                                💡 {t('book_hint')}
                              </p>
                            </div>

                            {/* Exam Management Button */}
                            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-2xl border border-blue-500/20 flex items-center justify-between">
                              <div>
                                <h4 className="text-xl font-bold flex items-center gap-2 mb-1">
                                  <Award className="text-blue-400" />
                                  Daraja Imtihoni
                                </h4>
                                <p className="text-white/60 text-sm">
                                  {editingLevel.examQuestions && editingLevel.examQuestions.length > 0
                                    ? `${editingLevel.examQuestions.length} ta savol kiritilgan`
                                    : "Imtihon savollari kiritilmagan"}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingExamQuestions(editingLevel.examQuestions || []);
                                  setShowExamEditor(true);
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                              >
                                <Settings size={18} />
                                Imtihonni Tahrirlash
                              </button>
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
                                  {t('add')}
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
                                          <h5 className="font-black text-lg">{t('module')} {moduleNumber}</h5>
                                          <p className="text-xs text-white/60">{moduleLessons.length} {t('lesson_label')}</p>
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
                                  {t('no_lessons_msg') || t('no_quiz_msg')}
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
                            {t('select_language')}
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">{t('language')}</label>
                              <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                              >
                                <option value="uz">{t('uzbek')}</option>
                                <option value="ru">{t('russian')}</option>
                                <option value="en">{t('english')}</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">{t('light_mode')} / {t('dark_mode')}</label>
                              <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                              >
                                <option value="dark">{t('dark_mode')}</option>
                                <option value="light">{t('light_mode')}</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Admin Users Management */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-purple-400" />
                            {t('admins_management')}
                          </h3>
                          <p className="text-sm text-white/60 mb-6">
                            {t('admins_desc')}
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
                                    {t('remove_admin')}
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
                              {t('go_to_users')}
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
                              placeholder={t('old_password')}
                              className="w-full bg-black/20 px-4 py-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                              value={passwordForm.oldPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                            />
                            <input
                              type="password"
                              placeholder={t('new_password_hint')}
                              className="w-full bg-black/20 px-4 py-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            />
                            <button
                              onClick={handleUpdatePassword}
                              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all border border-red-500/20"
                            >
                              {t('update_password')}
                            </button>
                          </div>
                        </div>

                        {/* Section 4: Maintenance */}
                        <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10">
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-red-400" />
                            Tizim Tozalash
                          </h3>
                          <p className="text-sm text-white/50 mb-6">
                            Agar darsliklar (PDF) ochilmasa yoki "localhost" linklari qolib ketgan bo'lsa, ushbu tozalash amalidan foydalaning. Bu barcha dars va darajalardagi buzilgan linklarni o'chiradi. Shundan so'ng kitoblarni qayta yuklashingiz kerak bo'ladi.
                          </p>
                          <button
                            onClick={handleCleanupLinks}
                            className={`w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                            disabled={loading}
                          >
                            <Trash2 size={20} />
                            {loading ? t('cleaning') : t('cleanup_btn')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* USER DETAIL MODAL */}
                    {selectedAdminUser && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#030712] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-white/5">
                            <button
                              onClick={() => setSelectedAdminUser(null)}
                              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white"
                            >
                              <X size={24} />
                            </button>

                            <div className="flex items-center gap-6">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl">
                                {selectedAdminUser.name?.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-3xl font-black mb-1">{selectedAdminUser.name}</h3>
                                <p className="text-white/40 font-mono text-sm">{selectedAdminUser.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="text-white/40 text-xs font-bold uppercase mb-2 tracking-widest">{t('current_course')}</div>
                                <div className="text-xl font-black text-blue-400">{selectedAdminUser.currentLevel || 'N/A'}</div>
                              </div>
                              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="text-white/40 text-xs font-bold uppercase mb-2 tracking-widest">{t('joined_at')}</div>
                                <div className="text-xl font-black text-purple-400">
                                  {new Date(selectedAdminUser.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {/* Progress Section */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Target size={16} /> {t('progress_stats')}
                              </h4>

                              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-6">
                                {selectedAdminUser.completedLevels?.length > 0 ? (
                                  selectedAdminUser.completedLevels.map((cl, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs border border-green-500/20">
                                          {cl.levelId}
                                        </div>
                                        <div>
                                          <div className="font-bold text-sm">Level {cl.levelId} {t('level_completed_msg')}</div>
                                          <div className="text-[10px] text-white/40">{new Date(cl.completedAt).toLocaleDateString()}</div>
                                        </div>
                                      </div>
                                      <div className="text-lg font-black text-green-400">{cl.examScore}%</div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-white/20 italic">{t('no_progress')}</div>
                                )}
                              </div>
                            </div>

                            {/* Time Stats (Mock) */}
                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-3xl border border-blue-500/10">
                              <div className="flex items-center gap-4 text-sm font-bold text-white/80">
                                <Clock className="text-blue-400" />
                                <span>{t('time_spent')}:</span>
                                <span className="text-blue-400 font-black">
                                  {(selectedAdminUser.completedLevels?.length * 4.5 || 0.5).toFixed(1)} {t('hours')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="p-8 border-t border-white/5 flex gap-4 bg-white/5">
                            <button
                              onClick={() => setSelectedAdminUser(null)}
                              className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 font-bold transition-all border border-white/10"
                            >
                              {t('close')}
                            </button>
                            <button
                              onClick={() => { setView('admin'); setAdminTab('certificates'); setSelectedAdminUser(null); }}
                              className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition-all shadow-lg shadow-blue-500/20"
                            >
                              {t('view_certs_btn')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center pt-10 text-white/20 text-xs font-mono uppercase tracking-widest bg-white/5 py-4 rounded-xl border border-white/5">
                      Arabiyya Pro v1.2.0 • Stable Release
                    </div>
                  </>
                ) : (
                  <div className="text-center py-24">
                    <Loader2 className="animate-spin mx-auto text-white/40 mb-4" size={40} />
                    <p className="text-white/40 font-bold">{t('loading_data')}</p>
                  </div>
                )}
              </div>
            </div>
          )
        }
      </main>

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
                    <Brain className="text-blue-500" /> {t('ai_assistant')}
                  </h3>
                  <button onClick={startNewChat} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 text-white transition-colors" title={t('new_chat')}>
                    <Plus size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {chats.length === 0 ? (
                    <div className="text-center text-white/40 py-10 text-sm">{t('ai_chat_history')}</div>
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
                        <button onClick={(e) => deleteChat(chat._id, e)} className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title={t('delete_user')}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {chats.length > 0 && (
                  <div className="p-4 border-t border-white/10">
                    <button onClick={clearAllChats} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                      <Trash2 size={16} /> {t('delete_all_chats')}
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
                      <h3 className="font-bold text-white text-lg">{t('ai_assistant')}</h3>
                      <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> {status === 'typing' ? t('ai_typing') : 'Online'}</p>
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
                      <h3 className="text-2xl font-bold text-white">{t('ai_greeting')}</h3>
                      <p className="text-white/60">{t('ai_help_text')}</p>
                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        {["Grammatika", "So'zlashuv", "Tarjima", "Mashqlar"].map(category => (
                          <button key={category} onClick={() => setChatInput(category)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all">
                            {t(`ai_starter_${category.toLowerCase().replace(/[' ]/g, '')}`)}
                          </button>
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
                  {isChatLoading && <div className="flex items-center gap-2 text-white/50 bg-white/5 p-4 rounded-xl w-fit"><Loader2 className="animate-spin" size={18} /> {t('ai_typing')}</div>}
                </div>

                {/* Input Area */}
                <div className="p-5 border-t border-white/10 bg-black/20 backdrop-blur-md">
                  <div className="flex gap-3 max-w-4xl mx-auto w-full">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && !isChatLoading && sendChatMessage()}
                      placeholder={t('ai_placeholder')}
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
                {t('footer_desc')}
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

            {/* KURSLAR */}
            <div className="space-y-5">
              <h4 className="font-black text-blue-400 text-sm tracking-wider uppercase">{t('courses_title')}</h4>
              <div className="space-y-3">
                {[
                  { label: t('all_levels'), view: 'levels' },
                  { label: 'A1 - ' + (language === 'uz' ? 'Boshlang\'ich' : language === 'ru' ? 'Начальный' : 'Beginner'), level: 'A1' },
                  { label: 'B1 - ' + (language === 'uz' ? 'O\'rta' : language === 'ru' ? 'Средний' : 'Intermediate'), level: 'B1' },
                  { label: 'C1 - ' + (language === 'uz' ? 'Ilg\'or' : language === 'ru' ? 'Продвинутый' : 'Advanced'), level: 'C1' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { setView('levels'); }}
                    className="block text-white/60 hover:text-white text-sm font-bold transition-all duration-300 hover:translate-x-2"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PLATFORMA */}
            <div className="space-y-5">
              <h4 className="font-black text-purple-400 text-sm tracking-wider uppercase">{t('platform_title')}</h4>
              <div className="space-y-3">
                {[
                  { label: t('help_center'), view: 'help' },
                  { label: t('certificates'), view: 'certificates' },
                  { label: t('registration'), view: 'auth' },
                  { label: t('privacy_policy'), view: 'home' }
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

            {/* ALOQA */}
            <div className="space-y-5">
              <h4 className="font-black text-pink-400 text-sm tracking-wider uppercase">{t('contact_title')}</h4>
              <div className="space-y-4">
                {[
                  { icon: Mail, text: 'humoyunanvarjonov466@gmail.com', link: 'mailto:humoyunanvarjonov466@gmail.com' },
                  { icon: Phone, text: '+998 97 632 63 64', link: 'tel:+998976326364' },
                  { icon: MapPin, text: t('location'), link: '#' }
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
              © 2026 Arabiyya Pro. {t('copyright')}
            </p>
            <div className="flex gap-8">
              {['privacy_policy', 'terms_service', 'cookie_policy'].map((key, i) => (
                <button
                  key={i}
                  className="text-xs font-bold text-white/40 hover:text-white transition-colors duration-300"
                >
                  {t(key)}
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

      {/* User Details Modal (Admin) */}
      {
        selectedAdminUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0f172a] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl">
                    {selectedAdminUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">{selectedAdminUser.name}</h3>
                    <p className="text-white/60 font-bold">{selectedAdminUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAdminUser(null)}
                  className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-1">
                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider">{t('current_level')}</div>
                    <div className="text-2xl font-black text-blue-400">{selectedAdminUser.currentLevel || 'A1'}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-1">
                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider">{t('time_spent')}</div>
                    <div className="text-2xl font-black text-purple-400">{selectedAdminUser.totalTimeSpent || 0} {t('minutes')}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-1">
                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider">{t('th_lesson')}</div>
                    <div className="text-2xl font-black text-green-400">{selectedAdminUser.completedLessons?.length || 0}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-1">
                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider">{t('certs_count')}</div>
                    <div className="text-2xl font-black text-yellow-400">{selectedAdminUser.certificates?.length || 0}</div>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Purchased Levels */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                    <h4 className="font-black text-lg flex items-center gap-2">
                      <Trophy size={18} className="text-blue-400" />
                      {t('unlocked_levels')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => {
                        const isUnlocked = selectedAdminUser.purchasedLevels?.includes(lvl) || lvl === 'A1';
                        return (
                          <div key={lvl} className={`px-4 py-2 rounded-xl text-sm font-black border ${isUnlocked
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                            : 'bg-white/5 text-white/20 border-white/10'
                            }`}>
                            {lvl}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Completed Levels */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                    <h4 className="font-black text-lg flex items-center gap-2">
                      <Trophy size={18} className="text-yellow-400" />
                      {t('completed_levels_title')}
                    </h4>
                    <div className="space-y-2">
                      {(selectedAdminUser.completedLevels && selectedAdminUser.completedLevels.length > 0) ? (
                        selectedAdminUser.completedLevels.map((cl, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="font-black">{cl.levelId}</span>
                            <span className="text-green-400 font-bold">{cl.examScore}%</span>
                            <span className="text-xs text-white/40">{new Date(cl.completedAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-white/20 text-sm font-bold py-2">{t('no_progress')}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last Activity Section */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                  <h4 className="font-black text-lg flex items-center gap-2">
                    <Clock size={18} className="text-indigo-400" />
                    {t('usage_stats')}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                      <span className="text-white/60 font-bold">{t('last_active')}:</span>
                      <span className="text-white font-black">{selectedAdminUser.lastActive ? new Date(selectedAdminUser.lastActive).toLocaleString() : t('unknown')}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                      <span className="text-white/60 font-bold">{t('joined_at')}:</span>
                      <span className="text-white font-black">{new Date(selectedAdminUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
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
                  {t('edit_lesson')}: <span className="text-blue-400">{editLessonData.title}</span>
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
                    { id: 'main', label: t('tab_main'), icon: <Video size={18} /> },
                    { id: 'theory', label: t('tab_theory'), icon: <BookOpen size={18} /> },
                    { id: 'practice', label: t('tab_practice'), icon: <PenTool size={18} /> },
                    { id: 'homework', label: t('tab_homework'), icon: <Home size={18} /> },
                    { id: 'quiz', label: t('tab_quiz'), icon: <CheckCircle2 size={18} /> }
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
                      { id: 'main', label: t('tab_main') },
                      { id: 'theory', label: t('tab_theory') },
                      { id: 'practice', label: t('tab_practice') },
                      { id: 'homework', label: t('tab_homework') },
                      { id: 'quiz', label: t('tab_quiz') }
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
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Video size={20} className="text-blue-400" /> {t('main_info')}</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-white/60 mb-1 block uppercase">{t('lesson_title')}</label>
                          <input
                            type="text"
                            value={editLessonData.title}
                            onChange={e => setEditLessonData({ ...editLessonData, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-4">

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-bold text-white/60 uppercase">{t('book_pdf')}</label>
                              {editLessonData.ebookUrl && (
                                <button
                                  onClick={() => setEditLessonData({ ...editLessonData, ebookUrl: '' })}
                                  className="text-red-400 text-xs hover:text-red-300"
                                >
                                  {t('actions_delete')}
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
                                <label className={`flex-1 bg-white/5 ${uploadingLessonBook ? 'opacity-50 cursor-wait' : 'hover:bg-white/10 cursor-pointer'} border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white transition-all flex items-center justify-center gap-2`}>
                                  {uploadingLessonBook ? (
                                    <Loader2 size={18} className="animate-spin text-blue-400" />
                                  ) : (
                                    <Upload size={18} className="text-blue-400" />
                                  )}
                                  <span className="text-sm">{uploadingLessonBook ? t('uploading') : t('upload_pdf_btn')}</span>
                                  {!uploadingLessonBook && (
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        if (!file.name.toLowerCase().endsWith('.pdf')) {
                                          alert(t('pdf_upload_error'));
                                          return;
                                        }

                                        const formData = new FormData();
                                        formData.append('file', file);
                                        try {
                                          setUploadingLessonBook(true);
                                          const token = localStorage.getItem('token');
                                          if (!token) {
                                            alert('❌ Token topilmadi. Iltimos, tizimga qaytadan kiring.');
                                            return;
                                          }
                                          const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/admin/upload-book?levelId=${editingLevel.id}`, {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${token}` },
                                            body: formData
                                          });

                                          const data = await res.json();
                                          if (data.success) {
                                            setEditLessonData({ ...editLessonData, ebookUrl: data.fileUrl });
                                          } else {
                                            alert('Yuklashda xatolik: ' + (data.message || 'Noma\'lum xato'));
                                          }
                                        } catch (err) {
                                          console.error('Upload Error:', err);
                                          alert('Aloqa xatosi! Internetingizni tekshiring.');
                                        } finally {
                                          setUploadingLessonBook(false);
                                        }
                                      }}
                                    />
                                  )}
                                </label>
                                {/* Fallback text input */}
                                <input
                                  type="text"
                                  className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white/60 focus:text-white outline-none"
                                  placeholder={t('or_url')}
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
                        <h4 className="text-xl font-bold flex items-center gap-2"><BookOpen size={20} className="text-blue-400" /> {t('theory_section')}</h4>
                        <span className="text-xs text-white/40">{t('md_support')}</span>
                      </div>
                      <textarea
                        value={editLessonData.theory}
                        onChange={e => setEditLessonData({ ...editLessonData, theory: e.target.value })}
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-white focus:border-blue-500 outline-none text-base leading-relaxed font-mono min-h-[400px]"
                        placeholder={t('theory_placeholder')}
                      ></textarea>
                    </div>
                  )}

                  {/* TAB: Practice */}
                  {editLessonTab === 'practice' && (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><PenTool size={20} className="text-blue-400" /> {t('practice_section')}</h4>
                      <textarea
                        value={editLessonData.practice}
                        onChange={e => setEditLessonData({ ...editLessonData, practice: e.target.value })}
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-white focus:border-blue-500 outline-none text-base leading-relaxed font-mono min-h-[400px]"
                        placeholder={t('practice_placeholder')}
                      ></textarea>
                    </div>
                  )}

                  {/* TAB: Homework */}
                  {editLessonTab === 'homework' && (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Home size={20} className="text-blue-400" /> {t('homework_section')}</h4>
                      <textarea
                        value={editLessonData.homework}
                        onChange={e => setEditLessonData({ ...editLessonData, homework: e.target.value })}
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-white focus:border-blue-500 outline-none text-base leading-relaxed font-mono min-h-[400px]"
                        placeholder={t('homework_placeholder')}
                      ></textarea>
                    </div>
                  )}

                  {/* TAB: Quiz */}
                  {editLessonTab === 'quiz' && (
                    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
                      <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-900/90 backdrop-blur z-10 py-4 border-b border-white/10">
                        <h4 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 size={20} className="text-blue-400" /> {t('quiz_section')} ({editLessonData.quiz?.length || 0})</h4>
                        <button
                          onClick={() => setEditLessonData({
                            ...editLessonData,
                            quiz: [...(editLessonData.quiz || []), { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                          })}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                          <Plus size={16} /> {t('add_question')}
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
                              <label className="text-xs font-bold text-white/40 mb-1 block">{t('question_text')}</label>
                              <input
                                type="text"
                                value={q.question}
                                onChange={e => {
                                  const newQuiz = [...editLessonData.quiz];
                                  newQuiz[idx].question = e.target.value;
                                  setEditLessonData({ ...editLessonData, quiz: newQuiz });
                                }}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-blue-500 outline-none font-medium"
                                placeholder={t('enter_question')}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  onClick={() => {
                                    const newQuiz = editLessonData.quiz.map((q, i) =>
                                      i === idx ? { ...q, correctAnswer: optIdx } : q
                                    );
                                    setEditLessonData({ ...editLessonData, quiz: newQuiz });
                                  }}
                                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${q.correctAnswer === optIdx ? 'bg-green-500/10 border-green-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={q.correctAnswer === optIdx}
                                    readOnly // Controlled by parent div click
                                    className="w-4 h-4 text-green-500 accent-green-500 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={e => {
                                      const newQuiz = editLessonData.quiz.map((item, i) => {
                                        if (i === idx) {
                                          const newOptions = [...item.options];
                                          newOptions[optIdx] = e.target.value;
                                          return { ...item, options: newOptions };
                                        }
                                        return item;
                                      });
                                      setEditLessonData({ ...editLessonData, quiz: newQuiz });
                                    }}
                                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-white/20"
                                    placeholder={`${t('option_label')} ${optIdx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {editLessonData.quiz?.length === 0 && (
                          <div className="text-center py-16 text-white/30 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4">
                            <CheckCircle2 size={48} className="text-white/10" />
                            <p>{t('no_quiz_msg')}</p>
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
                  {t('cancel')}
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
                        alert('✅ ' + t('lesson_saved'));
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
                  {t('save')}
                </button>
              </div>

            </div>
          </div>
        )
      }

      {/* LEVEL EXAM EDITOR MODAL */}
      {showExamEditor && editingLevel && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Brain className="text-blue-500" />
                  {editingLevel.title} - {t('exam_questions_title')}
                </h3>
                <p className="text-white/60 text-sm">{t('exam_hint')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-bold border border-white/10">
                  {t('total')}: {editingExamQuestions.length}
                </span>
                <button onClick={() => setShowExamEditor(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {editingExamQuestions.map((q, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group hover:border-white/20 transition-all">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-white/40">#{idx + 1}</span>
                    <button
                      onClick={() => {
                        if (!confirm(t('delete_confirm_short'))) return;
                        const newQs = [...editingExamQuestions];
                        newQs.splice(idx, 1);
                        setEditingExamQuestions(newQs);
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 pr-12">
                    <div>
                      <label className="text-xs font-bold text-white/40 uppercase mb-1 block">{t('savol_label')}</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => {
                          const newQs = [...editingExamQuestions];
                          newQs[idx].question = e.target.value;
                          setEditingExamQuestions(newQs);
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none font-medium text-lg leading-relaxed"
                        rows={2}
                        placeholder={t('savol_placeholder')}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          onClick={() => {
                            const newQs = [...editingExamQuestions];
                            newQs[idx].correctAnswer = optIdx;
                            setEditingExamQuestions(newQs);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${q.correctAnswer === optIdx ? 'bg-green-500/10 border-green-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${q.correctAnswer === optIdx ? 'border-green-500 text-green-500' : 'border-white/20 text-transparent'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${q.correctAnswer === optIdx ? 'bg-green-500' : ''}`} />
                          </div>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newQs = [...editingExamQuestions];
                              newQs[idx].options[optIdx] = e.target.value;
                              setEditingExamQuestions(newQs);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-white/20"
                            placeholder={`${t('option_label')} ${['A', 'B', 'C', 'D'][optIdx]}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setEditingExamQuestions([
                  ...editingExamQuestions,
                  { question: '', options: ['', '', '', ''], correctAnswer: 0 }
                ])}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {t('add_new_question')}
              </button>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-slate-900/50 rounded-b-3xl flex justify-end gap-4">
              <button
                onClick={() => setShowExamEditor(false)}
                className="px-6 py-3 rounded-xl text-white/60 hover:text-white font-bold transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  if (!token) return;
                  try {
                    const res = await fetch(`https://arabiyya-pro-backend.onrender.com/api/levels/${editingLevel.id}/exam`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ examQuestions: editingExamQuestions })
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert("✅ " + t('exam_saved'));
                      setShowExamEditor(false);
                      // Refresh levels
                      fetchLevels();
                    } else {
                      alert("Xatolik: " + data.message);
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Server xatosi");
                  }
                }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Save size={20} />
                {t('save')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default App;