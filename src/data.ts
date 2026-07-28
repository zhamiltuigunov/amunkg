import { NewsPost, MUNConference, AppNotification, ConferenceRating } from "./types";

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Скоро закрытие Early Bird!",
    titleEn: "Early Bird Closing Soon!",
    message: "Успейте зарегистрироваться на KGMUN 2025 по сниженной цене (Early Bird). Регистрация закрывается через 3 дня.",
    messageEn: "Make sure to register for KGMUN 2025 at the reduced Early Bird price. Registration closes in 3 days.",
    type: "early_bird",
    date: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: "notif-2",
    title: "Внимание: Изменение расписания",
    titleEn: "Attention: Schedule Change",
    message: "Время проведения церемонии открытия MUB MUN 2024 перенесено с 09:00 на 10:00 в связи с приездом почетных гостей.",
    messageEn: "The MUB MUN 2024 Opening Ceremony has been rescheduled from 09:00 to 10:00 due to the arrival of VIP guests.",
    type: "schedule_change",
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true
  },
  {
    id: "notif-3",
    title: "Открыт новый комитет: ECOSOC!",
    titleEn: "New Committee Open: ECOSOC!",
    message: "Мы рады объявить, что теперь вы можете подать заявку в комитет ECOSOC. Изучите новую повестку в календаре.",
    messageEn: "We are excited to announce that ECOSOC is now open for applications. Check out the new agenda in the directory.",
    type: "committee_update",
    date: new Date(Date.now() - 172800000).toISOString(),
    read: false
  }
];

