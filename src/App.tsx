/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Toaster } from "react-hot-toast";

// Pages
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user to firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            favorites: [],
            createdAt: new Date().toISOString(),
          });
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F5F0]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5A5A40] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col font-sans selection:bg-[#5A5A40] selection:text-white">
        <Toaster position="top-right" />
        <Navbar user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:category" element={<Books />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/reader/:id" element={<Reader />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin/*" 
              element={user?.email === 'nadimalam1203@gmail.com' ? <AdminDashboard /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

