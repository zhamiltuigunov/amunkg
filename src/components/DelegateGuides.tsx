import { useState } from "react";
import { BookOpen, FileSpreadsheet, Landmark, Vote, Check, Users2, ShieldQuestion, AlertCircle, MessageSquare, Clock, Copy, Hand, Gavel, Globe, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DelegateGuidesProps {
  lang?: "ru" | "en";
}

export default function DelegateGuides({ lang = "ru" }: DelegateGuidesProps) {
  const isEn = lang === "en";
  const [activeStage, setActiveStage] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const debateStages = [
    {
      title: isEn ? "1. Roll Call" : "1. Перекличка (Roll Call)",
      code: "ROLL_CALL",
      description: isEn 
        ? "Mandatory beginning of sessions. The Secretary-General reads the list of states. Delegates declare their presence."
        : "Обязательное начало заседаний. Генеральный Секретарь оглашает список государств. Делегаты заявляют о присутствии.",
      rules: isEn 
        ? [
            "Answering 'Present': allows you to abstain during the final voting on the resolution.",
            "Answering 'Present & Voting': requires the delegate to vote either for or against the resolution (no abstentions allowed).",
            "Failing to answer may result in losing voting rights for the session."
          ]
        : [
            "Ответ «Присутствует» (Present): позволяет воздерживаться при финальном одобрении резолюции.",
            "Ответ «Присутствует и Голосует» (Present & Voting): обязует делегата проголосовать либо за, либо против резолюции (без права высказаться нейтрально).",
            "Опоздавшие делегаты обязаны отправить записку Президиуму для внесения их в список."
          ],
      icon: Users2
    },
    {
      title: isEn ? "2. Speakers' List" : "2. Список ораторов (Speakers' List)",
      code: "SPEAKERS_LIST",
      description: isEn 
        ? "Standard formal mode of debate. A maximum time limit for speeches is set (usually 60–90 seconds)."
        : "Главная формальная часть заседания. Устанавливается лимит времени на выступления (обычно 60–90 секунд).",
      rules: isEn
        ? [
            "Delegates speak exclusively on behalf of their state's official policy.",
            "Remaining speaking time can be yielded to the Chair, another delegate, or to questions."
          ]
        : [
            "Делегаты выступают строго от лица государства (в третьем лице).",
            "Оставшееся время можно уступить Председателю (yield to the Chair), другому делегату (yield to another delegate) или вынести на вопросы (yield to questions)."
          ],
      icon: Clock
    },
    {
      title: isEn ? "3. Moderated Caucus" : "3. Модерируемые Кокусы",
      code: "MODERATED_CAUCUS",
      description: isEn 
        ? "Informal mode of substantive debate. Discussion of specific micro-aspects of the agenda."
        : "Формат быстрых выступлений с места для обсуждения конкретных проблемных узлов (подтем).",
      rules: isEn 
        ? [
            "A Motion must specify total duration (e.g., 10 mins), speaking time (e.g., 60 sec), and a clear topic.",
            "Speakers are called upon by raising placards at the Chair's discretion."
          ]
        : [
            "Для начала нужно внести предложение (Motion) с указанием общей длительности, времени 1 спикера и конкретной темы.",
            "Очередь выступлений регулируется поднятием табличек по усмотрению Председателя (без списка ораторов)."
          ],
      icon: Hand
    },
    {
      title: isEn ? "4. Unmoderated Caucus" : "4. Немодерируемые Кокусы",
      code: "UNMODERATED_CAUCUS",
      description: isEn 
        ? "Free lobbying and networking. The core of the diplomatic process and negotiations."
        : "Свободное кулуарное общение. Ключевой этап для лоббирования и объединения в коалиции.",
      rules: isEn 
        ? [
            "Delegates freely move around the room and form drafting blocs.",
            "Collective drafting of Working Papers happens here, merging into Draft Resolutions."
          ]
        : [
            "Официальные правила приостанавливаются: делегаты свободно перемещаются по залу.",
            "Происходит написание рабочих бумаг (Working Papers) и проектов резолюций (Draft Resolutions)."
          ],
      icon: Globe
    },
    {
      title: isEn ? "5. Voting Block" : "5. Голосование (Voting Block)",
      code: "VOTING_BLOCK",
      description: isEn 
        ? "The finale of the simulation. Debates closure, voting on Amendments, then the Draft Resolution."
        : "Кульминация комитета. Голосование по поправкам (Amendments), затем по самому проекту резолюции.",
      rules: isEn 
        ? [
            "Doors are locked. Entering/exiting the room is prohibited. No passing notes.",
            "Procedural voting requires a simple majority. Substantive voting rules vary by committee."
          ]
        : [
            "Двери закрываются, вход/выход запрещен, передача записок блокируется.",
            "Каждый делегат голосует: «За» (For/In favor), «Против» (Against) или «Воздерживаюсь» (Abstain, если позволяет статус «Present»)."
          ],
      icon: Vote
    }
  ];

  const positionPaperTemplateStyle = {
    fontFamily: '"JetBrains Mono", "SF Mono", "SFMono-Regular", ui-monospace, monospace',
    lineHeight: 1.6,
  };

  const positionPaperTemplate = isEn ? `POSITION PAPER TEMPLATE

COMMITTEE: [Committee Full Name]
TOPIC: [Topic of the Agenda]
COUNTRY: [Your Country Name]
DELEGATE: [Your Name]

──────────────────────────────────────────────────

Section I: Introduction and Country Context 
Introduce the global significance of the problem. State your country's historical, political, and philosophical connection to this issue. Reference general national interests or constitutional mandates.

Section II: UN & Multilateral Involvement 
Detail past UN resolutions, treaties, or conventions your country has endorsed or sponsored. Give credit to active regional bodies (e.g., EU, AU, ASEAN) and evaluate their contemporary effectiveness.

Section III: Recommended Solutions 
Explain exactly what directives or clauses you want incorporated into the final UN Resolution. Be specific—suggest exact funding mechanisms, review cycles, and compliance methods. Align with your country's foreign policy and known allies.` : `ОБРАЗЕЦ ПОЗИЦИОННОЙ БУМАГИ (POSITION PAPER)

КОМИТЕТ: [Полное название комитета]
ПОВЕСТКА: [Формулировка основной повестки]
СТРАНА: [Государство, которое вы представляете]
ДЕЛЕГАТ: [Ваше имя / ФИО]

──────────────────────────────────────────────────

Раздел I: Введение и контекст страны 
Опишите глобальную значимость проблемы. Укажите историческую, политическую и экономическую связь вашей страны с этим вопросом. Сошлитесь на национальные интересы или конституцию.

Раздел II: Участие в ООН и многосторонние связи 
Укажите прошлые резолюции ООН, конвенции и договоры (с номерами/годами), которые ваша страна подписала или ратифицировала. Приведите статистику из официальных источников.

Раздел III: Рекомендуемые решения (План действий)
Объясните, какие именно директивы вы будете продвигать в итоговую Резолюцию. Будьте максимально конкретны: предложите источники финансирования (МВФ, гранты), механизмы мониторинга (комиссии ООН) и санкции. Опирайтесь на реальный геополитический курс страны.`;

  return (
    <div className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-[calc(100vh-80px)] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-1 bg-[#1a365d] dark:bg-[#c0a080] rounded-full"></div>
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                {isEn ? "UN Training Guild" : "Академический центр ООН"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100">
              {isEn ? "Delegate Academy" : "Академия Делегата"}
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-3 max-w-2xl font-serif italic text-balance">
              {isEn 
                ? "Master the Rules of Procedure, draft ironclad resolutions, and orchestrate diplomatic victories with this comprehensive parliamentary guide."
                : "Изучите правила процедуры (RoP), освойте искусство написания резолюций и диктуйте повестку с помощью нашего академического руководства."}
            </p>
          </div>
        </div>

        {/* BENTO GRID: Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* DEBATE STAGES TABS (Left Col 7) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-slate-50 dark:bg-slate-950/50 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#1a365d] dark:text-[#c0a080] flex items-center gap-2 mb-6">
                <Landmark className="w-4 h-4" />
                {isEn ? "Stages of Debate" : "Этапы Заседания"}
              </h3>
              <div className="space-y-2 relative">
                {/* Connecting Line */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                
                {debateStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = activeStage === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStage(idx)}
                      className={`relative w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                        isActive 
                          ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs z-10 scale-[1.02]" 
                          : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#1a365d] text-white dark:bg-[#c0a080] dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider leading-tight ${isActive ? 'text-slate-900 dark:text-slate-100' : ''}`}>
                        {stage.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="md:w-2/3 p-6 md:p-8 md:min-h-[400px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 w-full"
                >
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[10px] tracking-widest font-bold uppercase mb-4">
                      {debateStages[activeStage].code}
                    </span>
                    <h3 className="font-serif italic text-2xl lg:text-3xl text-slate-900 dark:text-slate-100 leading-tight">
                      {debateStages[activeStage].description}
                    </h3>
                  </div>
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {debateStages[activeStage].rules.map((rule, idx2) => (
                      <div key={idx2} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1a365d] group-hover:text-white dark:group-hover:bg-[#c0a080] transition-colors">
                          <span className="text-[10px] font-black">{idx2 + 1}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {rule}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* BEST DELEGATE ADVICE (Right Col 4) */}
          <div className="lg:col-span-4 bg-[#1a365d] text-white rounded-2xl p-8 relative overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 rounded-full bg-[#c0a080]/20 blur-2xl mix-blend-screen pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Gavel className="w-6 h-6 text-[#c0a080]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#c0a080] uppercase mb-2 block">
                  {isEn ? "Secret of Success" : "Секрет Успеха"}
                </span>
                <h4 className="font-serif font-black text-2xl tracking-tight leading-tight">
                  {isEn ? "How to become the Best Delegate?" : "Как стать Лучшим Делегатом?"}
                </h4>
              </div>
              <p className="text-sm text-blue-100/90 leading-relaxed font-serif text-justify pt-2">
                {isEn 
                  ? "Bright speeches alone are not enough. The 'Best Delegate' is a master of procedure who architects coalitions, brings hostile blocs to consensus, and writes feasible, legally-sound operatives in the resolution. Keep your diplomacy sharp, factual, and strictly in-character."
                  : "Одного красноречия недостаточно. «Лучший делегат» — это знаток процедуры, архитектор коалиций и блестящий драфтер. Он объединяет конфликтные блоки ради консенсуса, пишет самые эффективные пункты резолюций и никогда не выходит из роли своей страны (stay in character)."
                }
              </p>
            </div>
            
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
              <Check className="w-5 h-5 text-[#c0a080]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isEn ? "Facts. Leadership. Consensus." : "Факты. Лидерство. Консенсус."}
              </span>
            </div>
          </div>
        </div>

        {/* POINTS & MOTIONS CARDS */}
        <div className="pt-4">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100">
              {isEn ? "Points & Questions" : "Процессуальные Точки (Points)"}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldQuestion, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-900",
                title: isEn ? "Point of Personal Privilege" : "Вопрос к личной привилегии",
                desc: isEn ? "Used for physical discomfort (can't hear, room too cold). Only point that may interrupt a speaker if strictly necessary." : "Используется при устранении дискомфорта (душно, не слышно). Единственная точка, позволяющая прервать чужую речь."
              },
              {
                icon: AlertCircle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-900",
                title: isEn ? "Point of Order" : "К порядку ведения заседания",
                desc: isEn ? "Call out a procedural mistake made by the Chair. Does NOT apply to factual inaccuracies by other delegates. Cannot interrupt." : "Указание на процедурную ошибку Председателя (нарушение правил). Не применяется к ошибкам в речах других делегатов."
              },
              {
                icon: MessageSquare, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-900",
                title: isEn ? "Point of Parliamentary Inquiry" : "Парламентский запрос",
                desc: isEn ? "A direct procedural question to the Chair regarding the rules or current stage. ('Are we in a moderated caucus right now?')" : "Процедурный вопрос к Председателю о правилах или текущей ситуации. ('Можем ли мы сейчас вынести резолюцию?')"
              }
            ].map((point, i) => (
              <div key={i} className={`bg-white dark:bg-slate-900 border ${point.border} rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full`}>
                 <div className={`w-12 h-12 ${point.bg} rounded-full flex items-center justify-center mb-4`}>
                   <point.icon className={`w-6 h-6 ${point.color}`} />
                 </div>
                 <h4 className="font-bold text-sm uppercase tracking-wide mb-3 text-slate-900 dark:text-slate-100 leading-tight">
                   {point.title}
                 </h4>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-auto">
                   {point.desc}
                 </p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ROWS: Paper & Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          
          {/* POSITION PAPER TEMPLATE */}
          <div className="bg-slate-900 text-slate-300 rounded-2xl p-1 shadow-sm flex flex-col h-full lg:min-h-[500px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#c0a080]" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">
                  {isEn ? "Position Paper Master" : "Шаблон Position Paper"}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(positionPaperTemplate);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-2 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-colors uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (isEn ? "Copied" : "Скопировано") : (isEn ? "Copy" : "Копировать")}
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <pre style={positionPaperTemplateStyle} className="text-[11px] sm:text-xs text-slate-300 whitespace-pre-wrap">
                {positionPaperTemplate}
              </pre>
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            {/* RESOLUTION TIPS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-1">
              <h4 className="font-serif font-black text-slate-900 dark:text-slate-100 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                 <FileSpreadsheet className="w-5 h-5 text-[#1a365d] dark:text-[#c0a080]" />
                 {isEn ? "Resolution Drafting Rules" : "Правила Написания Резолюции"}
              </h4>
              <ul className="space-y-4">
                <li className="flex gap-4 align-top">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c0a080] mt-2 shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-900 dark:text-slate-100 mb-1">{isEn ? "Preambulatory Clauses (Intro)" : "Преамбула (Вводная часть)"}</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                      {isEn ? "Starts with italicized gerunds (e.g., Affirming, Noting with regret). These acknowledge the problem, cite past UN actions, and set the tone. Cannot impose action." : "Начинается с причастий или деепричастий курсивом (Напоминая, Отмечая, Признавая). Констатирует проблему и дает отсылки на хартии ООН. Не содержит прямых действий."}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 align-top">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a365d] dark:bg-[#80add0] mt-2 shrink-0" />
                  <div>
                    <strong className="block text-sm text-slate-900 dark:text-slate-100 mb-1">{isEn ? "Operative Clauses (Action)" : "Оперативная часть (Действия)"}</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                      {isEn ? "Numbered points starting with actionable verbs (Urges, Decides, Recommends). Contains meat: specific frameworks, funding bodies, troops, and solutions." : "Нумерованные пункты с глаголами (Призывает, Постановляет, Рекомендует). Это суть резолюции: выделение бюджетов МВФ, отправка миротворцев, санкции, точные механизмы."}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* ETIQUETTE & DRESS CODE */}
            <div className="bg-slate-50 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h4 className="font-serif font-black text-slate-900 dark:text-slate-100 text-lg mb-4 flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#1a365d] dark:text-[#c0a080]" />
                  {isEn ? "Protocol & Etiquette" : "Протокол и Этикет"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-wider block mb-2">{isEn ? "Language" : "Язык общения"}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {isEn ? "Always speak in the Third Person ('The delegation of France believes'). Address the President as 'Honorable Chair'." : "Только третье лицо! Не «Я считаю», а «Делегация Германии полагает». Обращение к Президиуму — «Многоуважаемый Председатель»."}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-wider block mb-2">{isEn ? "Dress Code" : "Внешний Вид (WBA)"}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {isEn ? "Strict Western Business Attire. Formal suits, ties, dresses. Jeans and sneakers are forbidden and result in expulsion." : "Строгий деловой стиль (костюмы, галстуки, строгие платья). Джинсы, кеды, спортивная одежда строго запрещены."}
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* EXTRA MODULES: Vocabulary & Advanced Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 pb-8">
          
          {/* VOCABULARY / LEXICON */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
             <h4 className="font-serif font-black text-slate-900 dark:text-slate-100 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
               <BookOpen className="w-5 h-5 text-[#1a365d] dark:text-[#c0a080]" />
               {isEn ? "UN Phraseology & Lexicon" : "Дипломатический Словарь"}
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-slate-800 dark:text-slate-200 block text-xs font-bold uppercase tracking-wider mb-3">{isEn ? "Preambulatory" : "Вводные фразы"}</strong>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-serif">
                    <li className="flex gap-2"><span className="text-[#c0a080]">■</span> {isEn ? "Deeply concerned by..." : "Глубоко обеспокоенные..."}</li>
                    <li className="flex gap-2"><span className="text-[#c0a080]">■</span> {isEn ? "Recalling resolution..." : "Напоминая о Резолюции..."}</li>
                    <li className="flex gap-2"><span className="text-[#c0a080]">■</span> {isEn ? "Noting with regret..." : "Отмечая с сожалением..."}</li>
                    <li className="flex gap-2"><span className="text-[#c0a080]">■</span> {isEn ? "Recognizing that..." : "Признавая, что..."}</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-slate-800 dark:text-slate-200 block text-xs font-bold uppercase tracking-wider mb-3">{isEn ? "Operative (Action)" : "Резолютивные (Действия)"}</strong>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-serif">
                    <li className="flex gap-2"><span className="text-[#1a365d] dark:text-[#80add0]">■</span> {isEn ? "Urges member states..." : "Настоятельно призывает..."}</li>
                    <li className="flex gap-2"><span className="text-[#1a365d] dark:text-[#80add0]">■</span> {isEn ? "Requests funding for..." : "Запрашивает средства на..."}</li>
                    <li className="flex gap-2"><span className="text-[#1a365d] dark:text-[#80add0]">■</span> {isEn ? "Condemns the actions..." : "Категорически осуждает..."}</li>
                    <li className="flex gap-2"><span className="text-[#1a365d] dark:text-[#80add0]">■</span> {isEn ? "Decides to establish..." : "Постановляет учредить..."}</li>
                  </ul>
                </div>
             </div>
          </div>

          {/* ADVANCED RULES: Yields & Amendments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
             <h4 className="font-serif font-black text-slate-900 dark:text-slate-100 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
               <Gavel className="w-5 h-5 text-[#1a365d] dark:text-[#c0a080]" />
               {isEn ? "Advanced Rules (Yields & Amendments)" : "Продвинутые Правила (Уступки и Поправки)"}
             </h4>
             <div className="space-y-5">
               <div>
                  <strong className="block text-sm text-slate-900 dark:text-slate-100 mb-1">{isEn ? "Yielding Time (Уступка времени)" : "Уступка времени (Yields)"}</strong>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {isEn ? "If you finish speaking before your time expires in the General Speakers List, you MUST yield the remaining time. You can yield to: 1) The Chair (ends your speech), 2) Another delegate (they take your remaining time), 3) Questions (delegates can ask you questions for the remaining time)." : "Оставшееся время по Списку Ораторов (GSL) НЕЛЬЗЯ просто промолчать. Вы обязаны уступить его: 1) Председателю (сброс времени), 2) Другому делегату (передача слова), 3) Блоку вопросов (делегаты в зале будут задавать вам вопросы в счет остатка)."}
                  </p>
               </div>
               <div className="h-px bg-slate-100 dark:bg-slate-800 w-full rounded"></div>
               <div>
                  <strong className="block text-sm text-slate-900 dark:text-slate-100 mb-1">{isEn ? "Resolution Amendments" : "Поправки к Резолюции (Amendments)"}</strong>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {isEn ? "Friendly Amendments: Approved by ALL original sponsors of the Draft Resolution and added automatically. Unfriendly Amendments: Not approved by all sponsors; requires voting by the entire committee to be included." : "Дружественные (Friendly): Одобрены ВСЕМИ авторами резолюции, вносятся автоматически без голосования. Недружественные (Unfriendly): НЕ одобрены авторами, выносятся на общее голосование всего комитета перед финалом."}
                  </p>
               </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}