export const INITIAL_NEWS_POSTS: NewsPost[] = [
  {
    id: "news-1",
    title: "Парадигмы кибербезопасности: Комитет DISEC обсуждает суверенитет в эпоху ИИ",
    titleEn: "Cybersecurity Paradigms: DISEC Discusses Sovereignty in the AI Era",
    excerpt: "Растущий кризис государственного контроля над цифровыми границами ставит перед Модели ООН новые вызовы. Как адаптировать классические резолюции под реалии киберэры?",
    excerptEn: "The growing crisis of state control over digital borders poses new challenges for Model UN. How can classic resolutions be adapted to the realities of the cyber era?",
    content: `### Новая эра суверенитета в киберпространстве
На повестке дня Первого комитета Генеральной Ассамблеи ООН (DISEC) стоит один из острейших вопросов современности — разработка конвенций по защите критической инфраструктуры от вредоносного программного обеспечения и регулирование использования автономных кибероружий в зонах конфликтов.

#### Ключевой конфликт позиций
Основные дипломатические блоки делятся на сторонников жесткого регулирования цифрового суверенитета (включая государственную фильтрацию трафика) и защитников свободного глобального интернета. С точки зрения обучения участников MUN:
* **Инфраструктурные риски:** Темы кибератак на объекты водоснабжения и электрохимические узлы требуют от делегатов знания Таллиннского руководства (Tallinn Manual).
* **Моральный аспект искусственного интеллекта:** Допускается ли интеграция систем самообучения в контрбатарейные комплексы?

#### Методические советы для делегаций
Для успешного составления рабочей бумаги делегаты должны не просто перечислять прошлые инциденты, а спроектировать жизнеспособный многосторонний орган контроля — Комитет по кибербезопасности ИИ (AICSC), который удовлетворит интересы государств с различным технологическим уровнем развития.`,
    contentEn: `### A New Era of Cyber Sovereignty
On the agenda of the First Committee of the UN General Assembly (DISEC) is one of the most acute issues of our time - drafting conventions to protect critical infrastructure from malware and regulating autonomous cyberweapons in conflict zones.

#### Key Conflict of Positions
Diplomatic blocs are divided into supporters of strict regulation of digital sovereignty and defenders of a free global internet. For MUN participants:
* **Infrastructural Risks:** Cybersecurity themes require knowledge of the Tallinn Manual.
* **The Moral Aspect of AI:** Is the integration of machine learning systems into combat allowed?

#### Methodological Advice for Delegations
To successfully draft a working paper, delegates must design a viable multilateral control body - the AI Cybersecurity Committee (AICSC) that satisfies the interests of states with varying levels of technological development.`,
    category: "Security",
    author: "Александр Волков, Эксперт по безопасности MUN Association",
    date: "24 Мая 2026",
    readTime: "6 мин",
    featuredImg: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    tags: ["Cybersecurity", "DISEC", "AI", "Sovereignty"]
  },
  {
    id: "news-2",
    title: "Императивы охраны климата: Адаптация островных государств к повышению уровня океана",
    titleEn: "Climate Protection Imperatives: Adaptation of Island States to Rising Sea Levels",
    excerpt: "Малые островные государства (SIDS) заявляют об ущемлении их фундаментальных территориальных прав и требуют срочных экологических компенсаций от развитых индустриальных держав.",
    excerptEn: "Small Island Developing States (SIDS) complain of the infringement of their fundamental territorial rights and demand urgent ecological compensation from developed industrial powers.",
    content: `### Экологический кризис и кризис идентичности в SOCHUM и UNEP
Катастрофические последствия климатических изменений делают проблему климатического беженства ключевой для гуманитарных и экологических комитетов ООН. На примере Мальдив, Тувалу и Кирибати делегатам MUN Association предстоит переосмыслить понятия государственной юрисдикции и идентичности наций.

#### Основные дебаты
1. **Экологическая репарация:** Должна ли существовать юридическая обязанность развитых промышленных экономик выплачивать ежегодную ренту за загрязнение атмосферы непосредственно в Фонд климатических беженцев?
2. **Утрата сухопутных границ:** Имеет ли право государство сохранить статус члена ООН, если вся его физическая территория оказалась погребена под водой?

#### Архитектурное решение в резолюциях
Предлагается формировать альянсы малых наций для лоббирования положений о трансграничных зеленых коридорах и распределении долей вылова рыбы на исторических морских экономических зонах даже после физического затопления участков суши.`,
    contentEn: `### Ecological and Identity Crisis in SOCHUM and UNEP
The catastrophic consequences of climate change make the issue of climate refugees central to the humanitarian and environmental committees of the UN. Using the Maldives, Tuvalu, and Kiribati as examples, MUN Association delegates must rethink the concepts of state jurisdiction and national identity.

#### Main Debates
1. **Ecological Reparation:** Should there be a legal obligation for developed industrial economies to pay an annual rent for atmospheric pollution directly to the Climate Refugee Fund?
2. **Loss of Land Borders:** Does a state have the right to maintain its UN membership status if its entire physical territory is submerged under water?

#### Architectural Solution in Resolutions
It is proposed to form alliances of small nations to lobby for provisions on cross-border green corridors and the distribution of fish catch quotas in historical maritime economic zones even after the physical innundation of land areas.`,
    category: "Environment",
    author: "Елена Сазонова, Международный обозреватель",
    date: "18 Мая 2026",
    readTime: "8 мин",
    featuredImg: "https://images.unsplash.com/photo-1544724480-6cc69f71e6be?auto=format&fit=crop&q=80&w=800",
    tags: ["Climate Change", "UNEP", "SIDS", "Sovereignty"]
  },
  {
    id: "news-3",
    title: "Руководство по дебатам: Как доминировать на неформальных консультациях (Unmoderated Caucus)",
    titleEn: "Debate Guide: How to Dominate in Unmoderated Caucuses",
    excerpt: "Секреты кулуарной дипломатии на Модели ООН. Учимся собирать сильные коалиции, продвигать свои пункты в рабочую бумагу и писать сильные резолюции.",
    excerptEn: "Secrets of backstage diplomacy at Model UN. Learn how to build strong coalitions, push your points into a working paper, and write strong resolutions.",
    content: `### Неформальные дебаты: Арена настоящей дипломатии
В то время как формальные выступления в списке ораторов (Speakers' List) формируют лицо делегации, именно неформальные консультации (Unmoderated Caucus) куют окончательный текст резолюции. Здесь проверяются лидерские качества, харизма и прагматизм.

#### Матрица ведения переговоров
* **Создание коалиции:** Не пытайтесь объединить всех сразу. Соберите лояльный лоббистский блок (3-4 соседа по региону), согласуйте общие интересы, а затем выходите на переговоры со встречным сильным блоком.
* **Техника «Split-and-Conquer»:** Если в другом блоке есть колеблющиеся страны, предложите им соавторство конкретной статьи, которая отвечает именно их интересам.
* **Искусство компромисса:** Научитесь жертвовать второстепенными формулировками ради сохранения принципа «red lines» (красных линий) своего государства.

#### Разработка черновика
Настоящий лидер блока всегда держит ноутбук открытым и сам форматирует рабочую бумагу. Контролируя текст на экране, вы контролируете 70% смыслов будущей резолюции. Редактируйте статьи аккуратно, используя уставные глаголы ООН.`,
    contentEn: `### Informal Debates: The Arena of Real Diplomacy
While formal speeches on the Speakers' List shape the face of the delegation, it is the Unmoderated Caucus that forges the final text of the resolution. Here, leadership, charisma, and pragmatism are tested.

#### Matrix of Negotiations
* **Coalition Building:** Do not try to unite everyone at once. Gather a loyal lobbying bloc (3-4 neighbors in the region), agree on common interests, and then negotiate with an opposing strong bloc.
* **The Split-and-Conquer Technique:** If there are wavering countries in another bloc, offer them co-authorship of a specific article that addresses their interests.
* **The Art of Compromise:** Learn to sacrifice secondary formulations to preserve your state's "red lines".

#### Drafting
A true bloc leader always keeps their laptop open and formats the working paper themselves. By controlling the text on the screen, you control 70% of the meanings of the future resolution. Edit articles carefully, using official UN verbs.`,
    category: "Delegate Guide",
    author: "Дмитрий Назаров, Генеральный Секретарь MUN Association",
    date: "12 Мая 2026",
    readTime: "12 мин",
    featuredImg: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    tags: ["MUN Tips", "Unmoderated Caucus", "Rules of Procedure", "Leadership"]
  },
  {
    id: "news-4",
    title: "Интеграционные права беженцев: Гуманитарный кризис на стыке наций",
    titleEn: "Refugee Integration Rights: A Humanitarian Crisis at the Crossroads of Nations",
    excerpt: "Анализ стратегий Управления Верховного комиссара ООН по делам беженцев в вопросах долговременной интеграции переселенцев в принимающие сообщества.",
    excerptEn: "Analysis of UNHCR strategies regarding the long-term integration of displaced persons into host communities.",
    content: `### Гуманитарный долг и вызовы интеграции
Комитет по социальным, гуманитарным и культурным вопросам (SOCHUM) фокусируется на растущем числе лиц, перемещенных вследствие локальных военных столкновений и внутренних межэтнических противоречий.

#### Проблемы правого статуса
Многие страны отказываются ратифицировать Конвенцию 1951 года о статусе беженцев, заменяя ее региональными соглашениями, что усложняет жизнь переселенцам:
* Невозможность легального трудоустройства.
* Ограниченный доступ к образованию и базовой медицине.
* Дискриминация в принимающих районах.

#### Задача делегата
Вашей задачей при составлении резолюции является разработка программ финансирования при поддержке Всемирного банка на основе микрогрантов для семей беженцев, открывающих малый бизнес, что превратит временные гуманитарные расходы в постоянную экономическую выгоду для регионов расселения.`,
    contentEn: `### Humanitarian Duty and Intergration Challenges
The Social, Humanitarian, and Cultural Committee (SOCHUM) focuses on the growing number of people displaced by local military clashes and internal inter-ethnic conflicts.

#### Legal Status Issues
Many countries refuse to ratify the 1951 Refugee Convention, replacing it with regional agreements, which complicates life for displaced persons:
* Impossibility of legal employment.
* Limited access to education and basic medicine.
* Discrimination in host areas.

#### The Delegate's Task
Your task in drafting a resolution is to develop micro-grant-based funding programs with World Bank support for refugee families starting small businesses, turning temporary humanitarian spending into a permanent economic benefit for settlement regions.`,
    category: "Human Rights",
    author: "Мария Клодт, Правозащитник",
    date: "05 Мая 2026",
    readTime: "9 мин",
    featuredImg: "https://images.unsplash.com/photo-1469571486040-af250c29a16e?auto=format&fit=crop&q=80&w=800",
    tags: ["SOCHUM", "UNHCR", "Human Rights", "Migration"]
  }
];

