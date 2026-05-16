import React, { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { Book, Category } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit, 
  GripVertical, 
  Upload, 
  X, 
  Check, 
  LayoutDashboard, 
  BookOpen, 
  Tag as TagIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";

const INITIAL_BOOK_FORM = {
  title: "",
  author: "",
  description: "",
  category: "quran",
  language: "en" as const,
  pdfUrl: "",
  coverImage: "",
  keywords: [] as string[],
  featured: false,
  trending: false,
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"books" | "categories">("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState<typeof INITIAL_BOOK_FORM | Book>(INITIAL_BOOK_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "books"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      setBooks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
    } catch (err) {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBooks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex) as Book[];
        
        // Update Firestore in background
        updateBooksOrder(newOrder);
        
        return newOrder;
      });
    }
  };

  const updateBooksOrder = async (updatedBooks: Book[]) => {
    const batch = writeBatch(db);
    updatedBooks.forEach((book, index) => {
      const bookRef = doc(db, "books", book.id);
      batch.update(bookRef, { order: index });
    });
    try {
      await batch.commit();
      toast.success("Order updated");
    } catch (err) {
      toast.error("Failed to save order");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...currentBook,
        updatedAt: new Date().toISOString(),
        order: isEditing ? (currentBook as Book).order : books.length,
        keywords: typeof currentBook.keywords === 'string' 
          ? (currentBook.keywords as string).split(',').map(k => k.trim()) 
          : currentBook.keywords
      };

      if (isEditing) {
        await updateDoc(doc(db, "books", (currentBook as Book).id), data);
        toast.success("Book updated!");
      } else {
        await addDoc(collection(db, "books"), {
          ...data,
          createdAt: new Date().toISOString(),
        });
        toast.success("Book added!");
      }
      setShowModal(false);
      fetchBooks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteDoc(doc(db, "books", id));
      toast.success("Book deleted");
      fetchBooks();
    } catch (err) {
      toast.error("Failed to delete book");
    }
  };

  const openEdit = (book: Book) => {
    setCurrentBook(book);
    setIsEditing(true);
    setShowModal(true);
  };

  const openAdd = () => {
    setCurrentBook(INITIAL_BOOK_FORM);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleSeed = async () => {
    if (!window.confirm("This will add sample Islamic books to your library. Continue?")) return;
    setLoading(true);
    try {
      const sampleBooks = [
        {
          title: "The Noble Quran (English)",
          author: "Sahih International",
          description: "A clear and accurate English translation of the meanings of the Noble Quran.",
          category: "quran",
          language: "en",
          pdfUrl: "https://www.clearquran.com/downloads/the-quran-english-translation.pdf",
          coverImage: "https://images.unsplash.com/photo-1584281723528-70966cc2677d?auto=format&fit=crop&q=80&w=400",
          keywords: ["quran", "translation", "islam", "english"],
          featured: true,
          trending: true,
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: "Sahih al-Bukhari",
          author: "Imam Bukhari",
          description: "One of the Kutub al-Sittah of Sunni Islam. These prophetic traditions, or hadith, were collected by the Persian Muslim scholar Muhammad al-Bukhari.",
          category: "hadith",
          language: "en",
          pdfUrl: "https://ia800204.us.archive.org/21/items/SahihBukhariFull/Sahih-Bukhari-Full.pdf",
          coverImage: "https://images.unsplash.com/photo-1596706053296-68112f45ccf5?auto=format&fit=crop&q=80&w=400",
          keywords: ["hadith", "bukhari", "sunnah"],
          featured: true,
          trending: false,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: "Tafsir Ibn Kathir (Abridged)",
          author: "Ibn Kathir",
          description: "The most popular interpretation of the Quran. This version is the abridged English translation.",
          category: "tafsir",
          language: "en",
          pdfUrl: "https://www.quranera.com/library/tafsir-ibn-kathir.pdf",
          coverImage: "https://images.unsplash.com/photo-1591147040201-9dc0c6913c33?auto=format&fit=crop&q=80&w=400",
          keywords: ["tafsir", "quran", "ibn kathir"],
          featured: false,
          trending: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      for (const book of sampleBooks) {
        await addDoc(collection(db, "books"), book);
      }
      toast.success("Sample data seeded!");
      fetchBooks();
    } catch (err) {
      toast.error("Seeding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-[#5A5A40] p-2 rounded-xl text-white">
                <LayoutDashboard size={24} />
             </div>
             <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSeed}
              className="flex items-center gap-2 bg-white text-gray-600 px-6 py-3 rounded-full font-bold hover:bg-gray-50 border border-gray-200 transition-all shadow-sm active:scale-95"
            >
              Seed Sample Data
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full font-bold hover:bg-[#4A4A35] transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} /> Add New Book
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab("books")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'books' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BookOpen size={16} /> Books
          </button>
          <button 
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <TagIcon size={16} /> Categories
          </button>
        </div>

        {activeTab === "books" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#EBEBE6]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-12 text-center">Order</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Title & Author</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Language</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <SortableContext 
                      items={books.map(b => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {books.map((book) => (
                        <SortableRow 
                          key={book.id} 
                          book={book} 
                          onEdit={openEdit} 
                          onDelete={handleDelete} 
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </DndContext>
              {books.length === 0 && !loading && (
                <div className="p-12 text-center text-gray-400 font-serif">
                   No books found. Click "Add New Book" to start.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-serif font-bold text-gray-900">
                  {isEditing ? "Edit Book" : "Add New Book"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Title</label>
                    <input
                      type="text"
                      required
                      value={currentBook.title}
                      onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })}
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Author</label>
                    <input
                      type="text"
                      required
                      value={currentBook.author}
                      onChange={(e) => setCurrentBook({ ...currentBook, author: e.target.value })}
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                    <textarea
                      value={currentBook.description}
                      onChange={(e) => setCurrentBook({ ...currentBook, description: e.target.value })}
                      rows={3}
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Category</label>
                    <select
                      value={currentBook.category}
                      onChange={(e) => setCurrentBook({ ...currentBook, category: e.target.value })}
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A5A40]"
                    >
                      <option value="quran">Quran</option>
                      <option value="hadith">Hadith</option>
                      <option value="tafsir">Tafsir</option>
                      <option value="fiqh">Fiqh</option>
                      <option value="history">History</option>
                      <option value="dua">Dua</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Language</label>
                    <div className="flex gap-4">
                      {['en', 'ur', 'hi'].map((lang) => (
                        <label key={lang} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="language"
                            checked={currentBook.language === lang}
                            onChange={() => setCurrentBook({ ...currentBook, language: lang as any })}
                            className="text-[#5A5A40] focus:ring-[#5A5A40]"
                          />
                          <span className="text-sm uppercase">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">PDF URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/book.pdf"
                      value={currentBook.pdfUrl}
                      onChange={(e) => setCurrentBook({ ...currentBook, pdfUrl: e.target.value })}
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Cover Image URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com/cover.jpg"
                      value={currentBook.coverImage}
                      onChange={(e) => setCurrentBook({ ...currentBook, coverImage: e.target.value })}
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                </div>

                <div className="flex gap-8 py-4 px-2 bg-[#F5F5F0] rounded-3xl">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentBook.featured}
                        onChange={(e) => setCurrentBook({ ...currentBook, featured: e.target.checked })}
                        className="rounded h-5 w-5 text-[#5A5A40] focus:ring-[#5A5A40]" 
                      />
                      <span className="font-bold text-gray-700">Set as Featured</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentBook.trending}
                        onChange={(e) => setCurrentBook({ ...currentBook, trending: e.target.checked })}
                        className="rounded h-5 w-5 text-[#5A5A40] focus:ring-[#5A5A40]" 
                      />
                      <span className="font-bold text-gray-700">Set as Trending</span>
                   </label>
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#5A5A40] text-white px-10 py-3 rounded-2xl font-bold hover:bg-[#4A4A35] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? "Saving..." : (isEditing ? "Update Book" : "Add Book")}
                    {!loading && <Check size={20} />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortableRow({ book, onEdit, onDelete }: { book: Book, onEdit: (book: Book) => void, onDelete: (id: string) => void | Promise<void>, key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    backgroundColor: isDragging ? '#F5F5F0' : 'white',
    boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
  };

  return (
    <tr ref={setNodeRef} style={style} className={`group hover:bg-gray-50 transition-colors ${isDragging ? 'opacity-50' : ''}`}>
      <td className="px-6 py-4 text-center">
        <button {...attributes} {...listeners} className="text-gray-400 hover:text-[#5A5A40] cursor-grab active:cursor-grabbing">
          <GripVertical size={20} />
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {book.coverImage && <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />}
          </div>
          <div>
            <div className="font-bold text-gray-900 group-hover:text-[#5A5A40] transition-colors">{book.title}</div>
            <div className="text-xs text-gray-500">{book.author}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-block px-3 py-1 rounded-full bg-[#EBEBE6] text-[#5A5A40] text-xs font-bold uppercase">
          {book.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-600 uppercase">{book.language}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(book)}
            className="p-2 text-[#5A5A40] hover:bg-[#5A5A40]/10 rounded-full transition-all"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-all"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
