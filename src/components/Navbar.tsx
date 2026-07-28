import { Globe, BookOpen, Calendar, Award, Mail, User, Info, Compass, Moon, Sun, X, Menu, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { AppUser, AppNotification } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: "ru" | "en";
  setLang: (l: "ru" | "en") => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (dk: boolean) => void;
  notifications?: AppNotification[];
  setNotifications?: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  currentUser?: AppUser | null;
}

export default function Navbar({ currentTab, setCurrentTab, lang, setLang, isDarkMode, setIsDarkMode, notifications = [], setNotifications, currentUser = null }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleNotifications = notifications.filter(n => {
    // 1. User targeting
    if (n.userId && n.userId !== currentUser?.id) return false;
    
    // 2. Preferences
    if (currentUser?.preferences) {
      if (n.type === "new_conference" && currentUser.preferences.newConferences === false) return false;
      if (n.type === "schedule_change" && currentUser.preferences.conferenceDateChanges === false) return false;
      if (n.type === "early_bird" && currentUser.preferences.earlyBirdAlerts === false) return false;
    }
    
    return true;
  });

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setNotifications) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const menuItems = [
    { id: "about", name: lang === "ru" ? "О нас" : "About Us", icon: Info },
    { id: "news", name: lang === "ru" ? "Новости" : "News", icon: Globe },
    { id: "conferences", name: lang === "ru" ? "Конференции" : "Conferences", icon: Calendar },
    { id: "guides", name: lang === "ru" ? "Обучение" : "Education", icon: BookOpen },
    { id: "contacts", name: lang === "ru" ? "Контакты" : "Contacts", icon: Mail },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-xs transition-colors duration-300 relative">
      {/* Top diplomatic style strip */}
      <div className="bg-slate-900 dark:bg-black text-white text-[11px] font-mono tracking-widest py-1.5 px-4 flex justify-between items-center transition-colors duration-300">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="hidden sm:inline">ASSOCIATION OF MODEL UNITED NATIONS KYRGYZSTAN (AMUNKG)</span>
          <span className="sm:hidden">AMUNKG ALLIANCE</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>OFFICIAL NETWORK</span>
          <span>EMPOWERING YOUTH DIPLOMACY</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Elegant Logo & Branding */}
          <div 
            onClick={() => setCurrentTab("about")} 
            className="flex items-center gap-3 cursor-pointer group -ml-3 sm:-ml-6 lg:-ml-8 xl:-ml-10 transition-all"
          >
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-slate-950 to-[#1a365d] flex items-center justify-center text-white shadow-md border-2 border-[#c0a080] group-hover:scale-105 transition-all shrink-0">
              <Award className="w-5.5 h-5.5 text-[#c0a080]" />
              <div className="absolute inset-0.5 rounded-full border border-[#c0a080]/30 border-dashed" />
            </div>
            <div className="hidden sm:block">
              <div className="font-serif text-lg sm:text-xl font-black tracking-tight text-[#1a365d] dark:text-[#c0a080] uppercase leading-tight group-hover:text-[#c0a080] dark:group-hover:text-white transition-colors">
                {lang === "ru" ? "Альянс АМООНКР" : "AMUNKG Alliance"}
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 uppercase leading-none mt-1">
                {lang === "ru" ? "Единая Платформа" : "United Platform"}
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden xl:flex space-x-1 shrink-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold tracking-wide transition-all uppercase ${
                    isActive
                      ? "text-[#1a365d] dark:text-[#80add0] border-b-2 border-[#1a365d] dark:border-[#80add0] font-bold bg-[#1a365d]/5 dark:bg-[#c0a080]/10"
                      : "text-slate-600 dark:text-slate-300 hover:text-[#1a365d] dark:hover:text-[#80add0] hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#c0a080]" : "text-slate-400 dark:text-slate-500"}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Action button & Switcher: CABINET placed elegantly in the top right corner */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-10 bg-white dark:bg-slate-900 pr-1 pl-2 transition-colors">

            {setIsDarkMode && (
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            
            {/* Beautiful Language Switcher */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 transition">
              <button 
                onClick={() => setLang("ru")} 
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${lang === "ru" ? "bg-[#1a365d] dark:bg-[#c0a080] text-white dark:text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}
              >
                RU
              </button>
              <button 
                onClick={() => setLang("en")} 
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${lang === "en" ? "bg-[#1a365d] dark:bg-[#c0a080] text-white dark:text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}
              >
                EN
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsNotificationsOpen(!isNotificationsOpen); }}
                className="p-1.5 focus:outline-none rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 " />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">{lang === "ru" ? "Уведомления" : "Notifications"}</h4>
                      {unreadCount > 0 && (
                         <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                           {unreadCount} {lang === "ru" ? "новых" : "new"}
                         </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {visibleNotifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 italic">
                          {lang === "ru" ? "Нет уведомлений" : "No notifications"}
                        </div>
                      ) : (
                        visibleNotifications.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer relative ${!notif.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                          >
                            {!notif.read && <div className="absolute left-2 top-4 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                            <div className="pl-3">
                              <h5 className="font-bold text-[11px] text-slate-800 dark:text-slate-200 mb-0.5">{lang === "en" && notif.titleEn ? notif.titleEn : notif.title}</h5>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-serif leading-snug">{lang === "en" && notif.messageEn ? notif.messageEn : notif.message}</p>
                              <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">{new Date(notif.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => {
                setCurrentTab("cabinet");
                setIsMobileMenuOpen(false);
              }}
              className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded text-[10px] sm:text-xs font-bold tracking-wider transition-all shadow-sm uppercase inline-flex items-center gap-1.5 font-sans ${
                currentTab === "cabinet"
                  ? "bg-[#c0a080] text-[#1a365d] scale-105 ring-2 ring-[#c0a080]/40"
                  : "bg-[#1a365d] dark:bg-[#80add0] hover:bg-[#112543] dark:hover:bg-[#5a8da0] text-white dark:text-slate-900"
              }`}
            >
              <User className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${currentTab === "cabinet" ? "text-[#1a365d]" : "text-[#c0a080] dark:text-slate-800"}`} />
              <span className="hidden sm:inline">{lang === "ru" ? "ЛИЧНЫЙ КАБИНЕТ" : "CABINET"}</span>
              <span className="sm:hidden">{lang === "ru" ? "ВОЙТИ" : "LOGIN"}</span>
            </button>

            {/* Hamburger Button */}
            <button
              className="xl:hidden p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="xl:hidden overflow-hidden"
            >
              <div className="flex flex-col py-4 px-2 space-y-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all uppercase ${
                        isActive
                          ? "bg-[#1a365d] dark:bg-[#80add0] text-white dark:text-slate-900 shadow-md"
                          : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "" : "text-slate-400 dark:text-slate-500"}`} />
                      {item.name}
                    </button>
                  );
                })}
                
                {/* Mobile Language Switcher */}
                <div className="sm:hidden flex items-center justify-between px-4 py-3 mt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {lang === "ru" ? "Язык" : "Language"}
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => {
                        setLang("ru");
                        setIsMobileMenuOpen(false);
                      }} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${lang === "ru" ? "bg-[#1a365d] dark:bg-[#c0a080] text-white dark:text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}
                    >
                      RU
                    </button>
                    <button 
                      onClick={() => {
                        setLang("en");
                        setIsMobileMenuOpen(false);
                      }} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${lang === "en" ? "bg-[#1a365d] dark:bg-[#c0a080] text-white dark:text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
