import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, LogIn, Mail, Lock, Languages, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome to Noor Library!");
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#FDFCF8] p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 100 100" className="text-[#2D5A27]">
          <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor"/>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDFCF8] text-[#2D5A27] rounded-3xl mb-8 border border-stone-100 shadow-inner">
             <BookOpen size={30} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A2E16] mb-3 uppercase tracking-tight">Welcome Back</h1>
          <p className="text-stone-400 font-medium tracking-tight">Continue your journey of discovery</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-white border border-stone-100 py-4 px-6 rounded-2xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-stone-300">
               <span className="bg-white px-4">OR USE EMAIL</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full pl-14 pr-5 py-4 bg-[#FDFCF8] border-none rounded-2xl focus:ring-2 focus:ring-[#2D5A27]/20 outline-none text-[#1A2E16] placeholder:text-stone-200"
                  placeholder="seeker@knowledge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-5 top-4.5 text-stone-300" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full pl-14 pr-5 py-4 bg-[#FDFCF8] border-none rounded-2xl focus:ring-2 focus:ring-[#2D5A27]/20 outline-none text-[#1A2E16] placeholder:text-stone-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-5 top-4.5 text-stone-300" size={18} />
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-stone-200 text-[#2D5A27] focus:ring-[#2D5A27]" />
                  <span className="text-xs text-stone-400 font-medium group-hover:text-stone-600">Remember me</span>
               </label>
               <button type="button" className="text-xs font-bold text-[#2D5A27] hover:underline">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D5A27] text-white py-5 px-6 rounded-2xl font-bold hover:bg-[#1A2E16] shadow-xl shadow-[#2D5A27]/20 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
            >
              {loading ? "Processing..." : "Access Library"}
              <LogIn size={20} />
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 font-medium pt-8">
            New to the sanctuary?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-[#2D5A27] font-bold hover:underline"
            >
              Explore Books
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