export const INITIAL_CONFERENCES: MUNConference[] = [
  {
    id: "conf-kg-1",
    name: "Bishkek International Model United Nations (BIMUN 2026)",
    location: "Бишкек, Кыргызстан (Американский университет в Центральной Азии - АУЦА)",
    locationEn: "Bishkek, Kyrgyzstan (American University of Central Asia - AUCA)",
    type: "International",
    startDate: "2026-10-15",
    endDate: "2026-10-18",
    committees: ["Совет Безопасности ООН (UNSC)", "Совет по правам человека (UNHRC)", "Комитет по экологии (UNEP)"],
    committeesEn: ["UN Security Council (UNSC)", "UN Human Rights Council (UNHRC)", "Environment Programme (UNEP)"],
    status: "Open",
    registrationFee: "800 KGS",
    org: "MUNKG Secretariat & AUCA Coalition",
    description: "Флагманская осенняя международная симуляция в самом сердце Бишкека. Дебаты на английском и русском языках по острейшим вызовам водных ресурсов Центральной Азии, изменению климата и региональной безопасности.",
    descriptionEn: "Flagship autumn international simulation in the heart of Bishkek. Debates in English and Russian on the most acute challenges of Central Asian water resources, climate change, and regional security.",
    applyUrl: "#view-details-bimun"
  },
  {
    id: "conf-kg-2",
    name: "Issyk-Kul Summer Diplomatic Academy & MUN (Cholpon-Ata 2026)",
    location: "Чолпон-Ата, Иссык-Кульская область (Культурный центр Рух Ордо)",
    locationEn: "Cholpon-Ata, Issyk-Kul Region (Rukh Ordo Cultural Center)",
    type: "Regional",
    startDate: "2026-08-05",
    endDate: "2026-08-09",
    committees: ["Экономический и Социальный Совет (ECOSOC)", "ЮНЕСКО (UNESCO)"],
    committeesEn: ["Economic and Social Council (ECOSOC)", "UNESCO"],
    status: "Open",
    registrationFee: "1500 KGS",
    org: "Alumni Guild of Kyrgyz diplomats & MUNKG",
    description: "Эксклюзивный летний съезд молодых лидеров на лазурном побережье Иссык-Куля. Сочетание интенсивного курса дипломатического протокола, этикета СНГ и дебатов по устойчивому развитию водных артерий региона.",
    descriptionEn: "Exclusive summer gathering of young leaders on the azure coast of Issyk-Kul. A combination of an intensive course on diplomatic protocol, CIS etiquette, and debates on the sustainable development of the region's water arteries.",
    applyUrl: "#view-details-issykkul"
  },
  {
    id: "conf-kg-3",
    name: "Tengri Silk Road High-School MUN Alliance",
    location: "Ош, Кыргызстан (Ошский Государственный Университет)",
    locationEn: "Osh, Kyrgyzstan (Osh State University)",
    type: "Regional",
    startDate: "2026-11-12",
    endDate: "2026-11-14",
    committees: ["Генеральная Ассамблея ООН (GA)", "ЮНИСЕФ (UNICEF)"],
    committeesEn: ["UN General Assembly (GA)", "UNICEF"],
    status: "Closing Soon",
    registrationFee: "500 KGS",
    org: "Osh State University & MUNKG South Youth Club",
    description: "Региональная платформа развития потенциала школьников юга Кыргызской Республики. Фокус на предотвращении конфликтов в приграничных регионах, защите культурного наследия ЮНЕСКО и укреплении гуманитарного сотрудничества.",
    descriptionEn: "A regional platform for developing the potential of schoolchildren in the south of the Kyrgyz Republic. Focus on conflict prevention in border regions, protection of UNESCO cultural heritage, and strengthening humanitarian cooperation.",
    applyUrl: "#view-details-tengri"
  },
  {
    id: "conf-4",
    name: "New York National MUN (NY-NMUN)",
    location: "Нью-Йорк, США (Штаб-квартира ООН)",
    locationEn: "New York, USA (UN Headquarters)",
    type: "International",
    startDate: "2027-03-14",
    endDate: "2027-03-20",
    committees: ["Генеральная Ассамблея ООН", "ЮНИСЕФ (UNICEF)", "МАГАТЭ (IAEA)"],
    committeesEn: ["UN General Assembly", "UNICEF", "IAEA"],
    status: "Open",
    registrationFee: "220 USD",
    org: "National Collegiate Conference Association",
    description: "Крупнейшее MUN событие в мире, собирающее свыше 5000 студентов со всех уголков планеты. Делегация MUNKG ежегодно заявляет команду на участие в данном культовом съезде.",
    descriptionEn: "The largest MUN event in the world, bringing together over 5,000 students from all over the planet. The MUNKG delegation annually submits a team to participate in this iconic convention.",
    applyUrl: "#apply-nyminun"
  },
  {
    id: "conf-kg-4",
    name: "Spring MUN Bishkek 2026",
    location: "Бишкек, Кыргызстан",
    locationEn: "Bishkek, Kyrgyzstan",
    type: "National",
    startDate: "2026-03-20",
    endDate: "2026-03-22",
    committees: ["Генеральная Ассамблея ООН (GA)", "UNSC"],
    committeesEn: ["UN General Assembly (GA)", "UNSC"],
    status: "Closed",
    registrationFee: "400 KGS",
    org: "MUNKG",
    description: "Ежегодная весенняя конференция Модели ООН. Успешно завершена.",
    descriptionEn: "Annual spring MUN conference. Successfully completed.",
    applyUrl: "#view-details-spring"
  }
];

