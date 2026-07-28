import { Award, Compass, Globe, Users, TrendingUp, Calendar, BookOpen, ShieldCheck } from "lucide-react";

interface AboutUsProps {
  setCurrentTab: (tab: string) => void;
  lang?: "ru" | "en";
}

export default function AboutUs({ setCurrentTab, lang = "ru" }: AboutUsProps) {
  const isEn = lang === "en";

  return (
    <div className="space-y-16 py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left animate-in fade-in duration-300">
      
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#162e50] text-white p-8 sm:p-12 lg:p-16 border border-slate-900 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(192,160,128,0.1),transparent)]" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#c0a080]/20 border border-[#c0a080]/30 px-3 py-1 rounded-full text-[#c0a080] text-[10px] font-mono uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            <span>{isEn ? "A New Era Of Youth Diplomacy" : "Новая Эра Молодежной Дипломатии"}</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {isEn ? (
              <>
                Model United Nations <br className="hidden sm:inline" />
                <span className="text-[#c0a080]">Association of Kyrgyzstan</span>
              </>
            ) : (
              <>
                Ассоциация Модели ООН <br className="hidden sm:inline" />
                <span className="text-[#c0a080]">Кыргызской Республики</span>
              </>
            )}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-serif leading-relaxed text-justify max-w-2xl">
            {isEn 
              ? "We are Kyrgyzstan's modern, rapid-growing youth alliance created to elevate debate quality, bilateral negotiations, and international analysis to a professional international level."
              : "Мы — новая, быстрорастущая молодежная платформа в Кыргызстане, созданная для того, чтобы поднять качество дебатов, переговоров и международной аналитики на абсолютно новый профессиональный уровень."
            }
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setCurrentTab("conferences")}
              className="px-5 py-3 bg-[#c0a080] hover:bg-[#b09070] text-[#1a365d] text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md inline-flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>{isEn ? "Active Conferences" : "Действующие Конференции"}</span>
            </button>
            <button
              onClick={() => setCurrentTab("guides")}
              className="px-5 py-3 bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 dark:hover:bg-slate-900/15 text-white border border-white/20 text-xs font-bold uppercase tracking-wider rounded-lg transition-all inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? "Base of Knowledge" : "База Знаний"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Narrative Zone - Who We Are & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Story details */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-black text-[#1a365d] dark:text-[#80add0] uppercase tracking-wider">
              {isEn ? "About Our Association" : "О Нашей Ассоциации"}
            </h2>
            <div className="w-20 h-1 bg-[#c0a080]" />
            
            <p className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed text-justify">
              {isEn 
                ? "The Model United Nations Association of Kyrgyzstan launched recently. Bringing together likeminded peers, experienced delegates, and young experts in international affairs, we set an honorable goal — to build a unified, fair, and high-caliber ecosystem of diplomatic debates across our country."
                : "Ассоциация Модели ООН Кыргызской Республики зародилась совсем недавно. Собрав единомышленников, опытных делегатов и молодых экспертов по международным отношениям, мы поставили перед собой значимую цель — создать единую, честную и высококлассную экосистему дипломатических дебатов в нашей стране."
              }
            </p>
            
            <p className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed text-justify">
              {isEn 
                ? "We see immense potential in the Kyrgyz youth — intelligent, passionate, and eager to be heard on the global stage. However, for a long time, the MUN movement in Kyrgyzstan grew in a fragmented manner. Our initiative integrates schools, universities, and independent clubs in all regions of our country under unified academic standards."
                : "Мы видим колоссальный потенциал в кыргызстанской молодежи — умной, страстной, стремящейся быть услышанной в глобальном мире. Однако долгое время движение Моделей ООН в Кыргызстане развивалось разрозненно. Наша инициатива объединяет школы, университеты и независимые клубы во всех регионах и областях республики под эгидой единых академических стандартов."
              }
            </p>

            <blockquote className="border-l-4 border-[#c0a080] pl-4 italic text-xs text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 font-serif bg-slate-50 dark:bg-slate-800/50 py-3 rounded-r-lg">
              {isEn 
                ? "\"Diplomacy is not merely about business suits and protocol speeches. It is the noble art of listening, negotiating, and discovering consensus where compromise seems unreachable. These are the precious skills we lay as the foundation of every model conference we run.\""
                : "«Дипломатия — это не просто костюмы и протокольные речи. Это благородное искусство слушать, договариваться и находить консенсус там, где компромисс кажется невозможным. Именно эти ценные навыки мы закладываем в основу каждой проводимой нами дипломатической Модели.»"
              }
            </blockquote>
          </div>

          <div className="p-4 bg-[#1a365d]/5 dark:bg-[#1a365d]/20 border border-[#1a365d]/10 dark:border-[#1a365d]/40 rounded-xl flex items-center gap-4 text-left">
            <div className="bg-[#1a365d] text-[#c0a080] p-2.5 rounded-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-[#1a365d] dark:text-[#80add0] tracking-wider">
                {isEn ? "Official MUNKG Standards" : "Официальные стандарты MUNKG"}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 font-serif mt-0.5">
                {isEn 
                  ? "Each Model on our platform undergoes verification in accordance with a single unified diplomatic protocol."
                  : "Каждая Модель на нашей платформе проходит верификацию по единому дипломатическому регламенту."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Stats / Core principles Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-900 text-white flex flex-col justify-between shadow-lg">
          <div className="space-y-6">
            <h3 className="font-serif font-black text-lg text-[#c0a080] tracking-wider uppercase">
              {isEn ? "Our Key Priorities" : "Наши Ключевые Приоритеты"}
            </h3>
            
            <div className="space-y-4 font-sans text-left">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <TrendingUp className="w-4 h-4 text-[#c0a080]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-100">
                    {isEn ? "Elevated Diplomatic Quality" : "Рост Качества Дипломатии"}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-serif mt-0.5">
                    {isEn 
                      ? "We introduce advanced codes of conduct to ensure debates are constructive and final resolutions hold academic and practical weight."
                      : "Мы внедряем передовые регламенты ведения переговоров, чтобы дебаты были конструктивными, а оригинальные резолюции имели академическую практическую ценность."
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <Users className="w-4 h-4 text-[#c0a080]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-100">
                    {isEn ? "Inclusivity & Geographic Outreach" : "Инклюзивность и Охват"}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-serif mt-0.5">
                    {isEn 
                      ? "We empower talented students from regional schools and communities to compete and grow on equal terms with central capital speakers."
                      : "Даем возможность талантливым ребятам из региональных школ и отдаленных населенных пунктов на равных конкурировать и обучаться с лучшими столичными спикерами."
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <Globe className="w-4 h-4 text-[#c0a080]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-100">
                    {isEn ? "International Gateways" : "Международные Мосты"}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-serif mt-0.5">
                    {isEn 
                      ? "We forge long-term partnerships with leading associations worldwide to annually send outstanding Kyrgyz delegates to international conferences."
                      : "Мы выстраиваем долгосрочные мосты с авторитетными ассоциациями по всему миру для ежегодного направления делегатов из Кыргызстана на международные форумы."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-mono font-black text-[#c0a080]">2026</div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                {isEn ? "Year Established" : "Год Основания"}
              </p>
            </div>
            <div>
              <div className="text-2xl font-mono font-black text-[#c0a080]">100%</div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                {isEn ? "Impartiality" : "Беспристрастность"}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Our core features / steps to participate */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xs text-left space-y-6 transition-colors">
        <h3 className="font-serif text-xl font-bold text-[#1a365d] dark:text-[#80add0] uppercase tracking-wider text-center">
          {isEn ? "Three Simple Steps for Delegates" : "Три Простых Шага для Делегата"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 font-sans">
          
          <div className="p-5 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <span className="text-slate-300 dark:text-slate-600 dark:text-slate-400 dark:text-slate-400 font-mono text-3xl font-black block leading-none">01</span>
            <h4 className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200">
              {isEn ? "Learn the Theory" : "Изучите Теорию"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 font-serif leading-relaxed">
              {isEn 
                ? <>Navigate to <strong className="text-slate-800 dark:text-slate-200">"MUN Education"</strong> to read our step-by-step guidance on writing Position Papers, rules of procedure, and defending resolutions.</>
                : <>Перейдите в раздел <strong className="text-slate-800 dark:text-slate-200">«Обучение Модели ООН»</strong>, где собрана пошаговая инструкция о написании Position Paper, правилах ведения прений и правильной защите резолюций.</>
              }
            </p>
          </div>

          <div className="p-5 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <span className="text-slate-300 dark:text-slate-600 dark:text-slate-400 dark:text-slate-400 font-mono text-3xl font-black block leading-none">02</span>
            <h4 className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200">
              {isEn ? "Choose a Conference" : "Выберите Конференцию"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 font-serif leading-relaxed">
              {isEn 
                ? <>In the <strong className="text-slate-800 dark:text-slate-200">"Conferences"</strong> tab, find upcoming models in your region and choose a committee matching your academic interests.</>
                : <>В меню <strong className="text-slate-800 dark:text-slate-200">«Актуальные конференции»</strong> найдите ближайшую конференцию в интересующем вас регионе и запишитесь на подходящую секцию по вашим академическим интересам.</>
              }
            </p>
          </div>

          <div className="p-5 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <span className="text-slate-300 dark:text-slate-600 dark:text-slate-400 dark:text-slate-400 font-mono text-3xl font-black block leading-none">03</span>
            <h4 className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200">
              {isEn ? "Register Online" : "Зарегистрируйтесь"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 font-serif leading-relaxed">
              {isEn 
                ? <>Submit your delegate application easily via our official <strong className="text-slate-800 dark:text-slate-200">Telegram robot</strong>, directly on the conference webpage, or through affiliate registration links.</>
                : <>Подайте заявку удобным вам <strong className="text-slate-800 dark:text-slate-200">способом</strong>: через официального Telegram-бота, на странице конференции или по прямой внешней ссылке организаторов.</>
              }
            </p>
          </div>

        </div>
      </div>

      {/* Trust Sign & Logo statement */}
      <div className="text-center py-6 border-t dark:border-slate-800 font-serif">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {isEn 
              ? "Official Affiliate • Unified Diplomatic Standard of Kyrgyzstan" 
              : "Официальный Аффилиат • Единый Дипломатический Стандарт КР"
            }
          </span>
        </div>
      </div>

    </div>
  );
}
