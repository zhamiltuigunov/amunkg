import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MUNConference, ConferenceRating } from "../types";
import { UN_COMMITTEES, INITIAL_RATINGS } from "../data";
import { translateToEn } from "../translate";
import ReactMarkdown from "react-markdown";
import { Calendar, MapPin, DollarSign, Award, ArrowUpRight, Search, SlidersHorizontal, PlusCircle, CheckCircle, Info, Bell, Star, Globe } from "lucide-react";

const formatEventDates = (start: string, end: string, isEn: boolean) => {
  if (!start) return "";
  const dStart = new Date(start);
  const dEnd = end ? new Date(end) : dStart;

  const locale = isEn ? "en-US" : "ru-RU";
  const startDay = dStart.getDate();
  const endDay = dEnd.getDate();
  
  const m1 = isEn ? dStart.toLocaleString(locale, { month: "long" }) : dStart.toLocaleString(locale, { month: "long", day: 'numeric' }).split(' ')[1];
  const m2 = isEn ? dEnd.toLocaleString(locale, { month: "long" }) : dEnd.toLocaleString(locale, { month: "long", day: 'numeric' }).split(' ')[1];
  
  const y1 = dStart.getFullYear();
  const y2 = dEnd.getFullYear();

  if (startDay === endDay && m1 === m2 && y1 === y2) {
    return isEn ? `${m1} ${startDay}, ${y1}` : `${startDay} ${m1} ${y1}`;
  }

  if (m1 === m2 && y1 === y2) {
    return isEn ? `${m1} ${startDay}–${endDay}, ${y1}` : `${startDay}–${endDay} ${m1} ${y1}`;
  }

  if (y1 === y2) {
    return isEn ? `${m1} ${startDay} – ${m2} ${endDay}, ${y1}` : `${startDay} ${m1} – ${endDay} ${m2} ${y1}`;
  }

  return isEn ? `${m1} ${startDay}, ${y1} – ${m2} ${endDay}, ${y2}` : `${startDay} ${m1} ${y1} – ${endDay} ${m2} ${y2}`;
};

