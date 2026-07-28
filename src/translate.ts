export const translateToEn = (text: string | null | undefined): string => {
  if (!text) return "";
  
  const dict: Record<string, string> = {
    "Бишкек": "Bishkek",
    "ОшТУ": "OshTU",
    "КРСУ": "KRSU",
    "АУца": "AUCA",
    "АУЦА": "AUCA",
    "Манас": "Manas",
    "Ош": "Osh",
    "Чолпон-Ата": "Cholpon-Ata",
    "Тест": "Test",
    "тест": "test",
    "тестовая": "test",
    "Тестовая": "Test",
    "Тестовое": "Test",
    "тестовое": "test",
    "тестовый": "test",
    "Тестовый": "Test",
    "новая": "new",
    "Новая": "New",
    "новый": "new",
    "Новый": "New",
    "новое": "new",
    "Новое": "New",
    "симуляция": "simulation",
    "Симуляция": "Simulation",
    "КНУ": "KNU",
    "ОшГУ": "OshSU",
    "Клуб": "Club",
    "клуб": "club",
    "Бесплатно": "Free",
    "Бесплатная": "Free",
    "Международная": "International",
    "Региональная": "Regional",
    "Национальная": "National",
    "Кыргызстан": "Kyrgyzstan",
    "Школа": "School",
    "ВУЗ": "University",
    "Университет": "University",
    "Универ": "University",
    "Комитет": "Committee",
    "Генеральная Ассамблея ООН": "UN General Assembly",
    "Генеральная Ассамблея": "General Assembly",
    "Совет Безопасности ООН": "UN Security Council",
    "Совет Безопасности": "Security Council",
    "Клуб молодых дипломатов": "Young Diplomats Club",
    "Организатор": "Organizer",
    "Новая Конференция": "New Conference",
    "Описание отсутсвует": "No description available",
    "Описание отсутствует": "No description available",
    "Модель ООН": "Model UN",
    "Секретариат": "Secretariat",
    "Делегат": "Delegate",
    "Дипломатический Клуб": "Diplomatic Club",
    "Комитет по правам человека": "Human Rights Committee",
    "ЭКОСОС": "ECOSOC",
    "Всемирная Организация Здравоохранения": "World Health Organization",
    "ЮНЕСКО": "UNESCO",
    "ЮНИСЕФ": "UNICEF",
    "МАГАТЭ": "IAEA",
    "Конференция": "Conference",
    "конференция": "conference",
    "АМООНКР": "MUNKG",
    "Секретариат АМООНКР": "MUNKG Secretariat",
    "Опишите": "Describe",
    "Описание": "Description"
  };

  // Check exact matches
  if (dict[text]) return dict[text];

  let translated = String(text);
  
  // Replace case insensitive occurrences
  Object.keys(dict).forEach(key => {
    const regex = new RegExp(key, "gi");
    translated = translated.replace(regex, dict[key]);
  });

  // If it still contains Cyrillic, transliterate it roughly
  const cyrillicPattern = /[А-Яа-яЁё]/;
  if (!cyrillicPattern.test(translated)) {
    return translated; 
  }

  // Fallback transliteration
  const ru = 'А-а-Б-б-В-в-Г-г-Д-д-Е-е-Ё-ё-Ж-ж-З-з-И-и-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я'.split('-');
  const en = 'A-a-B-b-V-v-G-g-D-d-E-e-E-e-Zh-zh-Z-z-I-i-Y-y-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-Kh-kh-Ts-ts-Ch-ch-Sh-sh-Sch-sch---Y-y---E-e-Yu-yu-Ya-ya'.split('-');
  let res = '';
  for(let i=0, l=translated.length; i<l; i++) {
    let s = translated.charAt(i), n = ru.indexOf(s);
    if(n >= 0) { res += en[n]; }
    else { res += s; }
  }
  return res;
};
