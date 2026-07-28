import { useState } from "react";
import { NewsPost } from "../types";
import { Search, ChevronRight, Clock, User, Filter, Share2, CornerDownRight, PlusCircle, Check, Trash2, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

export const categoryTranslationsRu: Record<string, string> = {
  "All": "Все категории",
  "Security": "Совет Безопасности (UNSC)",
  "Human Rights": "Права человека (UNHRC)",
  "Environment": "Окружающая среда (UNEP)",
  "MUN News": "Новости Ассоциации (MUN News)",
  "Delegate Guide": "Руководство делегата (Delegate Guide)"
};

export const categoryTranslationsEn: Record<string, string> = {
  "All": "All Categories",
  "Security": "Security Council (UNSC)",
  "Human Rights": "Human Rights Council (UNHRC)",
  "Environment": "Environment Programme (UNEP)",
  "MUN News": "Association News (MUN News)",
  "Delegate Guide": "Delegate Guide"
};

interface NewsSectionProps {
  onSuggestTopic?: (topic: string) => void;
  posts: NewsPost[];
  setPosts: React.Dispatch<React.SetStateAction<NewsPost[]>>;
  currentUser: any;
  lang?: "ru" | "en";
}

export default function NewsSection({ onSuggestTopic, posts, setPosts, currentUser, lang = "ru" }: NewsSectionProps) {
  const trans = lang === "en" ? categoryTranslationsEn : categoryTranslationsRu;
  const isEn = lang === "en";

  const [activePostId, setActivePostId] = useState<string>(posts.length > 0 ? posts[0].id : "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("MUN News");

  const selectedPost = posts.find(p => p.id === activePostId) || (posts.length > 0 ? posts[0] : null);

  // Confirmation state to bypass standard iframe window.confirm blocks
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Create Custom Post Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newExcerptEn, setNewExcerptEn] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newContentEn, setNewContentEn] = useState("");
  const [newCategory, setNewCategory] = useState<NewsPost["category"]>("Security");
  const [newAuthor, setNewAuthor] = useState("");
  const [newAuthorEn, setNewAuthorEn] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const [showNewsEnFields, setShowNewsEnFields] = useState(false);

  const categories = ["All", "MUN News", "Security", "Human Rights", "Environment", "Delegate Guide"];

  const filteredPosts = posts.filter((post) => {
    const postTitle = (isEn && post.titleEn) ? post.titleEn : (post.title || "");
    const postExcerpt = (isEn && post.excerptEn) ? post.excerptEn : (post.excerpt || "");
    const postContent = (isEn && post.contentEn) ? post.contentEn : (post.content || "");
    const matchesSearch =
      postTitle.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
      postExcerpt.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
      postContent.toLowerCase().includes(searchQuery?.toLowerCase() || "");
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !newAuthor) return;

    const newPost: NewsPost = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      titleEn: newTitleEn || undefined,
      excerpt: newExcerpt || newContent.substring(0, 150) + "...",
      excerptEn: newExcerptEn || (newContentEn ? newContentEn.substring(0, 150) + "..." : undefined),
      content: newContent,
      contentEn: newContentEn || undefined,
      category: newCategory,
      author: `${newAuthor}, Ассоциированный аналитик`,
      authorEn: newAuthorEn ? `${newAuthorEn}, Associate Analyst` : undefined,
      date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
      readTime: `${Math.max(3, Math.ceil((newContent || "").split(/\s+/).length / 150))} мин`,
      featuredImg: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
      tags: [newCategory]
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem("mun_posts", JSON.stringify(updated));
    setActivePostId(newPost.id);
    setNewTitle("");
    setNewTitleEn("");
    setNewExcerpt("");
    setNewExcerptEn("");
    setNewContent("");
    setNewContentEn("");
    setNewAuthor("");
    setNewAuthorEn("");
    setIsCreating(false);
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 4000);
  };

  const handleDeletePostDirect = (id: string) => {
    setConfirmDialog({
      title: isEn ? "Delete Article" : "Удалить статью",
      message: isEn ? "Are you sure you want to permanently delete this analytical publication?" : "Вы действительно хотите безвозвратно удалить эту аналитическую публикацию?",
      onConfirm: () => {
        const updated = posts.filter((p) => p.id !== id);
        setPosts(updated);
        localStorage.setItem("mun_posts", JSON.stringify(updated));
        if (activePostId === id && updated.length > 0) {
          setActivePostId(updated[0].id);
        }
      }
    });
  };

  return (
    <div className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#1a365d] dark:text-[#80add0] uppercase">
              MUNKG Diplomatic Intelligence Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
              {isEn ? "International Reviews & Analytics" : "Международные Обзоры & Аналитика"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-serif italic">
              {isEn ? "\"Reason, diplomacy, consensus\". Expert materials, analytical reports, and practical recommendations for Model UN preparation." : "«Разум, дипломатия, консенсус». Экспертные материалы, аналитические отчеты и практические рекомендации для подготовки к Моделированию ООН."}
            </p>
          </div>
          
          {currentUser?.role === "admin" && (
            <button 
              id="btn-sub-dispatch"
              onClick={() => setIsCreating(!isCreating)}
              className="bg-slate-900 text-white font-bold text-xs tracking-wider py-2.5 px-4 rounded-md shadow-sm uppercase inline-flex items-center gap-1.5 hover:bg-slate-800 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isCreating ? (isEn ? "Back to blog" : "Вернуться к блогу") : (isEn ? "Add article" : "Добавить статью")}</span>
            </button>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded-r-md text-xs font-bold uppercase tracking-wide flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{isEn ? "Article successfully published to the MUNKG Alliance Feed!" : "Статья успешно опубликована в Ленте Альянса MUNKG!"}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
        {isCreating ? (
          /* Create Post Form */
          <motion.div 
            key="create-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 dark:border-slate-800 dark:border-slate-700 rounded-xl shadow-xs p-6 max-w-3xl mx-auto"
          >
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">
              {isEn ? "New Tribune: Publish Analytical Brief" : "Новая трибуна: Опубликовать аналитическую справку"}
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{isEn ? "Article Title *" : "Заголовок статьи *"}</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={isEn ? "Example: AI Expansion in Space Diplomacy" : "Например: Экспансия ИИ в космической дипломатии"}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-md p-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{isEn ? "Author Name & Status *" : "ФИО и Статус Автора *"}</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={isEn ? "Igor Sobolev, UK Delegate" : "Игорь Соболев, Делегат Великобритании"}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-md p-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{isEn ? "Thematic Category" : "Тематическая Категория"}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as NewsPost["category"])}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-md p-2.5 focus:border-blue-500 focus:outline-hidden bg-white dark:bg-slate-900"
                  >
                    <option value="Security">{isEn ? "Security Council" : "Совет Безопасности"}</option>
                    <option value="Human Rights">{isEn ? "Human Rights" : "Гуманитарная сфера"}</option>
                    <option value="Environment">{isEn ? "Environment" : "Окружающая среда"}</option>
                    <option value="MUN News">{isEn ? "MUN News" : "Новости Ассоциации"}</option>
                    <option value="Delegate Guide">{isEn ? "Delegate Guide" : "Пособия и Тактика"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{isEn ? "Short Excerpt" : "Краткий анонс (эксперт)"}</label>
                  <input
                    type="text"
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    placeholder={isEn ? "Short one-sentence summary" : "Краткое содержание статьи в одно предложение"}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-md p-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{isEn ? "Article Content *" : "Текст публикации (поддерживает переносы) *"}</label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={isEn ? "Introduction to the problem..." : "Введение в проблему... писать можно развернуто"}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-md p-2.5 focus:border-blue-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewsEnFields(!showNewsEnFields)}
                  className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded border transition ${showNewsEnFields ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {showNewsEnFields ? "− Скрыть английскую версию" : "+ Добавить английскую версию (опционально)"}
                </button>
              </div>

              <AnimatePresence>
                {showNewsEnFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 py-2"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border rounded-xl space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-[#1a365d]"></div>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Английская версия (English Version)</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Title (EN)</label>
                        <input
                          type="text"
                          value={newTitleEn}
                          onChange={(e) => setNewTitleEn(e.target.value)}
                          placeholder="Title in English"
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Short Excerpt (EN)</label>
                        <input
                          type="text"
                          value={newExcerptEn}
                          onChange={(e) => setNewExcerptEn(e.target.value)}
                          placeholder="Short excerpt in English"
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Author (EN)</label>
                        <input
                          type="text"
                          value={newAuthorEn}
                          onChange={(e) => setNewAuthorEn(e.target.value)}
                          placeholder="Author name in English"
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Article Content (EN)</label>
                        <textarea
                          rows={6}
                          value={newContentEn}
                          onChange={(e) => setNewContentEn(e.target.value)}
                          placeholder="News content in English..."
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        ></textarea>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-bold uppercase py-2 px-4 rounded-md border border-slate-200 dark:border-slate-800 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950 text-slate-600 transition"
                >
                  {isEn ? "Cancel" : "Отмена"}
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold uppercase py-2 px-5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  {isEn ? "Publish" : "Опубликовать"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Main Layout: Left-Side List, Right-Side Main Article Reader (Professional Newspaper Layout) */
          <motion.div 
            key="reader-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Left Drawer columns: News feed & Filters */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Filter Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#1a365d] dark:text-[#80add0]" />
                    {isEn ? "Filter & Search" : "Фильтр и Поиск"}
                  </h3>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a365d] transition-colors">
                    <Search className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type="text"
                    placeholder={isEn ? "Search in archive..." : "Поиск по архиву..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-1 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] transition-all outline-hidden"
                  />
                </div>

                {/* Categories Cloud */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    {isEn ? "Categories" : "Категории"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedCategory === cat
                            ? "bg-[#1a365d] text-white shadow-md shadow-[#1a365d]/20 dark:bg-[#c0a080] dark:text-slate-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {trans[cat] || cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feed List */}
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 border-b pb-1 font-bold">
                  {isEn ? `Analytical Dispatches (${filteredPosts.length})` : `Аналитические Диспетчеры (${filteredPosts.length})`}
                </p>
                
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-800 dark:border-slate-800 rounded-lg">
                    <p className="text-slate-500 text-xs">{isEn ? "No articles found matching filters." : "Статьи не найдены по заданным фильтрам."}</p>
                  </div>
                ) : (
                  <AnimatePresence>
                  {filteredPosts.map((post, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      key={post.id}
                      onClick={() => setActivePostId(post.id)}
                      className={`cursor-pointer border text-left p-4 rounded transition-all ${
                        selectedPost?.id === post.id
                          ? "bg-white dark:bg-slate-900 dark:bg-slate-800 border-[#1a365d] dark:border-[#528eb8] ring-1 ring-slate-100 dark:ring-slate-700 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:border-slate-800 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono uppercase bg-[#c0a080]/10 dark:bg-[#c0a080]/20 text-[#1a365d] dark:text-[#c0a080] border border-[#c0a080]/20 px-2.0 py-0.5 rounded font-bold">
                          {trans[post.category] || post.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{post.date}</span>
                      </div>
                      <h3 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-[13px] leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {(isEn && post.titleEn) ? post.titleEn : post.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {(isEn && post.excerptEn) ? post.excerptEn : post.excerpt}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="max-w-[150px] truncate">{(isEn && post.authorEn ? post.authorEn : (post.author || "")).split(",")[0]}</span>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Right main column: Active Editorial Reader */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
              {selectedPost ? (
                <motion.article 
                  key={selectedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-800 dark:border-slate-700 rounded-xl shadow-xs overflow-hidden"
                >
                  {/* Decorative Banner */}
                  <div className="h-48 sm:h-64 relative bg-slate-900">
                    <img
                      src={selectedPost.featuredImg}
                      alt={(isEn && selectedPost.titleEn) ? selectedPost.titleEn : selectedPost.title}
                      className="w-full h-full object-cover opacity-70"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <span className="text-xs font-mono font-bold tracking-widest bg-[#c0a080] text-slate-950 px-2.5 py-1 rounded-sm uppercase">
                        {trans[selectedPost.category] || selectedPost.category}
                      </span>
                      <p className="text-[11px] font-mono text-slate-300 mt-2.5">
                        {isEn ? "Published by MUNKG Information Department on" : "Опубликовано Информационным Департаментом MUNKG в"} {selectedPost.date}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    {/* Editorial Title */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight flex-1">
                        {(isEn && selectedPost.titleEn) ? selectedPost.titleEn : selectedPost.title}
                      </h2>
                      {currentUser?.role === "admin" && (
                        <button
                          onClick={() => handleDeletePostDirect(selectedPost.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-red-100 shrink-0"
                          title={isEn ? "Delete Article" : "Удалить статью"}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{isEn ? "Delete" : "Удалить"}</span>
                        </button>
                      )}
                    </div>

                    {/* Meta Section */}
                    <div className="flex flex-wrap items-center gap-4 border-y border-slate-100 dark:border-slate-800 py-3 my-5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#1a365d] dark:text-[#80add0]" />
                        <span className="font-semibold">{isEn && selectedPost.authorEn ? selectedPost.authorEn : selectedPost.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{isEn ? "Reading time:" : "Время чтения:"} {selectedPost.readTime}</span>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed max-w-none font-serif">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-slate-100 mt-6 mb-3 text-left">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-serif font-extrabold text-slate-900 dark:text-slate-100 mt-6 mb-3 text-left">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2.5 text-left">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-base font-serif font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 text-left">{children}</h4>,
                          p: ({ children }) => <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base mb-4 text-justify">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-slate-950 dark:text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300 text-left">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300 text-left">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-0.5">{children}</li>,
                          hr: () => <hr className="my-6 border-slate-200 dark:border-slate-800 dark:border-slate-800 dark:border-slate-800" />,
                        }}
                      >
                        {(isEn && selectedPost.contentEn) ? selectedPost.contentEn : selectedPost.content}
                      </ReactMarkdown>
                    </div>

                    {/* Shared Tags & Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2.5 py-1 rounded-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.article>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-800 rounded-xl"
                >
                  <p className="text-slate-500 font-serif">{isEn ? "Select any review from the left menu for a deep dive." : "Выберите любой обзоры из левого меню для глубокого ознакомления."}</p>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}
        </AnimatePresence>

      </div>

      <AnimatePresence>
      {/* Custom premium design confirmation modal to bypass standard iframe window.confirm blocks */}
      {confirmDialog && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-left"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="bg-red-50 text-red-600 p-2 rounded-full border border-red-100 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-black text-sm text-slate-900 uppercase tracking-wider">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-500 font-serif leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded border transition"
              >
                {isEn ? "Cancel" : "Отмена"}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition"
              >
                {isEn ? "Confirm" : "Подтвердить"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