const renderCardPhaseDisplay = (conf: MUNConference, isEn: boolean) => {
  let phaseStr = isEn ? "Standard Reg" : "Стандартная регистрация";
  let phaseColor = "text-blue-500 dark:text-blue-400";
  let deadlineStr = "";

  if (conf.registrationPhase === "early-bird") {
    phaseStr = isEn ? "Early Bird" : "Ранняя регистрация";
    phaseColor = "text-emerald-500";
    if (conf.earlyBirdEndDate) {
      deadlineStr = new Date(conf.earlyBirdEndDate).toLocaleDateString(isEn ? "en-US" : "ru-RU");
    }
  } else if (conf.registrationPhase === "closed" || conf.status === "Closed") {
    phaseStr = isEn ? "Closed" : "Завершена";
    phaseColor = "text-slate-500 dark:text-slate-400";
  } else {
    // standard
    if (conf.standardEndDate) {
      deadlineStr = new Date(conf.standardEndDate).toLocaleDateString(isEn ? "en-US" : "ru-RU");
    } else if (conf.registrationDeadline) {
      deadlineStr = new Date(conf.registrationDeadline).toLocaleDateString(isEn ? "en-US" : "ru-RU");
    }
  }

  return (
    <div className="flex gap-2 text-slate-700 dark:text-slate-300">
      <Info className="w-3.5 h-3.5 text-[#1a365d] dark:text-[#80add0] shrink-0 mt-0.5" />
      <div>
        {(conf.registrationPhase === "closed" || conf.status === "Closed") ? (
           <strong className={`font-bold text-[11px] ${phaseColor}`}>
             {phaseStr}
           </strong>
        ) : (
          <div>
            <div className="flex items-center gap-1 flex-wrap">
              <strong className="text-[9px] uppercase dark:text-slate-200">{isEn ? "Reg. Phase: " : "Фаза регистрации:"}</strong> 
              <span className={`font-bold text-[11px] ${phaseColor}`}>
                {phaseStr}
              </span>
            </div>
            {deadlineStr && (
              <div className="mt-0.5 text-[10px] text-slate-500 font-mono tracking-wide">
                {isEn ? "Deadline:" : "Крайний срок:"} <span className="font-semibold text-slate-700 dark:text-slate-300">{deadlineStr}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConferenceDirectoryProps {
  onFocusResolution?: () => void;
  conferences: MUNConference[];
  setConferences: React.Dispatch<React.SetStateAction<MUNConference[]>>;
  currentUser: any;
  lang?: "ru" | "en";
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ConferenceDirectory({ onFocusResolution, conferences, setConferences, currentUser, lang = "ru", setNotifications }: ConferenceDirectoryProps) {
  const isEn = lang === "en";
  const [viewMode, setViewMode] = useState<"directory" | "top">("directory");
  const [topPeriod, setTopPeriod] = useState<"month" | "year" | "all">("all");
  
  const [ratings, setRatings] = useState<ConferenceRating[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("amunkg_ratings") || "[]");
    } catch {
      return INITIAL_RATINGS || [];
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isFiltering, setIsFiltering] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "", type: "All", status: "All"
  });

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setDebouncedFilters({ search: searchQuery, type: typeFilter, status: statusFilter });
      setIsFiltering(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter, statusFilter]);

  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("amunkg_reminders") || "[]");
    } catch {
      return [];
    }
  });

  const handleRemind = (conf: MUNConference) => {
    let newRems = [...reminders];
    if (newRems.includes(conf.id)) {
      newRems = newRems.filter(id => id !== conf.id);
      setModalAlert(isEn ? `Reminder cancelled for ${conf.nameEn || conf.name}.` : `Напоминание отменено для ${conf.name}.`);
    } else {
      newRems.push(conf.id);
      setModalAlert(isEn ? `Reminder successfully set for ${conf.nameEn || conf.name}!` : `Напоминание успешно установлено для ${conf.name}!`);
    }
    setReminders(newRems);
    localStorage.setItem("amunkg_reminders", JSON.stringify(newRems));
  };

  // Detailed view modal state
  const [selectedConf, setSelectedConf] = useState<MUNConference | null>(null);

  // Application to conference state
  const [isApplying, setIsApplying] = useState(false);
  const [applyName, setApplyName] = useState("");
  const [applySchool, setApplySchool] = useState("");
  const [applyCommittee, setApplyCommittee] = useState("");
  const [applyEducation, setApplyEducation] = useState("");
  const [applyExp, setApplyExp] = useState("");
  const [applyMotivation, setApplyMotivation] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyTelegram, setApplyTelegram] = useState("");
  const [applySource, setApplySource] = useState("");

  const [modalAlert, setModalAlert] = useState<string | null>(null);

  const handleUpdateConfStatus = (id: string, status: "Open" | "Closed") => {
    if (!currentUser) return;
    if (currentUser.role !== "admin" && currentUser.role !== "super_admin") return;
    
    const updated = conferences.map(c => c.id === id ? { ...c, status } : c);
    setConferences(updated);
    localStorage.setItem("mun_conferences", JSON.stringify(updated));
    if (selectedConf && selectedConf.id === id) {
      setSelectedConf({ ...selectedConf, status });
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConf || !currentUser) return;
    
    if (currentUser.status === "restricted") {
      setModalAlert(isEn ? "Your account is restricted. You cannot apply for conferences." : "Ваш аккаунт ограничен. Вы не можете подавать заявки на конференции.");
      return;
    }

    const saved = localStorage.getItem("munakr_join_requests");
    let joinRequests = [];
    try { joinRequests = JSON.parse(saved || "[]"); } catch (e) {}

    joinRequests.push({
      id: `join-${Date.now()}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      conferenceId: selectedConf.id,
      fullName: applyName,
      school: applySchool,
      desiredCommittee: applyCommittee,
      education: applyEducation,
      experience: applyExp,
      motivation: applyMotivation,
      phone: applyPhone,
      telegram: applyTelegram,
      source: applySource,
      status: "pending",
      createdAt: new Date().toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    localStorage.setItem("munakr_join_requests", JSON.stringify(joinRequests));
    setModalAlert(isEn ? "Your application has been successfully submitted!" : "Ваша заявка успешно отправлена организаторам!");
    setIsApplying(false);
    setSelectedConf(null);
  };

  // Custom Conference Build State (Allows users to add regional clubs)
  const [isAdding, setIsAdding] = useState(false);
  const [showConfEnFields, setShowConfEnFields] = useState(false);
  const [addName, setAddName] = useState("");
  const [addNameEn, setAddNameEn] = useState("");
  const [addLocation, setAddLocation] = useState("");
  const [addLocationEn, setAddLocationEn] = useState("");
  const [addOrg, setAddOrg] = useState("");
  const [addOrgEn, setAddOrgEn] = useState("");
  const [addFee, setAddFee] = useState("");
  const [addCommittees, setAddCommittees] = useState("");
  const [addCommitteesEn, setAddCommitteesEn] = useState("");
  const [addType, setAddType] = useState<MUNConference["type"]>("International");
  const [addDesc, setAddDesc] = useState("");
  const [addDescEn, setAddDescEn] = useState("");
  const [addEarlyBirdStart, setAddEarlyBirdStart] = useState("");
  const [addEarlyBirdEnd, setAddEarlyBirdEnd] = useState("");
  const [addStandardStart, setAddStandardStart] = useState("");
  const [addStandardEnd, setAddStandardEnd] = useState("");
  const [addRegDeadline, setAddRegDeadline] = useState("");
  const [addStartDate, setAddStartDate] = useState("");
  const [addEndDate, setAddEndDate] = useState("");

  const getTopConferences = () => {
    const closedConfs = conferences.filter(c => c.status === "Closed");
    const now = new Date();
    
    return closedConfs.map(conf => {
      let confRatings = ratings.filter(r => r.conferenceId === conf.id);
      
      // Filter ratings by date (or conference endDate conceptually, but user says "завершенные в текущем месяце")
      // Since it's simpler, let's filter by conference endDate.
      if (topPeriod === "month") {
         if (!conf.endDate) return { ...conf, ratingAverage: 0, ratingCount: 0 };
         const endDate = new Date(conf.endDate);
         if (endDate.getMonth() !== now.getMonth() || endDate.getFullYear() !== now.getFullYear()) {
           confRatings = [];
         }
      } else if (topPeriod === "year") {
         if (!conf.endDate) return { ...conf, ratingAverage: 0, ratingCount: 0 };
         const endDate = new Date(conf.endDate);
         if (endDate.getFullYear() !== now.getFullYear()) {
           confRatings = [];
         }
      }
      
      const count = confRatings.length;
      const average = count > 0 ? confRatings.reduce((sum, r) => sum + r.rating, 0) / count : 0;
      
      return {
        ...conf,
        ratingAverage: average,
        ratingCount: count
      };
    }).filter(c => c.ratingCount > 0).sort((a, b) => b.ratingAverage - a.ratingAverage);
  };

  const filtered = conferences.filter((conf) => {
    const confName = (isEn && conf.nameEn) ? conf.nameEn : (isEn ? translateToEn(conf.name || "") : (conf.name || ""));
    const confLocation = (isEn && conf.locationEn) ? conf.locationEn : (isEn ? translateToEn(conf.location || "") : (conf.location || ""));
    const confOrg = (isEn && conf.orgEn) ? conf.orgEn : (isEn ? translateToEn(conf.org || "") : (conf.org || ""));
    const confCommittees = (isEn && conf.committeesEn) ? conf.committeesEn : (isEn ? (conf.committees || []).map(c => translateToEn(c)) : (conf.committees || []));
    const confDesc = (isEn && conf.descriptionEn) ? conf.descriptionEn : (isEn ? translateToEn(conf.description || "") : (conf.description || ""));

    const qs = debouncedFilters.search?.toLowerCase() || "";
    const matchesSearch =
      confName.toLowerCase().includes(qs) ||
      confLocation.toLowerCase().includes(qs) ||
      confOrg.toLowerCase().includes(qs) ||
      confDesc.toLowerCase().includes(qs) ||
      confCommittees.some(c => (c || "").toLowerCase().includes(qs));

    const matchesType = debouncedFilters.type === "All" || conf.type === debouncedFilters.type;
    const confPhase = conf.status === "Closed" ? "closed" : (conf.registrationPhase || "standard");
    const matchesStatus = debouncedFilters.status === "All" || confPhase === debouncedFilters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateConf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addLocation || !addFee || !currentUser) return;
    
    if (currentUser.status === "restricted") {
      setModalAlert(isEn ? "Your account is restricted. You cannot propose new conferences." : "Ваш аккаунт ограничен. Вы не можете предлагать новые конференции.");
      return;
    }

    if (currentUser.role === "admin" || currentUser.role === "super_admin") {
      const newConf: MUNConference = {
        id: `conf-${Date.now()}`,
        name: addName,
        nameEn: addNameEn || undefined,
        location: addLocation,
        locationEn: addLocationEn || undefined,
        type: addType,
        startDate: addStartDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split("T")[0], 
        endDate: addEndDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 94).toISOString().split("T")[0],
        earlyBirdStartDate: addEarlyBirdStart || undefined,
        earlyBirdEndDate: addEarlyBirdEnd || undefined,
        standardStartDate: addStandardStart || undefined,
        standardEndDate: addStandardEnd || undefined,
        registrationDeadline: addRegDeadline || undefined,
        committees: addCommittees ? addCommittees.split(",").map(c => c.trim()).filter(c => c) : [UN_COMMITTEES[0], UN_COMMITTEES[1], UN_COMMITTEES[4]],
        committeesEn: addCommitteesEn ? addCommitteesEn.split(",").map(c => c.trim()).filter(c => c) : undefined,
        status: "Open",
        registrationFee: addFee,
        org: addOrg || "Клуб молодых дипломатов Кыргызстана",
        orgEn: addOrgEn || undefined,
        description: addDesc || "Краткое описание новой студенческой конференции на базе Ассоциации.",
        descriptionEn: addDescEn || undefined,
        applyUrl: "#apply-custom",
        creatorId: currentUser.id
      };

      const updated = [...conferences, newConf];
      setConferences(updated);
      localStorage.setItem("mun_conferences", JSON.stringify(updated));
      if (setNotifications) {
        setNotifications((prev: any[]) => [{
          id: "notif-" + Date.now() + Math.random().toString(36).substr(2, 5),
          title: "Новая конференция: " + newConf.name,
          titleEn: "New Conference: " + (newConf.nameEn || newConf.name),
          message: "Открыта регистрация на новую конференцию. Подайте заявку на участие!",
          messageEn: "Registration for a new conference is now open. Apply to participate!",
          type: "new_conference",
          date: new Date().toISOString(),
          read: false
        }, ...prev]);
      }
    } else {
      const savedReq = localStorage.getItem("munakr_create_requests");
      let requests = [];
      try { requests = JSON.parse(savedReq || "[]"); } catch (e) {}

      requests.push({
        id: `cr-req-${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        confData: {
          name: addName,
          nameEn: addNameEn || undefined,
          location: addLocation,
          locationEn: addLocationEn || undefined,
          type: addType,
          registrationFee: addFee,
          org: addOrg || "Клуб",
          orgEn: addOrgEn || undefined,
          description: addDesc || "Описание отсутсвует",
          descriptionEn: addDescEn || undefined,
          earlyBirdStartDate: addEarlyBirdStart || undefined,
          earlyBirdEndDate: addEarlyBirdEnd || undefined,
          standardStartDate: addStandardStart || undefined,
          standardEndDate: addStandardEnd || undefined,
          registrationDeadline: addRegDeadline || undefined,
          startDate: addStartDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split("T")[0],
          endDate: addEndDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 94).toISOString().split("T")[0],
          committees: addCommittees ? addCommittees.split(",").map(c => c.trim()).filter(c => c) : [UN_COMMITTEES[0], UN_COMMITTEES[1], UN_COMMITTEES[4]],
          committeesEn: addCommitteesEn ? addCommitteesEn.split(",").map(c => c.trim()).filter(c => c) : undefined,
        },
        status: "pending",
        createdAt: new Date().toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      });

      localStorage.setItem("munakr_create_requests", JSON.stringify(requests));
      setModalAlert(isEn ? "Your proposal has been submitted to the Secretariat." : "Ваша заявка направлена на рассмотрение в Секретариат.");
    }

    setAddName("");
    setAddNameEn("");
    setAddLocation("");
    setAddLocationEn("");
    setAddOrg("");
    setAddOrgEn("");
    setAddFee("");
    setAddCommittees("");
    setAddCommitteesEn("");
    setAddDesc("");
    setAddDescEn("");
    setAddEarlyBirdStart("");
    setAddEarlyBirdEnd("");
    setAddStandardStart("");
    setAddStandardEnd("");
    setAddRegDeadline("");
    setAddStartDate("");
    setAddEndDate("");
    setIsAdding(false);
  };

  return (
    <div className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-[calc(100vh-80px)] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Subtitle Board */}
        <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#1a365d] dark:text-[#80add0] uppercase">
              MUNKG official database
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
              {isEn ? "Registry of Active Model UNs in the Kyrgyz Republic" : "Реестр Актуальных Моделей ООН в КР"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-serif italic">
              {isEn ? "The official list of accredited UN simulations in the Kyrgyz Republic. Explore committees, fee policies, and detailed agendas of future sessions." : "Официальный список аккредитованных симуляций ООН в Кыргызской Республике. Изучите комитеты, регламент взносов и подробную повестку дня будущих заседаний."}
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            {currentUser ? (
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="bg-[#1a365d] dark:bg-[#fff] dark:text-[#1a365d] hover:bg-[#112543] dark:hover:bg-slate-200 text-white font-bold text-xs tracking-wider py-2.5 px-4 rounded shadow-sm uppercase inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 text-[#c0a080] dark:text-[#1a365d]" />
                <span>{isAdding ? (isEn ? "Back to Registry" : "Вернуться к реестру") : ((currentUser.role === "admin" || currentUser.role === "super_admin") ? (isEn ? "Create Conference" : "Создать конференцию") : (isEn ? "Announce Conference" : "Предложить конференцию"))}</span>
              </button>
            ) : (
               <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase p-2 border dark:border-slate-800 rounded bg-slate-100 dark:bg-slate-900/50 text-center">
                 {isEn ? "Log in to propose a conference" : "Войдите, чтобы предложить конференцию"}
               </div>
            )}
            
            {!isAdding && (
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded font-sans">
                <button
                  onClick={() => setViewMode("directory")}
                  className={`flex-1 py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider rounded transition ${viewMode === "directory" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {isEn ? "All Conferences" : "Все Мероприятия"}
                </button>
                <button
                  onClick={() => setViewMode("top")}
                  className={`flex-1 py-1.5 px-4 text-[10px] items-center justify-center gap-1.5 flex font-bold uppercase tracking-wider rounded transition ${viewMode === "top" ? "bg-white dark:bg-slate-700 text-[#1a365d] dark:text-[#80add0] shadow-xs" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  <Award className="w-3.5 h-3.5"/>
                  {isEn ? "Top Rated" : "Рейтинг Конференций"}
                </button>
              </div>
            )}
          </div>
        </div>

        {isAdding ? (
          /* Custom Conference Add Form */
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-xl shadow-xs p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              {(currentUser.role === "admin" || currentUser.role === "super_admin") ? (isEn ? "Add a New Model to Registry" : "Добавить новую модель в реестр") : (isEn ? "Propose a New Model in Kyrgyzstan" : "Предложить новую модель в Кыргызстане")}
            </h2>
            <form onSubmit={handleCreateConf} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "MUN Conference Name *" : "Название MUN конференции *"}</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder={isEn ? "Example: Issyk-Kul Youth Model UN (IKMUN 2026)" : "Например: Issyk-Kul Youth Model UN (IKMUN 2026)"}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Organizer / University / Club *" : "Организатор / ВУЗ / Клуб *"}</label>
                  <input
                    type="text"
                    required
                    value={addOrg}
                    onChange={(e) => setAddOrg(e.target.value)}
                    placeholder={isEn ? "Example: Diplomatic Club of KNU" : "Например: Дипломатический Клуб КНУ им. Ж. Баласагына"}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Location *" : "Место проведения *"}</label>
                  <input
                    type="text"
                    required
                    value={addLocation}
                    onChange={(e) => setAddLocation(e.target.value)}
                    placeholder={isEn ? "Bishkek / Osh / Cholpon-Ata" : "Бишкек / Ош / Чолпон-Ата"}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Registration Fee *" : "Регистрационный взнос *"}</label>
                  <input
                    type="text"
                    required
                    value={addFee}
                    onChange={(e) => setAddFee(e.target.value)}
                    placeholder={isEn ? "Example: 500 KGS / Free" : "Пример: 500 KGS / Бесплатно"}
                    className="w-full text-xs border border-[#1a365d]/20 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Scale" : "Масштаб"}</label>
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as MUNConference["type"])}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                  >
                    <option value="International">{isEn ? "International" : "Международная"}</option>
                    <option value="Regional">{isEn ? "Regional" : "Региональная"}</option>
                    <option value="National">{isEn ? "National" : "Национальная"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                <div>
                  <label className="block mb-1">{isEn ? "Early Bird Start" : "Начало ранней регистрации"}</label>
                  <input type="date" value={addEarlyBirdStart} onChange={e => setAddEarlyBirdStart(e.target.value)} className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden" />
                </div>
                <div>
                  <label className="block mb-1">{isEn ? "Early Bird End" : "Конец ранней регистрации"}</label>
                  <input type="date" value={addEarlyBirdEnd} onChange={e => setAddEarlyBirdEnd(e.target.value)} className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden" />
                </div>
                <div>
                  <label className="block mb-1">{isEn ? "Standard Reg Start" : "Начало стандартной фазы"}</label>
                  <input type="date" value={addStandardStart} onChange={e => setAddStandardStart(e.target.value)} className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden" />
                </div>
                <div>
                  <label className="block mb-1">{isEn ? "Standard Reg End" : "Конец стандартной фазы"}</label>
                  <input type="date" value={addStandardEnd} onChange={e => setAddStandardEnd(e.target.value)} className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden" />
                </div>
                <div>
                  <label className="block mb-1">{isEn ? "Conf. Start Date *" : "Дата начала конференции *"}</label>
                  <input required type="date" value={addStartDate} onChange={e => setAddStartDate(e.target.value)} className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden" />
                </div>
                <div>
                  <label className="block mb-1">{isEn ? "Conf. End Date *" : "Дата конца конференции *"}</label>
                  <input required type="date" value={addEndDate} onChange={e => setAddEndDate(e.target.value)} className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden" />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1">{isEn ? "Registration Deadline" : "Главный Дедлайн (закрытия заявок)"}</label>
                  <input type="date" value={addRegDeadline} onChange={e => setAddRegDeadline(e.target.value)} className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Active Committees (comma separated) *" : "Активные Комитеты (через запятую) *"}</label>
                <input
                  type="text"
                  required
                  value={addCommittees}
                  onChange={(e) => setAddCommittees(e.target.value)}
                  placeholder={isEn ? "UNSC, GA, ECOSOC..." : "Генеральная Ассамблея, Совет Безопасности..."}
                  className="w-full text-xs border border-[#1a365d]/20 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Short Description & Agenda" : "Краткое описание & Повестка"}</label>
                <textarea
                  rows={4}
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  placeholder={isEn ? "Describe main agendas and development goals..." : "Опишите основные повестки и цели по развитию..."}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfEnFields(!showConfEnFields)}
                  className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded border transition ${showConfEnFields ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {showConfEnFields ? (isEn ? "− Hide English Version" : "− Скрыть английскую версию") : (isEn ? "+ Add English Version (Optional)" : "+ Добавить английскую версию (опционально)")}
                </button>
              </div>

              <AnimatePresence>
                {showConfEnFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3.5 border-l-2 border-[#1a365d] pl-4 py-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-[#1a365d]"></div>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Английская версия (English Version)</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Conference Name (EN)" : "Название конференции (EN)"}</label>
                      <input
                        type="text"
                        value={addNameEn}
                        onChange={(e) => setAddNameEn(e.target.value)}
                        placeholder="e.g. Issyk-Kul Youth MUN 2026"
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Organizer (EN)" : "Организатор (EN)"}</label>
                        <input
                          type="text"
                          value={addOrgEn}
                          onChange={(e) => setAddOrgEn(e.target.value)}
                          placeholder="e.g. MUNKG Secretariat"
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Location (EN)" : "Физическая локация (EN)"}</label>
                        <input
                          type="text"
                          value={addLocationEn}
                          onChange={(e) => setAddLocationEn(e.target.value)}
                          placeholder="e.g. Osh, OshSU"
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Committees (EN, comma separated)" : "Комитеты (EN, через запятую)"}</label>
                      <input
                        type="text"
                        value={addCommitteesEn}
                        onChange={(e) => setAddCommitteesEn(e.target.value)}
                        placeholder="e.g. UNSC, GA, HRC..."
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Description (EN)" : "Повестки дня и описание (EN)"}</label>
                      <textarea
                        rows={3}
                        value={addDescEn}
                        onChange={(e) => setAddDescEn(e.target.value)}
                        placeholder="Describe simulated committees and agenda in English..."
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      ></textarea>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs font-bold uppercase py-2 px-4 rounded border border-slate-200 dark:border-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 transition"
                >
                  {isEn ? "Cancel" : "Отмена"}
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold uppercase py-2 px-6 rounded bg-[#1a365d] dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-[#112543] dark:hover:bg-white dark:bg-slate-900 transition"
                >
                  {currentUser?.role === "admin" || currentUser?.role === "super_admin" ? (isEn ? "Create Conference" : "Создать конференцию") : (isEn ? "Send Proposal" : "Отправить заявку")}
                </button>
              </div>
            </form>
          </div>
        ) : viewMode === "top" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
              <div>
                <h2 className="text-xl font-serif font-black text-[#1a365d] dark:text-[#80add0] flex items-center gap-2 tracking-tight">
                  <Star className="w-5 h-5 text-[#c0a080]" />
                  {isEn ? "Top Conferences" : "Топ конференций"}
                </h2>
                <p className="text-xs text-slate-500 font-serif mt-1">
                  {isEn ? "Based on real participant reviews" : "На основе реальных отзывов делегатов"}
                </p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded font-sans shrink-0">
                <button
                  onClick={() => setTopPeriod("month")}
                  className={`px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition ${topPeriod === "month" ? "bg-white dark:bg-slate-700 text-[#1a365d] dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {isEn ? "Month" : "За месяц"}
                </button>
                <button
                  onClick={() => setTopPeriod("year")}
                  className={`px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition ${topPeriod === "year" ? "bg-white dark:bg-slate-700 text-[#1a365d] dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {isEn ? "Year" : "За год"}
                </button>
                <button
                  onClick={() => setTopPeriod("all")}
                  className={`px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition ${topPeriod === "all" ? "bg-white dark:bg-slate-700 text-[#1a365d] dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {isEn ? "All Time" : "Все время"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTopConferences().map((conf, idx) => (
                <div key={conf.id} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition duration-300 flex flex-col group">
                  <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-[#1a365d]/5 text-[#c0a080] rounded-full font-serif font-black text-xl italic z-10">
                    #{idx + 1}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-sans font-bold text-lg text-[#1a365d] dark:text-[#80add0] pr-12 leading-tight">
                      {isEn ? (conf.nameEn || translateToEn(conf.name)) : conf.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{isEn ? "Rating" : "Рейтинг"}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-[#c0a080] fill-[#c0a080]" />
                          <span className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100">{conf.ratingAverage.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{isEn ? "Reviews" : "Отзывы"}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold font-sans text-slate-600 dark:text-slate-300">{conf.ratingCount}</span>
                          <span className="text-xs text-slate-400">{isEn ? "delegates" : "делегатов"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center gap-2 text-xs text-slate-500 font-serif">
                       <MapPin className="w-4 h-4 shrink-0" />
                       <span className="truncate">{isEn ? (conf.locationEn || translateToEn(conf.location)) : conf.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getTopConferences().length === 0 && (
              <div className="py-24 px-6 text-center border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xs">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 dark:from-slate-800 via-transparent to-transparent opacity-50 z-0"></div>
                <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xs border border-slate-200 dark:border-slate-700">
                    <Award className="w-8 h-8 text-[#c0a080]" />
                  </div>
                  <h3 className="text-lg font-serif font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                    {isEn ? "No Ratings Yet" : "Рейтинг Конференций пока пуст"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-serif leading-relaxed mb-6">
                    {isEn 
                      ? "There are no rated conferences for this time period yet. As soon as delegates rate closed events, the top-ranked simulations will be highlighted here."
                      : "В этом периоде еще нет оцененных конференций. Как только делегаты оценят прошедшие мероприятия, список лучших появится на этой странице."}
                  </p>
                  <button 
                    onClick={() => setViewMode("directory")}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a365d] dark:text-[#80add0] hover:text-[#112543] dark:hover:text-[#a0c5e8] transition"
                  >
                    <span>{isEn ? "Browse all events" : "Смотреть все мероприятия"}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Main Search & Grid Display */
          <div className="space-y-6">
            
            {/* Control Panel Widget */}
            <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-700 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={isEn ? "Search by title, description, committees..." : "Поиск по названию, описанию, комитетам..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "Filters:" : "Фильтры:"}</span>
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 rounded p-2 focus:border-[#1a365d] dark:focus:border-[#80add0] bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="All">{isEn ? "Scale (All)" : "Масштаб (Все)"}</option>
                  <option value="International">{isEn ? "International" : "Международные"}</option>
                  <option value="Regional">{isEn ? "Regional" : "Региональные"}</option>
                  <option value="National">{isEn ? "National" : "Национальные"}</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 rounded p-2 focus:border-[#1a365d] dark:focus:border-[#80add0] bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="All">{isEn ? "Status (All)" : "Статус (Все)"}</option>
                  <option value="early-bird">{isEn ? "Early Bird" : "Ранняя регистрация"}</option>
                  <option value="standard">{isEn ? "Standard Reg" : "Стандартная регистрация"}</option>
                  <option value="closed">{isEn ? "Closed" : "Завершена"}</option>
                </select>
              </div>
            </div>

            {/* Conferences Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {isFiltering ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl h-[340px] animate-pulse"
                    >
                      <div className="h-1 bg-slate-200 dark:bg-slate-700 w-full rounded-t-2xl"></div>
                      <div className="px-5 py-4 space-y-5">
                        <div className="flex justify-between">
                          <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="space-y-3 pt-6">
                          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : filtered.length === 0 ? (
                  <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                      {isEn ? "No conferences found" : "Конференции не найдены"}
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      {isEn 
                        ? "There are no active or upcoming conferences matching your filter criteria right now. Try adjusting your search." 
                        : "Нет активных или предстоящих конференций, соответствующих вашим критериям фильтрации. Попробуйте изменить параметры поиска."}
                    </p>
                  </div>
                ) : filtered.map((conf) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    key={conf.id} 
                    className="group relative bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full text-left"
                  >
                    {/* Top edge glow line - uniform for all, varying just the accent color */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      conf.type === "International" 
                        ? "bg-gradient-to-r from-[#1a365d] via-[#c0a080] to-[#1a365d] shadow-[0_0_8px_#c0a08080]" 
                        : conf.type === "Regional"
                        ? "bg-gradient-to-r from-blue-900 via-blue-400 to-blue-900 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                        : "bg-gradient-to-r from-emerald-900 via-emerald-400 to-emerald-900 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    }`}></div>

                    {/* Top banner */}
                    <div className="px-4 sm:px-5 py-2.5 mt-1 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          conf.type === "International" 
                            ? "bg-[#c0a080] shadow-[0_0_6px_#c0a080]" 
                            : conf.type === "Regional"
                            ? "bg-blue-400 shadow-[0_0_6px_#60a5fa]" 
                            : "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                        }`}></span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          conf.type === "International" 
                            ? "text-[#1a365d] dark:text-[#c0a080]" 
                            : conf.type === "Regional"
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-emerald-700 dark:text-emerald-400"
                        }`}>
                          {isEn ? conf.type : (conf.type === "International" ? "Международная" : conf.type === "Regional" ? "Региональная" : "Национальная")}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${conf.status === "Open" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                        {conf.status === "Open" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {conf.status === "Open" ? (isEn ? "Open" : "Открыта") : (isEn ? "Completed" : "Завершена")}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col relative z-10">
                      {/* Decorative Background Icon */}
                      <Award className="absolute -right-4 -top-4 w-20 h-20 text-slate-50 dark:text-slate-800/20 opacity-50 pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
                      
                      {/* Subtitle / Organizer */}
                      <p className="text-[9px] font-bold text-[#c0a080] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{isEn ? (conf.orgEn || translateToEn(conf.org)) : conf.org}</span>
                      </p>

                      {/* Title */}
                      <h3 className="font-serif font-black text-lg text-slate-900 dark:text-slate-100 leading-tight mb-2 group-hover:text-[#1a365d] dark:group-hover:text-[#c0a080] transition-colors line-clamp-2 pr-10">
                        {isEn ? (conf.nameEn || translateToEn(conf.name)) : conf.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-serif leading-relaxed line-clamp-2 mb-4">
                        {isEn ? (conf.descriptionEn || translateToEn(conf.description)) : conf.description}
                      </p>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{isEn ? "Dates" : "Даты"}</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {formatEventDates(conf.startDate, conf.endDate, isEn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{isEn ? "Location" : "Место"}</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {isEn ? (conf.locationEn || translateToEn(conf.location)) : conf.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{isEn ? "Fee" : "Взнос"}</p>
                          <p className="text-xs font-bold text-[#1a365d] dark:text-[#c0a080]">
                            {isEn ? translateToEn(conf.registrationFee) : conf.registrationFee}
                          </p>
                        </div>
                      </div>

                      {/* Phase Indicator */}
                      <div className="mb-4 transform scale-[0.95] origin-left">
                        {renderCardPhaseDisplay(conf, isEn)}
                      </div>

                      <div className="mt-auto flex gap-3 pt-2">
                        <button
                          onClick={() => handleRemind(conf)}
                          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl transition border shadow-sm ${reminders.includes(conf.id) ? "bg-[#c0a080] border-[#c0a080] text-white" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-slate-800"}`}
                          title={isEn ? "Remind Me" : "Напомнить"}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedConf(conf)}
                          className="flex-1 flex items-center justify-center bg-slate-900 hover:bg-[#1a365d] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm"
                        >
                          <span>{isEn ? "View Details" : "Узнать Подробнее"}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Elegant Details Modal */}
            <AnimatePresence>
            {selectedConf && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 z-50"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-4 sm:p-8 shadow-xl relative text-left max-h-[95vh] overflow-y-auto"
                >
                  <button
                    onClick={() => setSelectedConf(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase transition"
                  >
                    {isEn ? "Close ✕" : "Закрыть ✕"}
                  </button>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#1a365d] dark:text-[#80add0] uppercase bg-[#1a365d]/5 dark:bg-[#80add0]/10 border border-[#1a365d]/10 px-2 py-0.5 rounded">
                        {isEn ? selectedConf?.type : (selectedConf?.type === "International" ? "Международная" : selectedConf?.type === "Regional" ? "Региональная" : "Национальная")}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1a365d] dark:text-white mt-2 leading-tight">
                        {(isEn && selectedConf?.nameEn) ? selectedConf?.nameEn : (isEn ? translateToEn(selectedConf?.name) : selectedConf?.name)}
                      </h2>
                      <p className="text-[11px] font-mono tracking-widest font-bold text-slate-400 uppercase mt-0.5">
                        {isEn ? "Organizer:" : "Организатор:"} {(isEn && selectedConf?.orgEn) ? selectedConf?.orgEn : (isEn ? translateToEn(selectedConf?.org) : selectedConf?.org)}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-700/50 p-4 rounded space-y-3 text-xs">
                      <div className="flex gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0" />
                        <div>
                          <strong className="dark:text-slate-200">{isEn ? "Venue:" : "Место проведения:"}</strong> {(isEn && selectedConf.locationEn) ? selectedConf.locationEn : (isEn ? translateToEn(selectedConf.location) : selectedConf.location)}
                        </div>
                      </div>

                      <div className="flex gap-2 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0" />
                        <div>
                          <strong className="dark:text-slate-200">{isEn ? "Session Dates:" : "Даты сессии:"}</strong> {formatEventDates(selectedConf.startDate, selectedConf.endDate, isEn)}
                        </div>
                      </div>

                      <div className="flex gap-2 text-slate-700 dark:text-slate-300">
                        <DollarSign className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0" />
                        <div>
                          <strong className="dark:text-slate-200">{isEn ? "Registration Fee:" : "Организационный сбор:"}</strong> {isEn ? translateToEn(selectedConf.registrationFee) : selectedConf.registrationFee}
                        </div>
                      </div>

                      {renderCardPhaseDisplay(selectedConf, isEn)}

                      {currentUser && (currentUser.role === "admin" || currentUser.role === "super_admin") && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            {isEn ? "Admin Controls" : "Управление"}
                          </span>
                          <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 gap-1">
                            <button
                              onClick={() => handleUpdateConfStatus(selectedConf.id, "Open")}
                              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                                selectedConf.status === "Open"
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                              }`}
                            >
                              {isEn ? "Mark Open" : "Сделать открытой"}
                            </button>
                            <button
                              onClick={() => handleUpdateConfStatus(selectedConf.id, "Closed")}
                              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                                selectedConf.status === "Closed"
                                  ? "bg-slate-800 text-white shadow-sm dark:bg-slate-800"
                                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                              }`}
                            >
                              {isEn ? "Mark Closed" : "Сделать закрытой"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">{isEn ? "General Simulation Agenda" : "Общая повестка моделирования"}</h4>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 my-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-md font-bold text-slate-900 dark:text-slate-100 my-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 my-1">{children}</h3>,
                            p: ({ children }) => <span className="block mb-2 whitespace-pre-wrap">{children}</span>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-slate-800 dark:text-slate-200">{children}</strong>,
                          }}
                        >
                          {(isEn && selectedConf.descriptionEn) ? selectedConf.descriptionEn : (isEn ? translateToEn(selectedConf.description) : selectedConf.description)}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {isEn ? "Simulated Entities" : "Симулируемые органы"}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {((isEn && selectedConf.committeesEn) ? selectedConf.committeesEn : (isEn ? selectedConf.committees.map(c => translateToEn(c)) : selectedConf.committees)).map((com, index) => (
                          <div 
                            key={index}
                            className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                          >
                            <Award className="w-3.5 h-3.5 text-[#c0a080] shrink-0" />
                            <span>{com}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isApplying ? (
                      <form onSubmit={handleApplySubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 dark:border-slate-700 p-4 rounded-lg space-y-3 mt-4">
                        <h4 className="font-bold text-sm text-[#1a365d] dark:text-[#80add0] uppercase tracking-wider mb-2">{isEn ? "Application Form" : "Анкета Делегата"}</h4>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "Full Name" : "ФИО"}</label>
                          <input type="text" required value={applyName} onChange={e => setApplyName(e.target.value)} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "School / University" : "Школа / ВУЗ"}</label>
                          <input type="text" required value={applySchool} onChange={e => setApplySchool(e.target.value)} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "Class / Year" : "Класс / Курс"}</label>
                          <input type="text" required value={applyEducation} onChange={e => setApplyEducation(e.target.value)} placeholder={isEn ? "e.g. 10th grade, 2nd year" : "Например, 10 класс, 2 курс"} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "Desired Committee" : "Желаемый комитет"}</label>
                            <input type="text" required value={applyCommittee} onChange={e => setApplyCommittee(e.target.value)} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "Experience" : "Опыт участия"}</label>
                            <input type="text" required value={applyExp} onChange={e => setApplyExp(e.target.value)} placeholder={isEn ? "0 models / 2 models etc." : "0 моделей / 2 модели и т.д."} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "Why should you participate?" : "Почему именно вы должны участвовать?"}</label>
                          <textarea required value={applyMotivation} onChange={e => setApplyMotivation(e.target.value)} placeholder={isEn ? "Briefly tell us your motivation" : "Кратко опишите вашу мотивацию"} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs min-h-[60px]" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "Phone" : "Телефон"}</label>
                            <input type="text" required value={applyPhone} onChange={e => setApplyPhone(e.target.value)} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Telegram (@username)</label>
                            <input type="text" required value={applyTelegram} onChange={e => setApplyTelegram(e.target.value)} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{isEn ? "How did you hear about us?" : "Откуда вы о нас узнали?"}</label>
                          <select required value={applySource} onChange={e => setApplySource(e.target.value)} className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2 text-xs">
                            <option value="">{isEn ? "Select an option" : "Выберите вариант"}</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Friends">{isEn ? "From friends" : "От друзей"}</option>
                            <option value="Telegram">{isEn ? "Telegram Channel" : "Telegram канал"}</option>
                            <option value="Other">{isEn ? "Other" : "Другое"}</option>
                          </select>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setIsApplying(false)} className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase py-2 px-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition">
                            {isEn ? "Cancel" : "Отмена"}
                          </button>
                          <button type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold uppercase py-2 px-4 rounded shadow-2xs transition">
                            {isEn ? "Submit Application" : "Подать заявку"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="bg-amber-50/40 dark:bg-amber-900/10 border-l-4 border-[#c0a080] dark:border-[#c0a080]/50 p-4 text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed font-serif pt-3.5">
                          <div className="flex gap-2 items-start">
                            <Info className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0 mt-0.5" />
                            <span className="dark:text-slate-300">
                              <strong className="dark:text-slate-200">{isEn ? "Information for Participants:" : "Информация для участников:"}</strong> Заявка будет отправлена организаторам данной конференции на рассмотрение. После одобрения с вами свяжутся по указанным контактам.
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end pt-3 gap-2">
                          {currentUser ? (
                            <button
                              onClick={() => {
                                setApplyName(currentUser.name || "");
                                setIsApplying(true);
                              }}
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider py-2.5 px-4 sm:px-6 rounded transition text-center whitespace-normal"
                            >
                              {isEn ? "Apply" : "Зарегистрироваться"}
                            </button>
                          ) : (
                            <div className="w-full sm:w-auto text-center text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold bg-slate-100 dark:bg-slate-800 p-2.5 rounded border dark:border-slate-700">
                              {isEn ? "Log in to apply" : "Войдите, чтобы подать заявку"}
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedConf(null)}
                            className="w-full sm:w-auto bg-[#1a365d] hover:bg-[#112543] dark:bg-slate-200 dark:hover:bg-white text-white dark:text-[#1a365d] font-extrabold text-[10px] sm:text-xs uppercase tracking-wider py-2.5 px-4 sm:px-6 rounded transition text-center"
                          >
                            {isEn ? "Close" : "Закрыть"}
                          </button>
                        </div>
                      </>
                    )}

                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

          </div>
        )}

      </div>

      <AnimatePresence>
      {modalAlert && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white dark:bg-slate-900 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
          >
            <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {isEn ? "Notification" : "Уведомление"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
              {modalAlert}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setModalAlert(null)}
                className="w-full px-4 py-2 bg-[#1a365d] dark:bg-[#80add0] hover:bg-[#1a365d]/90 dark:hover:bg-[#80add0]/90 text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded border dark:border-transparent transition"
              >
                {isEn ? "OK" : "ОК"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
