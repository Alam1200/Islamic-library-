import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Book } from "../types";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { ArrowLeft, BookOpen, Clock, Settings, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "motion/react";

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    if (!id) return;
    try {
      const bookDoc = await getDoc(doc(db, "books", id));
      if (bookDoc.exists()) {
        setBook({ id: bookDoc.id, ...bookDoc.data() } as Book);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Opening Library...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4">
        <p className="text-white mb-4">Book not found or failed to load.</p>
        <button onClick={() => navigate(-1)} className="text-white underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#1A1A1A] flex flex-col overflow-hidden">
      {/* Reader Header */}
      <div className="bg-white border-b border-stone-100 px-6 h-20 flex items-center justify-between shrink-0 z-50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/book/${id}`)}
            className="p-3 hover:bg-stone-50 rounded-full transition-all text-stone-400 hover:text-[#2D5A27]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
             <div className="bg-[#2D5A27] w-10 h-10 rounded-lg flex items-center justify-center text-white hidden sm:flex shadow-lg shadow-[#2D5A27]/20">
                <BookOpen size={20} />
             </div>
             <div>
                <h1 className="text-lg font-serif font-bold text-[#1A2E16] line-clamp-1">{book.title}</h1>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">{book.author}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button className="hidden sm:flex items-center gap-3 px-6 py-3 bg-[#E9F1E8] text-[#2D5A27] rounded-xl text-[10px] font-bold uppercase tracking-widest border border-[#2D5A27]/10 transition-all">
              <Clock size={16} /> Progress Saved
           </button>
           <button className="p-3 hover:bg-stone-50 rounded-full text-stone-400 hover:text-[#2D5A27] transition-all">
              <Settings size={22} />
           </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 overflow-auto bg-stone-900 flex justify-center">
        <div className="h-full w-full max-w-6xl shadow-2xl">
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <Viewer 
              fileUrl={book.pdfUrl} 
              plugins={[defaultLayoutPluginInstance]}
              theme="dark"
            />
          </Worker>
        </div>
      </div>

      {/* Floating Mode Indicator */}
      <div className="absolute bottom-8 right-8 z-50 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-stone-100 flex items-center gap-3">
           <div className="w-2 h-2 bg-[#2D5A27] rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sanctuary Reading Mode</span>
        </div>
      </div>
    </div>
  );
}
