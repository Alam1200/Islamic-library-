import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Book } from "../types";
import { Search, Filter, BookOpen, Star, TrendingUp, Grid, List as ListIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES = [
  { name: "All", slug: "all", icon: "📚" },
  { name: "Quran", slug: "quran", icon: "📖" },
  { name: "Hadith", slug: "hadith", icon: "📜" },
  { name: "Tafsir", slug: "tafsir", icon: "💎" },
  { name: "Fiqh", slug: "fiqh", icon: "⚖️" },
  { name: "History", slug: "history", icon: "🏛️" },
  { name: "Dua", slug: "dua", icon: "🤲" },
];

export default function Books() {
  const { category: catParam } = useParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState(catParam || "all");
  const [currentLanguage, setCurrentLanguage] = useState("all");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, currentCategory, currentLanguage, books]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "books"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const booksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
      setBooks(booksData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let result = [...books];

    if (currentCategory !== "all") {
      result = result.filter(b => b.category === currentCategory);
    }

    if (currentLanguage !== "all") {
      result = result.filter(b => b.language === currentLanguage);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(search) || 
        b.author.toLowerCase().includes(search) ||
        b.keywords?.some(k => k.toLowerCase().includes(search))
      );
    }

    setFilteredBooks(result);
  };

  // Gemini suggestions
  const fetchSuggestions = async (val: string) => {
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: val, 
          currentBooks: books.slice(0, 10).map(b => ({ title: b.title, author: b.author })) 
        }),
      });
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    // Debounce suggestion call
    const timer = setTimeout(() => fetchSuggestions(val), 500);
    return () => clearTimeout(timer);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-12 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-10 sticky top-24">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6 ml-1">Collections</h3>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setCurrentCategory(cat.slug)}
                    className={`w-full text-left px-5 py-3 rounded-2xl flex items-center gap-3 transition-all ${
                      currentCategory === cat.slug 
                      ? "bg-[#2D5A27] text-white shadow-lg shadow-[#2D5A27]/20 font-bold" 
                      : "text-stone-500 hover:bg-stone-100/50"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm tracking-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6 ml-1">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'en', 'ur', 'hi'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLanguage(lang)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      currentLanguage === lang 
                      ? "bg-[#1A2E16] text-white border-transparent shadow-md" 
                      : "bg-white text-stone-400 border-stone-100 hover:border-stone-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Search Top Bar */}
            <div className="relative z-20">
              <div className="relative bg-white shadow-xl shadow-stone-200/40 p-1.5 rounded-[2rem] flex items-center gap-2 group transition-all border border-stone-100">
                <div className="pl-6 text-stone-300">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  placeholder="Search for titles, authors, or topics..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full bg-transparent border-none py-4 px-3 text-[#1A2E16] text-lg placeholder:text-stone-300 focus:ring-0 outline-none font-serif"
                />
                {searchTerm && (
                  <button 
                    onClick={() => { setSearchTerm(""); setSuggestions([]); }}
                    className="p-3 text-stone-300 hover:text-stone-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
                <div className="pr-1.5">
                   <button className="bg-[#2D5A27] text-white px-8 py-3.5 rounded-[1.5rem] font-bold text-sm hover:bg-[#1A2E16] transition-all">Search</button>
                </div>
              </div>
              
              {/* Auto-suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden"
                  >
                    <div className="p-3">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => { setSearchTerm(s); setShowSuggestions(false); }}
                          className="w-full text-left px-6 py-4 hover:bg-[#E9F1E8] hover:text-[#2D5A27] rounded-2xl text-sm font-medium text-stone-600 flex items-center gap-4 transition-all"
                        >
                          <Search size={16} className="opacity-30" />
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-xl font-serif font-bold text-[#1A2E16]">
                  {currentCategory === 'all' ? 'All Collections' : CATEGORIES.find(c => c.slug === currentCategory)?.name}
                  <span className="ml-3 text-stone-300 text-sm font-sans font-medium uppercase tracking-widest">{filteredBooks.length} Books</span>
                </h2>
                <div className="flex items-center gap-3">
                   <button className="p-2 text-[#2D5A27] bg-[#E9F1E8] rounded-xl"><Grid size={18} /></button>
                   <button className="p-2 text-stone-300 hover:bg-stone-100 rounded-xl transition-colors"><ListIcon size={18} /></button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="animate-pulse space-y-4">
                      <div className="aspect-[3/4] bg-stone-100 rounded-2xl"></div>
                      <div className="h-4 bg-stone-100 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                  {filteredBooks.map(book => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white rounded-[4rem] shadow-sm border border-stone-50">
                   <div className="bg-[#FDFCF8] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-stone-100 shadow-inner">
                      <Search size={36} className="text-stone-200" />
                   </div>
                   <h3 className="text-3xl font-serif font-bold text-[#1A2E16] mb-3">Silent Sanctuary</h3>
                   <p className="text-stone-400 max-w-sm mx-auto font-medium">
                     The library is quiet. Adjust your filters or search terms to find your next illuminating read.
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book }: { book: Book; key?: React.Key }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group cursor-pointer"
    >
      <Link to={`/book/${book.id}`}>
        <div className="aspect-[3/4] bg-stone-100 rounded-3xl mb-4 shadow-sm border-b-4 border-[#2D5A27] flex flex-col justify-end overflow-hidden relative group-hover:shadow-2xl group-hover:shadow-[#2D5A27]/20 transition-all duration-500">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D5A27] to-[#1A2E16] flex items-center justify-center p-6 text-center">
              <BookOpen size={40} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
             <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/50">
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">{book.category}</p>
                <p className="text-xs font-bold text-[#1A2E16] line-clamp-1">{book.title}</p>
             </div>
          </div>
        </div>
        <div className="px-1">
          <h3 className="text-sm font-bold text-[#1A2E16] mb-0.5 line-clamp-1">{book.title}</h3>
          <p className="text-[11px] text-stone-400 uppercase tracking-widest font-bold">{book.author}</p>
        </div>
      </Link>
    </motion.div>
  );
}
