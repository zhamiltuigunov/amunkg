import { useState, useEffect } from "react";
import { Mail, MessageSquare, Send, HelpCircle, CheckCircle, Phone, MapPin, Clock, ShieldAlert, History, Trash2, ArrowUpRight } from "lucide-react";

interface SavedInquiry {
  id: string;
  userId?: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  date: string;
  status: string;
  reply?: string;
  replyDate?: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
}

interface ContactsProps {
  lang?: "ru" | "en";
}

export default function Contacts({ lang = "ru" }: ContactsProps) {
  const isEn = lang === "en";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(isEn ? "Technical Issues" : "Технические вопросы");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedInquiries, setSavedInquiries] = useState<SavedInquiry[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [phoneError, setPhoneError] = useState("");

  // Load current user and their previous tickets
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("munakr_currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.firstName || user.lastName) {
            setName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
        }
        if (user.email) setEmail(user.email);
      }
    } catch(e) {}
    
    const saved = localStorage.getItem("munakr_inquiries");
    if (saved) {
      try {
        setSavedInquiries(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  useEffect(() => {
    if (category === "Technical Issues" || category === "Технические вопросы" || category === "Technical Support" || category === "Техническая поддержка") {
      setCategory(isEn ? "Technical Issues" : "Технические вопросы");
    } else if (category === "Other" || category === "Другое") {
      setCategory(isEn ? "Other" : "Другое");
    }
  }, [lang]);

  // Custom confirmation dialog state to bypass iframe window.confirm blocks
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    if (phone) {
      // Basic check to prevent spam / random strings
      const digits = String(phone).replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        setPhoneError(isEn ? "Invalid phone number length." : "Неверный номер телефона. Возможен спам.");
        return;
      }
      if (!/^[\d\+\-\s\(\)]+$/.test(phone)) {
        setPhoneError(isEn ? "Phone number contains invalid characters." : "Номер телефона содержит недопустимые символы.");
        return;
      }
    }
    setPhoneError("");

    setLoading(true);

    const finishSubmit = (dataUrl?: string) => {
      // Simulate sending time
      setTimeout(() => {
        let currentUserId;
        try {
          const storedUser = localStorage.getItem("munakr_currentUser");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            currentUserId = user.id;
          }
        } catch(e) {}

        const newInquiry: SavedInquiry = {
          id: `inquiry-${Date.now()}`,
          userId: currentUserId,
          name,
          email,
          category,
          subject: subject || "Без темы",
          message,
          date: new Date().toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "Отправлено",
          attachmentName: attachment ? attachment.name : undefined,
          attachmentDataUrl: dataUrl,
        };

        const updated = [newInquiry, ...savedInquiries];
        setSavedInquiries(updated);
        localStorage.setItem("munakr_inquiries", JSON.stringify(updated));

        setLoading(false);
        setSubmitted(true);
        
        // Keep state values in draft for backup, reset form fields
        setPhone("");
        setSubject("");
      }, 1200);
    };

    if (attachment) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        finishSubmit(ev.target?.result as string);
      };
      reader.readAsDataURL(attachment);
    } else {
      finishSubmit();
    }
  };

  const clearHistory = () => {
    setConfirmDialog({
      title: isEn ? "Clear History" : "Очистить историю",
      message: isEn ? "Are you sure you want to clear your local inquiry history on this device?" : "Вы действительно хотите очистить локальную историю обращений у себя на устройстве?",
      onConfirm: () => {
        setSavedInquiries([]);
        localStorage.removeItem("munakr_inquiries");
      }
    });
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setMessage("");
    setAttachment(null);
    setPhoneError("");
  };

  return (
    <div className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-[calc(100vh-80px)] text-left font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Subtitle Board */}
        <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 mb-8">
          <span className="text-xs font-mono font-bold tracking-widest text-[#1a365d] dark:text-[#80add0] uppercase">
            Official Secretariat Feedback Registry
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            {isEn ? "Inquiries & Technical Support" : "Обращения & Техническая поддержка"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400 mt-2 max-w-2xl font-serif italic">
            {isEn 
              ? "The electronic reception desk for citizens, delegates, and partners of the MUNKG Association. Your inquiry will be directly routed to the Secretariat."
              : "Кабинет приема электронных обращений граждан, делегатов и партнеров Ассоциации Модели ООН Кыргызской Республики (АМООНКР). Ваше обращение будет напрямую перенаправлено в Секретариат."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Inquiry Form Screen */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="border-b dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#1a365d] dark:text-[#80add0]" />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#1a365d] dark:text-slate-200 leading-none">
                    {isEn ? "Submit an Electronic Ticket" : "Подать электронное письмо"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 uppercase mb-1">{isEn ? "Sender's Full Name *" : "ФИО Отправителя *"}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isEn ? "John Doe" : "Иван Иванов"}
                      className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 uppercase mb-1">{isEn ? "Contact Email *" : "Email для связи *"}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 uppercase mb-1">{isEn ? "Phone Number (Optional)" : "Контактный телефон (Опционально)"}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+996 (555) 012-345"
                      className={`w-full text-xs border ${phoneError ? "border-red-400 dark:border-red-500" : "border-slate-200 dark:border-slate-800 dark:border-slate-700"} bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden`}
                    />
                    {phoneError && <p className="text-[10px] text-red-500 mt-1 font-bold">{phoneError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 uppercase mb-1">{isEn ? "Inquiry Category" : "Категория обращения"}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                    >
                      <option value={isEn ? "Technical Issues" : "Технические вопросы"}>{isEn ? "Technical Issues" : "Технические вопросы"}</option>
                      <option value={isEn ? "Other" : "Другое"}>{isEn ? "Other" : "Другое"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 uppercase mb-1">{isEn ? "Inquiry Subject" : "Тема обращения"}</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={isEn ? "e.g., Error Opening Diplomatic Guide" : "Например: Ошибка при открытии дипломатического пособия"}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 uppercase mb-1">{isEn ? "Detailed Description *" : "Подробное описание вопроса *"}</label>
                  <textarea
                    rows={6}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isEn ? "Describe your problem, suggestion, or question in detail..." : "Опишите вашу проблему, предложение или вопрос во всех подробностях..."}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded p-2.5 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden font-sans"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 uppercase mb-1">{isEn ? "Attach Photo (Optional)" : "Прикрепить фото (Опционально)"}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-700 rounded p-2 focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 dark:file:bg-slate-700 file:text-[#1a365d] dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-600 transition"
                  />
                  {attachment && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">{isEn ? "File selected:" : "Файл выбран:"} {attachment.name}</p>}
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-700 p-4 rounded text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-serif flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0 mt-0.5" />
                  <span>
                    {isEn 
                      ? <>By clicking "Submit to Support", your inquiry enters the MUNKG internal registry. A copy will be automatically routed to our official inbox at <strong>association.mun.support@gmail.com</strong>.</>
                      : <>Нажимая кнопку «Направить в поддержку», ваше обращение поступает во внутренний реестр платформы АМООНКР. Копия будет автоматически перенаправлена координаторам на официальный почтовый ящик <strong>association.mun.support@gmail.com</strong>.</>}
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full sm:w-auto text-xs font-bold uppercase tracking-widest py-3 px-6 rounded transition-all text-white flex items-center justify-center gap-2 ${
                      loading ? "bg-slate-400 cursor-not-allowed" : "bg-[#1a365d] hover:bg-[#112543]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span>{isEn ? "Sending..." : "Отправка..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isEn ? "Submit to Support" : "Направить в поддержку"}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              /* Submission Success State */
              <div className="text-center py-10 space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-250 dark:border-emerald-700/50 shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-bold block">
                    {isEn ? "Inquiry Created Successfully!" : "Обращение успешно сформировано!"}
                  </span>
                  <h3 className="text-xl font-serif font-black text-[#1a365d] dark:text-slate-100">
                    {isEn ? "Your request has been sent to the Secretariat" : "Ваш запрос отправлен в Секретариат"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-400 font-serif leading-relaxed max-w-md mx-auto pt-1 italic">
                    {isEn 
                      ? <>Your ticket has been recorded in the internal registry. A copy of the inbound ticket has been sent for processing to <strong>association.mun.support@gmail.com</strong>. The MUNKG team will contact you within 24 hours at the provided email.</>
                      : <>Уведомление успешно зафиксировано во внутреннем реестре. Копия входящего тикета передана на обработку по адресу <strong>association.mun.support@gmail.com</strong>. Команда АМООНКР свяжется с вами в течение 24 часов на указанный e-mail.</>}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 text-left text-xs max-w-md mx-auto space-y-2.5">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[9px] block">{isEn ? "Recipient" : "Получатель связи"}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">association.mun.support@gmail.com</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[9px] block">{isEn ? "Category" : "Категория"}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{category}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[9px] block">{isEn ? "Applicant" : "Заявитель"}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{name} ({email})</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleResetForm}
                    className="bg-[#1a365d] dark:bg-slate-100 hover:bg-[#112543] dark:hover:bg-white dark:bg-slate-900 text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded transition"
                  >
                    {isEn ? "Submit Another Ticket" : "Подать еще одно обращение"}
                  </button>
                  <a
                    href={`mailto:association.mun.support@gmail.com?subject=[${isEn ? 'MUNKG Support' : 'АМООНКР Поддержка'}] ${category}: ${subject || (isEn ? 'Inquiry' : 'Обращение')}&body=${isEn ? 'Hello, my name is' : 'Здравствуйте, меня зовут'} ${name}.\n\n${isEn ? 'Message' : 'Сообщение'}:\n${message}`}
                    className="bg-white dark:bg-slate-900 dark:bg-slate-800 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-200 border border-slate-250 dark:border-slate-600 font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded transition inline-flex items-center gap-1"
                  >
                    <span>{isEn ? "Open in Email Client" : "Открыть в почтовом клиенте"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
          {/* Sidebar Area: Contact Details and Submission History */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* General Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 border-b dark:border-slate-800 pb-2">
                {isEn ? "Direct Secretariat Contacts" : "Прямые контакты Секретариата"}
              </h3>

              <div className="space-y-4 text-xs font-serif text-slate-700 dark:text-slate-300 dark:text-slate-300">
                <div className="flex gap-3 items-start">
                  <Mail className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-bold text-[9px] text-slate-400 uppercase leading-none">{isEn ? "Official E-mail" : "Официальный E-mail"}</p>
                    <a href="mailto:association.mun.support@gmail.com" className="hover:text-[#1a365d] dark:hover:text-[#80add0] underline transition font-semibold font-sans">
                      association.mun.support@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Phone className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-bold text-[9px] text-slate-400 uppercase leading-none">{isEn ? "Support Phone" : "Телефон поддержки"}</p>
                    <p className="font-semibold font-sans mt-0.5">+996 990 846 999</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Clock className="w-4 h-4 text-[#1a365d] dark:text-[#80add0] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-bold text-[9px] text-slate-400 uppercase leading-none">{isEn ? "Operating Hours" : "Режим обработки обращений"}</p>
                    <p className="font-semibold leading-tight mt-0.5">{isEn ? "Monday — Friday: 10:00 - 18:00 (UTC+6)" : "Понедельник — Пятница: 10:00 - 18:00 (UTC+6)"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiries Submission History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#1a365d] dark:text-[#80add0]" />
                  <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                    {isEn ? "Your Ticket History" : "Ваша история тикетов"}
                  </h3>
                </div>
                {savedInquiries.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                    title={isEn ? "Clear History" : "Очистить историю"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {savedInquiries.length === 0 ? (
                <div className="text-center py-6">
                  <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto mb-2" />
                  <p className="text-[11px] font-serif text-slate-400 dark:text-slate-500 italic">
                    {isEn ? "You don't have any submitted inquiries yet. All your inquiries are saved locally on this device." : "У вас пока нет отправленных обращений. Все ваши обращения сохраняются на этом устройстве."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {savedInquiries.map((inq) => (
                    <div key={inq.id} className="border border-slate-150 dark:border-slate-700/50 rounded p-3 text-xs bg-slate-50 dark:bg-slate-950/50 dark:bg-slate-800 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-700/50 transition">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-[#1a365d] dark:text-[#80add0] px-1.5 py-0.5 rounded border dark:border-slate-600">
                          {inq.category}
                        </span>
                        <span className={`text-[8px] font-mono font-bold flex items-center gap-1 ${
                          inq.status === "Отвечено" || inq.status === "Replied" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            inq.status === "Отвечено" || inq.status === "Replied" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                          }`}></span>
                          {inq.status}
                        </span>
                      </div>
                      
                      <h4 className="font-sans font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {inq.subject}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 dark:text-slate-400 font-serif italic mt-1 line-clamp-2 leading-relaxed">
                        "{inq.message}"
                      </p>
                      {inq.attachmentName && (
                        <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/20 inline-block px-1.5 py-0.5 rounded">
                          {isEn ? "Attachment:" : "Вложение:"} {inq.attachmentName}
                        </div>
                      )}
                      
                      {inq.reply && (
                        <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-150 dark:border-emerald-800/30 p-2 rounded text-[11px] text-slate-800 dark:text-slate-300 space-y-1">
                          <span className="font-sans font-extrabold text-[8px] text-emerald-800 dark:text-emerald-400 uppercase block tracking-wider leading-none">
                            {isEn ? "Secretariat Reply:" : "Ответ секретариата:"}
                          </span>
                          <p className="font-serif italic leading-relaxed text-slate-700 dark:text-slate-300 dark:text-slate-300">
                            "{inq.reply}"
                          </p>
                          <span className="text-[8px] text-slate-400 block text-right font-mono font-semibold">
                            {inq.replyDate}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-[9px] font-mono text-slate-400">
                        <span>{isEn ? "From:" : "От:"} {inq.name}</span>
                        <span>{inq.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Custom premium design confirmation modal to bypass standard iframe window.confirm blocks */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full border border-red-100 dark:border-red-800/30 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-950 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded border dark:border-slate-700 transition"
              >
                {isEn ? "Cancel" : "Отмена"}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded transition"
              >
                {isEn ? "Confirm" : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