export const INITIAL_RATINGS: ConferenceRating[] = [
  {
    id: "rating-1",
    conferenceId: "conf-kg-4",
    userId: "user-1",
    rating: 5,
    comment: "Отличная организация!",
    createdAt: "2026-03-25T10:00:00Z"
  },
  {
    id: "rating-2",
    conferenceId: "conf-kg-4",
    userId: "user-2",
    rating: 4,
    createdAt: "2026-03-26T14:30:00Z"
  }
];

export const UN_COMMITTEES = [
  "Генеральная Ассамблея ООН (GA)",
  "Совет Безопасности ООН (UNSC)",
  "Комитет по вопросам разоружения и международной безопасности (DISEC)",
  "Комитет по социальным, гуманитарным и культурным вопросам (SOCHUM)",
  "Совет по правам человека (UNHRC)",
  "Программа ООН по окружающей среде (UNEP)",
  "Экономический и Социальный Совет (ECOSOC)",
  "Всемирная Организация Здравоохранения (WHO)"
];

export const UN_COUNTRIES = [
  "Argentina",
  "Australia",
  "Brazil",
  "Canada",
  "China",
  "Egypt",
  "France",
  "Germany",
  "India",
  "Japan",
  "Kazakhstan",
  "Mexico",
  "Nigeria",
  "Russian Federation",
  "Saudi Arabia",
  "South Africa",
  "Switzerland",
  "Turkey",
  "United Kingdom",
  "United States"
];

export const PRESET_TOPICS = [
  "Регулирование милитаризации ИИ и летального автономного оружия",
  "Правовой статус и стратегии интеграции климатических беженцев",
  "Защита критической морской инфраструктуры от трансграничного саботажа",
  "Предотвращение деградации почв в засушливых регионах Африки и Азии",
  "Снижение долговременных глобальных рисков космического мусора на орбите",
  "Обеспечение равного гуманитарного доступа к вакцинам в периоды пандемий"
];
