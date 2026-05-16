import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Book } from "../types";
import { 
  BookOpen, 
  Download, 
  Share2, 
  Star, 
  ArrowLeft, 
  Clock, 
  Globe, 
  Tag as TagIcon,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const bookDoc = await getDoc(doc(db, "books", id));
      if (bookDoc.exists()) {
        const bookData = { id: bookDoc.id, ...bookDoc.data() } as Book;
        setBook(bookData);
        fetchRecommended(bookData.category);
        
        // Check if favorited
        if (auth.currentUser) {
          const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setIsFavorited(userData.favorites?.includes(id) || false);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async (category: string) => {
    try {
      const q = query(
        collection(db, "books"), 
        where("category", "==", category), 
        limit(4)
      );
      const snap = await getDocs(q);
      setRecommendedBooks(snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Book))
        .filter(b => b.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async () => {
    if (!auth.currentUser) {
      toast.error("Please login to save favorites");
      return;
    }
    if (!id) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      if (isFavorited) {
        await updateDoc(userRef, { favorites: arrayRemove(id) });
        setIsFavorited(false);
        toast.success("Removed from favorites");
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(id) });
        setIsFavorited(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5A5A40] border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Book not found</h2>
        <Link to="/books" className="text-[#5A5A40] font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFCF8] min-h-screen pt-12 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-12">
        <Link to="/books" className="inline-flex items-center gap-3 text-stone-400 hover:text-[#2D5A27] mb-12 font-bold uppercase text-[10px] tracking-[0.2em] transition-all">
          <ArrowLeft size={16} /> Back to Library
        </Link>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-stone-200/40 overflow-hidden border border-stone-100 mb-24">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Book Cover */}
            <div className="lg:w-[45%] p-10 lg:p-16 bg-[#FDFCF8] flex items-center justify-center border-r border-stone-100 relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 100 100" className="text-[#2D5A27]">
                  <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor"/>
                </svg>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group w-full"
              >
                <div className="shadow-2xl rounded-2xl overflow-hidden aspect-[3/4] max-w-[400px] mx-auto border-b-8 border-[#2D5A27]">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-[#2D5A27] to-[#1A2E16]">
                      <BookOpen size={80} className="text-white/20 mb-8" />
                      <h1 className="text-2xl font-serif font-bold text-white leading-tight uppercase tracking-tight">{book.title}</h1>
                      <div className="w-12 h-0.5 bg-white/20 my-6 rounded"></div>
                      <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">{book.author}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right: Book Details */}
            <div className="flex-1 p-10 lg:p-20 flex flex-col justify-center">
              <div className="space-y-8">
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-[#E9F1E8] text-[#2D5A27] text-[10px] font-bold uppercase tracking-widest border border-[#2D5A27]/20">
                    {book.category}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-stone-100">
                    <Globe size={14} /> {book.language}
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-serif font-bold text-[#1A2E16] leading-[1.1] tracking-tight">
                  {book.title}
                </h1>
                <p className="text-xl text-stone-400 font-medium italic">by {book.author}</p>

                <div className="flex items-center gap-10 py-6 border-y border-stone-50">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-stone-300 font-bold uppercase tracking-[0.2em] mb-2">Authenticity</span>
                      <span className="flex items-center gap-2 text-sm font-bold text-[#2D5A27]">
                         <CheckCircle2 size={18} /> Verified Source
                      </span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-stone-300 font-bold uppercase tracking-[0.2em] mb-2">Publication</span>
                      <span className="flex items-center gap-2 text-sm font-bold text-stone-600">
                         <Clock size={18} className="text-stone-300" /> {new Date(book.updatedAt).toLocaleDateString()}
                      </span>
                   </div>
                </div>

                <p className="text-stone-500 leading-relaxed text-lg max-w-xl">
                  {book.description || "In the silence of the page, find the echoes of the soul. No description has been provided for this profound work."}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                  <Link
                    to={`/reader/${book.id}`}
                    className="w-full sm:w-auto px-12 py-5 bg-[#2D5A27] text-white rounded-full font-bold hover:bg-[#1A2E16] shadow-xl shadow-[#2D5A27]/30 transition-all active:scale-95 flex items-center justify-center gap-4 text-lg"
                  >
                    <BookOpen size={24} /> Read Now
                  </Link>
                  <div className="flex items-center gap-4 w-full sm:w-auto px-1">
                    <button
                      onClick={toggleFavorite}
                      className={`p-4 rounded-full border transition-all active:scale-90 flex items-center gap-2 font-bold ${
                        isFavorited 
                        ? "bg-[#E9F1E8] border-[#2D5A27]/20 text-[#2D5A27]" 
                        : "bg-white border-stone-100 text-stone-300 hover:text-[#2D5A27] hover:border-[#2D5A27]"
                      }`}
                      title={isFavorited ? "Saved to Library" : "Save to Library"}
                    >
                      {isFavorited ? <Bookmark size={24} className="fill-current" /> : <Bookmark size={24} />}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-4 rounded-full bg-white border border-stone-100 text-stone-300 hover:text-[#2D5A27] hover:border-[#2D5A27] transition-all active:scale-90"
                      title="Share Link"
                    >
                      <Share2 size={24} />
                    </button>
                    <a
                      href={book.pdfUrl}
                      download
                      className="p-4 rounded-full bg-white border border-stone-100 text-stone-300 hover:text-[#2D5A27] hover:border-[#2D5A27] transition-all active:scale-90"
                      title="Download PDF"
                    >
                      <Download size={24} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Books */}
        {recommendedBooks.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-serif font-bold text-[#1A2E16]">Continue the Journey</h2>
               <Link to={`/books/${book.category}`} className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-[0.2em] border-b border-[#2D5A27]/20 hover:border-[#2D5A27] transition-all">
                  View Full Collection
               </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {recommendedBooks.map(b => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        )}
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
        </div>
        <div className="px-1">
          <h3 className="text-sm font-bold text-[#1A2E16] mb-0.5 line-clamp-1">{book.title}</h3>
          <p className="text-[11px] text-stone-400 uppercase tracking-widest font-bold">{book.author}</p>
        </div>
      </Link>
    </motion.div>
  );
}
