import { Link, useNavigate } from "react-router-dom";
import { User, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { BookOpen, Search, LogIn, LogOut, User as UserIcon, Shield } from "lucide-react";
import { motion } from "motion/react";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="bg-[#2D5A27] w-10 h-10 rounded-lg flex items-center justify-center text-white"
              >
                <BookOpen size={24} />
              </motion.div>
              <span className="text-xl font-serif font-bold tracking-tight text-[#2D5A27] uppercase">Noor Library</span>
            </Link>
          </div>

          <div className="hidden lg:block flex-1 max-w-lg mx-12">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for Quran, Hadith, or Authors..."
                className="w-full bg-stone-100/50 border-none rounded-2xl py-3 px-12 focus:ring-1 focus:ring-[#2D5A27]/20 transition-all outline-none text-sm placeholder:text-stone-400"
                onClick={() => navigate("/books")}
              />
              <Search className="absolute left-4 top-3 text-stone-400" size={18} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/books" className="hidden sm:block text-sm font-medium uppercase tracking-widest text-stone-500 hover:text-[#2D5A27] transition-colors">
              Library
            </Link>
            
            {user?.email === 'nadimalam1203@gmail.com' && (
              <Link to="/admin" className="text-stone-500 hover:text-[#2D5A27] transition-colors p-2 rounded-full hover:bg-stone-50">
                <Shield size={20} />
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="text-stone-400" />
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-stone-500 hover:text-[#2D5A27] transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full bg-[#2D5A27] text-white text-sm font-medium shadow-md hover:bg-[#1A2E16] transition-all active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
