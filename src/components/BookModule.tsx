import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Button, Card } from './UI';
import { Book, Thought } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookMarked, Plus, Trash2, Library, Send, Hash,
  ChevronRight, History, ArrowLeft, Home
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Mascot } from './Mascot';

interface BookModuleProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const BookModule: React.FC<BookModuleProps> = ({ onBack, onHome }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/books`), orderBy('dateAdded', 'desc'));
    const bPath = `users/${user.uid}/books`;
    return onSnapshot(q, 
      (s) => setBooks(s.docs.map(d => ({ id: d.id, ...d.data() } as Book))),
      (e) => handleFirestoreError(e, OperationType.LIST, bPath)
    );
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {!selectedBook ? (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <Button 
                    onClick={onBack} 
                    variant="outline" 
                    className="px-5 py-3.5 bg-stone-900 border-2 border-stone-500 text-stone-100 hover:text-amber-500 hover:border-amber-500 hover:bg-stone-800 transition-all font-bold shadow-md rounded-2xl flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                  </Button>
                  <Button 
                    onClick={onHome} 
                    variant="outline" 
                    className="px-5 py-3.5 bg-stone-900 border-2 border-stone-500 text-stone-100 hover:text-amber-500 hover:border-amber-500 hover:bg-stone-800 transition-all font-bold shadow-md rounded-2xl flex items-center justify-center"
                  >
                    <Home className="w-5 h-5 mr-2" /> Back to Home
                  </Button>
                </div>
                <h1 className="text-4xl md:text-5xl font-display text-white">Reading Room</h1>
                <p className="text-stone-400 font-serif italic text-lg">"Learn from the best."</p>
              </div>
              <Button onClick={() => setShowAdd(true)} className="bg-amber-600 hover:bg-amber-500 text-white rounded-2xl px-10 py-5 font-black shadow-2xl shadow-amber-900/40 ring-2 ring-amber-400/20">
                <Plus className="w-6 h-6 mr-3" /> New Book
              </Button>
            </header>

            <div className="bg-stone-900/40 p-8 rounded-[3rem] border border-stone-800 flex items-center gap-8">
               <Mascot mood="peaceful" className="scale-75 shrink-0" message="Hello! I am Bodh. I love reading and learning with you!" />
               <div className="space-y-2">
                  <h3 className="text-2xl font-display text-white">Your Books</h3>
                  <p className="text-stone-400 font-serif italic text-lg leading-relaxed">Save the books that help you think better.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map(book => (
                <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} userId={user?.uid || ''} />
              ))}
              {books.length === 0 && (
                <div className="col-span-full py-24 bg-stone-900/20 border-2 border-dashed border-stone-800 rounded-[3rem] text-center">
                  <Library className="w-20 h-20 mx-auto mb-6 text-stone-800" />
                  <p className="font-serif italic text-stone-600 text-xl">Your shelf is empty. Time to find a new friend!</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="thinking-space" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ThinkingSpace book={selectedBook} onBack={() => setSelectedBook(null)} userId={user?.uid || ''} />
          </motion.div>
        )}
      </AnimatePresence>

      <AddBookModal isOpen={showAdd} onClose={() => setShowAdd(false)} userId={user?.uid || ''} />
    </div>
  );
};

const BookCard: React.FC<{ book: Book; onClick: () => void; userId: string }> = ({ book, onClick, userId }) => (
  <Card 
    onClick={onClick}
    className="group p-10 bg-stone-900/60 border-stone-800 hover:border-amber-600/30 hover:shadow-2xl hover:shadow-amber-900/10 transition-all cursor-pointer relative overflow-hidden rounded-[2.5rem]"
  >
    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
      <ChevronRight className="w-8 h-8 text-amber-500" />
    </div>
    <div className="w-16 h-20 bg-stone-800 rounded-xl mb-8 flex items-center justify-center border border-stone-700/50 shadow-inner">
      <BookMarked className="w-8 h-8 text-amber-500" />
    </div>
    <h3 className="text-3xl font-display text-white mb-2">{book.title}</h3>
    <p className="text-stone-500 font-serif italic text-lg mb-8">{book.author}</p>
    <div className="flex items-center gap-4">
      <select 
        value={book.status} 
        onChange={async (e) => {
          await updateDoc(doc(db, `users/${userId}/books`, book.id), { status: e.target.value });
        }}
        className={cn(
          "px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-widest outline-none cursor-pointer",
          book.status === 'reading' ? "bg-amber-600/20 text-amber-500" : "bg-emerald-600/20 text-emerald-500"
        )}
      >
        <option value="reading">Learning</option>
        <option value="finished">Finished</option>
      </select>
    </div>
  </Card>
);

const ThinkingSpace: React.FC<{ book: Book; onBack: () => void; userId: string }> = ({ book, onBack, userId }) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<Thought['tag']>('Thought');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, `users/${userId}/thoughts`), 
      where('bookId', '==', book.id),
      orderBy('timestamp', 'desc')
    );
    const tPath = `users/${userId}/thoughts`;
    return onSnapshot(q, 
      (s) => setThoughts(s.docs.map(d => ({ id: d.id, ...d.data() } as Thought))),
      (e) => handleFirestoreError(e, OperationType.LIST, tPath)
    );
  }, [book.id, userId]);

  const addThought = async () => {
    if (!content.trim()) return;
    await addDoc(collection(db, `users/${userId}/thoughts`), {
      bookId: book.id,
      content,
      tag,
      timestamp: serverTimestamp()
    });
    setContent('');
    setShowInput(false);
  };

  const deleteThought = async (id: string) => {
    await deleteDoc(doc(db, `users/${userId}/thoughts`, id));
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={onBack} 
          size="sm" 
          className="px-5 py-3 bg-stone-900 border-2 border-stone-500 text-stone-100 hover:text-amber-400 hover:border-amber-500 hover:bg-stone-800 transition-all font-bold shadow-md rounded-2xl flex items-center justify-center"
        >
          <History className="w-5 h-5 mr-3" /> Back to Shelf
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-16">
        <header className="text-center space-y-6">
          <Mascot mood="thinking" message="Hello! I am Bodh. Write down what you learned here!" />
          <h2 className="text-5xl md:text-7xl font-display text-white">{book.title}</h2>
          <p className="text-amber-500 font-serif italic text-xl">Learning from {book.author}</p>
          {!showInput && (
            <div className="pt-4">
              <Button onClick={() => setShowInput(true)} className="bg-amber-600 hover:bg-amber-500 rounded-2xl px-12 py-6 text-xl">
                <Plus className="w-6 h-6 mr-3" /> Share a Lesson
              </Button>
            </div>
          )}
        </header>

        <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-10 before:w-px before:bg-stone-800">
          {thoughts.map((t, i) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
              className="relative pl-24 group"
            >
              <div className="absolute left-10 -translate-x-1/2 top-8 w-6 h-6 rounded-full bg-stone-900 border-4 border-amber-600 shadow-2xl z-10" />
              <Card className="p-10 bg-stone-900/60 border-stone-800 rounded-[3rem] shadow-2xl hover:bg-stone-800/80 transition-all">
                <div className="flex justify-between items-start mb-8">
                  <span className="flex items-center gap-3 px-6 py-2 bg-stone-800 rounded-full text-[10px] uppercase font-black text-amber-500 tracking-widest border border-amber-600/20">
                    <Hash className="w-3 h-3" /> {t.tag}
                  </span>
                  <button onClick={() => deleteThought(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-600 hover:text-red-500 p-2">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-stone-200 font-serif text-2xl italic leading-relaxed whitespace-pre-wrap">{t.content}</p>
              </Card>
            </motion.div>
          ))}
          {thoughts.length === 0 && (
            <div className="pl-24 py-12">
               <p className="text-stone-600 font-serif italic text-xl">No notes yet. Share a thought with me!</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showInput && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-12 left-0 right-0 p-6 xl:left-72 z-40"
            >
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-2xl bg-[#1c1917]/95 backdrop-blur-md border-stone-800 p-10 rounded-[3.5rem] shadow-black">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-3 overflow-x-auto pb-2 noscroll">
                      {(['Thought', 'Question', 'Insight', 'Feeling', 'Changed Idea'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setTag(t === 'Changed Idea' ? 'Changed Opinion' : (t === 'Thought' ? 'Thought' : t as any))}
                          className={cn(
                            "whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all border-2",
                            (tag === t || (t === 'Changed Idea' && tag === 'Changed Opinion')) 
                              ? "bg-amber-600 border-amber-500 text-white shadow-lg" 
                              : "bg-stone-800 border-transparent text-stone-500 hover:text-stone-300"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <Button variant="ghost" onClick={() => setShowInput(false)} className="text-stone-500">Close</Button>
                  </div>
                  <div className="flex gap-6 items-end">
                    <textarea 
                      autoFocus
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="What's on your mind?..."
                      className="w-full bg-stone-800/50 p-6 rounded-[2rem] outline-none font-serif text-2xl italic text-white placeholder:text-stone-700 min-h-[60px] max-h-[300px] shadow-inner"
                    />
                    <button 
                      onClick={addThought}
                      className="w-20 h-20 shrink-0 rounded-[2rem] bg-amber-600 text-white flex items-center justify-center hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/40 disabled:opacity-20 disabled:grayscale"
                      disabled={!content.trim()}
                    >
                      <Send className="w-8 h-8" />
                    </button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AddBookModal: React.FC<{ isOpen: boolean; onClose: () => void; userId: string }> = ({ isOpen, onClose, userId }) => {
  const [form, setForm] = useState({ title: '', author: '', status: 'reading' as const });
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, `users/${userId}/books`), { ...form, dateAdded: serverTimestamp() });
    setLoading(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-stone-900 border border-stone-800 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
           <Mascot mood="excited" className="scale-75" message="Hello! I am Bodh. Let's add a new book!" />
           <h3 className="text-4xl font-display text-white">New Book</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required placeholder="Book Title" className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-2xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all" onChange={e => setForm({...form, title: e.target.value})} />
          <input required placeholder="Author Name" className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-2xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all" onChange={e => setForm({...form, author: e.target.value})} />
          <div className="flex flex-col gap-3 pt-4">
            <Button className="w-full py-8 text-2xl bg-amber-600 hover:bg-amber-500 rounded-[2rem] shadow-xl shadow-amber-900/20" isLoading={loading}>Add Book</Button>
            <Button variant="ghost" className="w-full text-stone-500" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
