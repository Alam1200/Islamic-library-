import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#FDFCF8] border-t border-stone-100 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="bg-[#2D5A27] w-10 h-10 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight text-[#2D5A27] uppercase">Noor Library</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-sm">
              A digital sanctuary dedicated to the preservation and accessibility 
              of authentic Islamic knowledge for seekers worldwide. Preserving the 
              wisdom of generations for a modern age.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Facebook', 'Instagram'].map(social => (
                <a key={social} href="#" className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center text-stone-300 hover:text-[#2D5A27] hover:border-[#2D5A27] transition-all">
                  <span className="sr-only">{social}</span>
                  <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E16] mb-8">Navigation</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-stone-400 text-sm hover:text-[#2D5A27] transition-colors">Home Landing</Link></li>
              <li><Link to="/books" className="text-stone-400 text-sm hover:text-[#2D5A27] transition-colors">Digital Library</Link></li>
              <li><Link to="/login" className="text-stone-400 text-sm hover:text-[#2D5A27] transition-colors">Access Account</Link></li>
              <li><a href="#" className="text-stone-400 text-sm hover:text-[#2D5A27] transition-colors">Manuscripts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2E16] mb-8">Languages</h4>
            <ul className="space-y-4">
               <li className="text-stone-400 text-sm flex items-center gap-3">
                  <span className="w-1 h-3 bg-[#E9F1E8] rounded-full"></span>
                  English Edition
               </li>
               <li className="text-stone-400 text-sm flex items-center gap-3">
                  <span className="w-1 h-3 bg-[#E9F1E8] rounded-full"></span>
                  Hindi / Urdu Collection
               </li>
               <li className="text-stone-400 text-sm flex items-center gap-3">
                  <span className="w-1 h-3 bg-[#E9F1E8] rounded-full"></span>
                  Arabic Originals
               </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-stone-300 text-[10px] font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Noor Library Sanctuary. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-stone-300 text-[10px] font-bold uppercase tracking-[0.2em]">
             <span>ILLUMINATED IN BANGLADESH</span>
             <span className="w-1.5 h-1.5 bg-[#2D5A27] rounded-full"></span>
             <span>GLOBAL ACCESS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
