import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Book } from "../types";
import { motion } from "motion/react";
import { BookOpen, ArrowRight, Search, Star, TrendingUp, Filter } from "lucide-react";

const CATEGORIES = [
  { name: "Quran", slug: "quran", icon: "📖", color: "bg-emerald-50" },
  { name: "Hadith", slug: "hadith", icon: "📜", color: "bg-amber-50" },
  { name: "Tafsir", slug: "tafsir", icon: "💎", color: "bg-blue-50" },
  { name: "Fiqh", slug: "fiqh", icon: "⚖️", color: "bg-purple-50" },
  { name: "History", slug: "history", icon: "🏛️", color: "bg-orange-50" },
  { name: "Dua", slug: "dua", icon: "🤲", color: "bg-rose-50" },
];

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksRef = collection(db, "books");
        
        // Featured
        const featuredQuery = query(booksRef, where("featured", "==", true), limit(4));
        const featuredSnap = await getDocs(featuredQuery);
        setFeaturedBooks(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));

        // Trending
        const trendingQuery = query(booksRef, where("trending", "==", true), limit(4));
        const trendingSnap = await getDocs(trendingQuery);
        setTrendingBooks(trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40 bg-[#FDFCF8]">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 100 100" className="text-[#2D5A27]">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif text-[#1A2E16] mb-8 leading-tight tracking-tight">
              Illuminating the Path <br /> Through <span className="text-[#2D5A27] italic">Knowledge</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-stone-500 mb-12 leading-relaxed">
              Access thousands of authentic Islamic books, manuscripts, and translations 
              in one digital sanctuary.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="relative w-full sm:w-[500px]">
                <div className="absolute inset-y-0 left-6 flex items-center">
                  <Search className="w-5 h-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for Quran, Hadith, Fiqh, or Authors..."
                  className="w-full pl-14 pr-36 py-5 rounded-3xl border-none bg-white shadow-xl shadow-stone-200/50 text-lg focus:ring-2 focus:ring-[#2D5A27]/10 outline-none placeholder:text-stone-300"
                  onFocus={() => navigate("/books")}
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                  <button 
                    onClick={() => navigate("/books")}
                    className="h-full px-8 bg-[#2D5A27] text-white rounded-2xl font-bold hover:bg-[#1A2E16] transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-3xl text-center border border-stone-100 hover:bg-[#2D5A27] hover:text-white transition-all cursor-pointer group shadow-sm hover:shadow-xl"
            >
              <Link to={`/books/${cat.slug}`} className="w-full h-full block">
                <span className="block text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-bold uppercase tracking-widest block">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      <section className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-serif font-bold text-[#1A2E16]">Featured Collections</h2>
          <Link to="/books" className="text-sm font-bold text-[#2D5A27] uppercase tracking-widest border-b-2 border-[#2D5A27]/20 hover:border-[#2D5A27] transition-all">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-stone-100 rounded-2xl"></div>
                <div className="h-4 bg-stone-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {featuredBooks.concat(trendingBooks).slice(0, 5).map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Banner / CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-12">
        <div className="bg-[#E9F1E8] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative border border-[#2D5A27]/10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/20 -skew-x-12 translate-x-1/4"></div>
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A2E16] mb-6 leading-[1.1]">
              A Sanctuary for the <br /> <span className="italic text-[#2D5A27]">Seeking Heart</span>
            </h2>
            <p className="text-stone-600 text-lg mb-10 leading-relaxed">
              Join thousands of students and scholars worldwide who use Noor Library 
              to deepen their understanding of Islamic traditions.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                to="/login"
                className="bg-[#2D5A27] text-white px-10 py-4 rounded-full font-bold hover:bg-[#1A2E16] transition-all shadow-lg shadow-[#2D5A27]/20"
              >
                Create Account
              </Link>
              <Link
                to="/books"
                className="bg-white text-[#2D5A27] border border-stone-200 px-10 py-4 rounded-full font-bold hover:bg-stone-50 transition-all"
              >
                Explore Library
              </Link>
            </div>
          </div>
          <div className="relative z-10 hidden lg:block opacity-40">
             <BookOpen size={200} className="text-[#2D5A27]" strokeWidth={1} />
          </div>
        </div>
      </section>
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
        <div className="aspect-[3/4] bg-stone-100 rounded-2xl mb-4 shadow-md border-b-4 border-[#2D5A27] flex flex-col justify-end overflow-hidden relative group-hover:shadow-2xl transition-all duration-300">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D5A27] to-[#1A2E16] flex items-center justify-center p-6 text-center">
              <BookOpen size={40} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors"></div>
          <div className="relative z-10 bg-white/95 backdrop-blur-sm p-3 m-3 rounded-xl border border-white/50 shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform">
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">{book.category}</p>
            <p className="text-xs font-bold text-[#1A2E16] line-clamp-1">{book.title}</p>
          </div>
        </div>
        <div className="px-1">
          <h3 className="text-sm font-bold text-[#1A2E16] mb-0.5 line-clamp-1">{book.title}</h3>
          <p className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">{book.author}</p>
        </div>
      </Link>
    </motion.div>
  );
}
