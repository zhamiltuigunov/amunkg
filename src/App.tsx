import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import NewsSection from "./components/NewsSection";
import ConferenceDirectory from "./components/ConferenceDirectory";
import DelegateGuides from "./components/DelegateGuides";
import AboutUs from "./components/AboutUs";
import Contacts from "./components/Contacts";
import UserCabinet from "./components/UserCabinet";
import { TermsOfService, PrivacyPolicy } from "./components/Legal";
import { AppUser, NewsPost, MUNConference, AppNotification } from "./types";
import { INITIAL_NEWS_POSTS, INITIAL_CONFERENCES, INITIAL_NOTIFICATIONS } from "./data";
import { Award, Globe2, ShieldCheck, Mail, ArrowUp } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("about");
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("mun_notifications");
    try { return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS; } catch (e) { return INITIAL_NOTIFICATIONS; }
  });

  useEffect(() => {
    localStorage.setItem("mun_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Scroll immediately to start the process
    window.scrollTo(0, 0);
    // And also after animations complete (AnimatePresence has 0.3s duration)
    // to ensure layout shifts don't reset the scroll position
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 350);
    return () => clearTimeout(timeout);
  }, [currentTab]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem("munakr_session_user");
    try { return saved ? JSON.parse(saved) : null; } catch (e) { return null; }
  });

  const [posts, setPosts] = useState<NewsPost[]>(() => {
    const saved = localStorage.getItem("mun_posts");
    try { return saved ? JSON.parse(saved) : INITIAL_NEWS_POSTS; } catch (e) { return INITIAL_NEWS_POSTS; }
  });

  const [conferences, setConferences] = useState<MUNConference[]>(() => {
    const saved = localStorage.getItem("mun_conferences");
    try { return saved ? JSON.parse(saved) : INITIAL_CONFERENCES; } catch (e) { return INITIAL_CONFERENCES; }
  });

  // Track dates and automatically update the internal status from early-bird to standard
  useEffect(() => {
    let changed = false;
    const now = new Date();
    
    const updated = conferences.map(conf => {
      let currentPhase: "early-bird" | "standard" | "closed" | undefined = conf.registrationPhase;
      
      let standardEnd = conf.standardEndDate ? new Date(conf.standardEndDate) : null;
      if (!standardEnd && conf.registrationDeadline) {
        standardEnd = new Date(conf.registrationDeadline);
      }

      if (conf.earlyBirdStartDate && conf.earlyBirdEndDate) {
        const earlyStart = new Date(conf.earlyBirdStartDate);
        const earlyEnd = new Date(conf.earlyBirdEndDate);

        if (now >= earlyStart && now <= earlyEnd) {
          currentPhase = "early-bird";
        } else if (now > earlyEnd && (!standardEnd || now <= standardEnd)) {
          currentPhase = "standard";
        } else if (standardEnd && now > standardEnd) {
          currentPhase = "closed";
        }
      } else {
        // Fallback for standard-only conferences
        if (standardEnd && now > standardEnd) {
          currentPhase = "closed";
        } else {
          currentPhase = "standard";
        }
      }

      if (currentPhase !== conf.registrationPhase) {
        changed = true;
        return { ...conf, registrationPhase: currentPhase };
      }
      return conf;
    });

    if (changed) {
      setConferences(updated);
      localStorage.setItem("mun_conferences", JSON.stringify(updated));
    }
  }, [conferences]);

  const handleSuggestTopic = () => {
    setCurrentTab("guides");
  };

  const handleFocusResolution = () => {
    setCurrentTab("guides");
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("amunkg_theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("amunkg_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("amunkg_theme", "light");
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (currentTab) {
      case "about":
        return <AboutUs setCurrentTab={setCurrentTab} lang={lang} />;
      case "terms":
        return <TermsOfService lang={lang} />;
      case "privacy":
        return <PrivacyPolicy lang={lang} />;
      case "news":
        return (
          <NewsSection 
            posts={posts} 
            setPosts={setPosts} 
            currentUser={currentUser} 
            onSuggestTopic={handleSuggestTopic} 
            lang={lang}
          />
        );
      case "conferences":
        return (
          <ConferenceDirectory 
            conferences={conferences} 
            setConferences={setConferences} 
            currentUser={currentUser} 
            onFocusResolution={handleFocusResolution} 
            lang={lang}
            setNotifications={setNotifications}
          />
        );
      case "guides":
        return <DelegateGuides lang={lang} />;
      case "contacts":
        return <Contacts lang={lang} />;
      case "cabinet":
        return (
          <UserCabinet 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser}
            setCurrentTab={setCurrentTab}
            posts={posts} 
            setPosts={setPosts} 
            conferences={conferences} 
            setConferences={setConferences} 
            lang={lang}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      default:
        return <AboutUs setCurrentTab={setCurrentTab} lang={lang} />;
    }
  };

  return (
    <div id="mun-platform-root" className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-[#c0a080]/30 selection:text-[#1a365d]">
      
      {/* Dynamic Header & Menu Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} lang={lang} setLang={setLang} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} notifications={notifications} setNotifications={setNotifications} currentUser={currentUser} />

      {/* Main Viewport Content rendering */}
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-[#1a365d] dark:bg-[#80add0] text-white dark:text-slate-900 border border-[#1a365d] dark:border-transparent rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            aria-label={lang === "en" ? "Scroll to Top" : "Наверх"}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Diplomatic Footer Panel */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 pt-16 pb-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-slate-900 pb-12 mb-12">
            
            {/* Logo and brand message */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a365d] border border-[#c0a080]/30 flex items-center justify-center text-white">
                  <Award className="w-5 h-5 text-[#c0a080]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black tracking-tight uppercase text-white">
                    {lang === "ru" ? "Альянс MUNKG" : "MUNKG ALLIANCE"}
                  </h3>
                  <p className="text-[10px] font-mono tracking-widest text-[#c0a080] uppercase">
                    {lang === "ru" ? "Ассоциация Модели ООН Кыргызстана" : "Model United Nations Association of Kyrgyzstan"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-serif leading-relaxed text-justify">
                {lang === "ru" 
                  ? "Ассоциация Модели ООН Кыргызстана (MUNKG) — это независимый молодежный союз, координирующий дебаты по правилам ООН, академическое обучение и дипломатические форумы. Мы воспитываем будущих лидеров через консенсус и взаимоуважение."
                  : "Model United Nations Association of Kyrgyzstan (MUNKG) is an independent youth alliance coordinating debates under UN rules, academic training, and diplomatic forums. We foster future leaders through consensus and mutual respect."
                }
              </p>
            </div>

            {/* Quick navigators */}
            <div className="md:col-span-3 space-y-3 font-mono text-xs">
              <h4 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-900 pb-1.5">
                {lang === "ru" ? "Ресурсы Платформы" : "Platform Resources"}
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setCurrentTab("about")} className="text-slate-400 hover:text-white transition">
                    &gt; {lang === "ru" ? "О нас" : "About Us"}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab("news")} className="text-slate-400 hover:text-white transition">
                    &gt; {lang === "ru" ? "Новости & Обзоры" : "News & Reviews"}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab("conferences")} className="text-slate-400 hover:text-white transition">
                    &gt; {lang === "ru" ? "Актуальные конференции" : "Conferences"}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab("guides")} className="text-slate-400 hover:text-white transition">
                    &gt; {lang === "ru" ? "Обучение Модели ООН" : "MUN Education"}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab("contacts")} className="text-slate-400 hover:text-white transition font-semibold text-slate-300">
                    &gt; {lang === "ru" ? "Контакты & Поддержка" : "Contacts & Support"}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contacts and cooperate channels */}
            <div className="md:col-span-4 space-y-3 text-xs">
              <h4 className="font-mono font-bold text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-900 pb-1.5">
                {lang === "ru" ? "Связь" : "Support & Contacts"}
              </h4>
              <p className="text-slate-400 font-serif leading-relaxed">
                {lang === "ru" 
                  ? "По всем интересующим вас вопросам и предложениям обращайтесь напрямую по нашему официальному e-mail:"
                  : "For all inquiries, support, and collaboration proposals, contact us directly via our official email:"
                }
              </p>
              
              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-[#c0a080]" />
                  <a href="mailto:association.mun.support@gmail.com" className="hover:text-white transition underline">
                    association.mun.support@gmail.com
                  </a>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>© {new Date().getFullYear()} MUNKG. {lang === "ru" ? "Все права защищены." : "All rights reserved."}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentTab("terms")} className="text-slate-600 hover:text-slate-900 transition">{lang === "ru" ? "Условия использования" : "Terms of Service"}</button>
              <span>•</span>
              <button onClick={() => setCurrentTab("privacy")} className="text-slate-600 hover:text-slate-900 transition">{lang === "ru" ? "Политика конфиденциальности" : "Privacy Policy"}</button>
            </div>
          </div>

        </div>
      </footer>
      
    </div>
  );
}
