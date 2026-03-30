/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Music, 
  Music2, 
  ChevronDown, 
  Instagram,
  MessageCircle,
  Gift,
  Camera,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Leaf,
  Flower,
  Bird,
  Navigation,
  ShieldCheck,
  HandMetal,
  Users,
  Thermometer,
  Send,
  Video,
  Shirt,
  Info,
  X,
  Share2
} from 'lucide-react';
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  getDocFromServer,
  doc
} from 'firebase/firestore';

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    const self = this as any;
    if (self.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(self.state.error?.message || "{}");
        if (parsed.error) errorMessage = `Firebase Error: ${parsed.error}`;
      } catch {
        errorMessage = self.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-royal-bg p-4">
          <div className="glass-card royal-border p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-display gold-text-shimmer mb-4">Application Error</h2>
            <p className="text-royal-text/70 mb-8 italic">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gold-600 text-royal-bg uppercase tracking-widest text-[10px] font-black"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return self.props.children;
  }
}

// --- Types ---

interface Wish {
  id?: string;
  name: string;
  message: string;
  attendance: 'hadir' | 'tidak_hadir' | '';
  createdAt: Timestamp | any;
}

// --- Components ---



const WeddingLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-16 h-16 text-xl",
    md: "w-24 h-24 text-3xl",
    lg: "w-32 h-32 text-4xl"
  };
  
  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center group`}>
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-2xl group-hover:bg-gold-500/30 transition-all duration-700" />
      
      {/* Rotating Rings */}
      <div className="absolute inset-0 border border-gold-500/30 rounded-full animate-spin-slow" />
      <div className="absolute inset-2 border border-gold-400/20 rounded-full animate-reverse-spin-slow" />
      
      {/* Main Circle */}
      <div className="absolute inset-4 bg-gradient-to-br from-gold-100 to-white rounded-full border-2 border-gold-500/50 flex items-center justify-center shadow-xl">
        <div className="flex items-center gap-1 font-display font-black gold-text-shimmer">
          <span>A</span>
          <Heart size={size === "lg" ? 20 : 14} fill="currentColor" className="text-rosegold-500 animate-pulse" />
          <span>J</span>
        </div>
      </div>
      
      {/* Decorative Ornaments */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-gold-600">
        <Sparkles size={size === "lg" ? 16 : 12} />
      </div>
    </div>
  );
};



const PictureBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <img 
      src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" 
      alt="Wedding Background" 
      className="w-full h-full object-cover opacity-20"
      referrerPolicy="no-referrer"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-white/90" />
  </div>
);

const Section = ({ children, className = "", id = "" }: { children: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={`min-h-[90vh] flex flex-col items-center justify-center p-4 md:p-8 text-center relative overflow-hidden ${className}`}>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-6xl flex flex-col items-center relative z-10"
    >
      {children}
    </motion.div>
  </section>
);

const RoyalDivider = () => (
  <div className="flex items-center justify-center gap-4 my-24 md:my-32 opacity-80">
    <div className="h-[1px] w-16 md:w-32 bg-gradient-to-r from-transparent via-gold-500 to-gold-300" />
    <div className="text-gold-500 flex items-center gap-3">
      <Sparkles size={14} className="animate-pulse" />
      <div className="w-8 h-8 rounded-full border border-gold-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(248,59,101,0.3)]">
        <Heart size={14} fill="currentColor" className="text-gold-500" />
      </div>
      <Sparkles size={14} className="animate-pulse" />
    </div>
    <div className="h-[1px] w-16 md:w-32 bg-gradient-to-l from-transparent via-gold-500 to-gold-300" />
  </div>
);

const RoyalOrnament = () => (
  <div className="flex items-center justify-center gap-6 my-10 w-full max-w-md">
    <div className="flex-1 flex flex-col gap-1">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold-500 to-gold-300" />
      <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-gold-600 to-gold-400 opacity-50" />
    </div>
    <div className="relative flex items-center justify-center">
      <Sparkles className="text-gold-400 relative z-10" size={24} />
    </div>
    <div className="flex-1 flex flex-col gap-1">
      <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-gold-500 to-gold-300" />
      <div className="h-[0.5px] w-full bg-gradient-to-l from-transparent via-gold-600 to-gold-400 opacity-50" />
    </div>
  </div>
);



const CountdownItem = ({ value, label }: { value: number, label: string }) => (
  <div className="flex flex-col items-center mx-3 sm:mx-6 group">
    <div className="text-4xl sm:text-6xl font-display font-bold gold-text-shimmer mb-2 transition-transform group-hover:scale-110 duration-500 drop-shadow-[0_0_15px_rgba(248,59,101,0.3)]">{value}</div>
    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mb-3" />
    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-gold-400 font-bold">{label}</span>
  </div>
);



const MusicPlayer = ({ isPlaying, setIsPlaying }: { isPlaying: boolean, setIsPlaying: (val: boolean) => void }) => {
  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-6 right-6 z-[150] flex items-center gap-4"
    >
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white/10 backdrop-blur-md border border-gold-500/20 px-4 py-2 rounded-full overflow-hidden whitespace-nowrap"
          >
            <span className="text-[10px] text-gold-400 font-display tracking-widest uppercase animate-pulse">Now Playing: Wedding Song</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="relative group"
      >
        <div className="absolute -inset-4 bg-gold-500/20 rounded-full blur-xl group-hover:bg-gold-500/40 transition-all duration-500" />
        <div className={`relative w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-gold-500/30 flex items-center justify-center text-gold-500 shadow-2xl transition-all duration-500 ${isPlaying ? 'animate-spin-slow' : ''}`}>
          {isPlaying ? <Music className="w-6 h-6" /> : <Music2 className="w-6 h-6" />}
          
          {/* Visualizer bars when playing */}
          {isPlaying && (
            <div className="absolute -bottom-1 flex gap-0.5">
              {[1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-0.5 bg-gold-400 rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showGrandDoves, setShowGrandDoves] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [attendance, setAttendance] = useState<'hadir' | 'tidak_hadir' | ''>('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) {
      setGuestName(decodeURIComponent(to));
    }
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();

    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wishesData: Wish[] = [];
      snapshot.forEach((doc) => {
        wishesData.push({ id: doc.id, ...doc.data() } as Wish);
      });
      setWishes(wishesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'wishes');
    });

    return () => unsubscribe();
  }, []);

  const handleSendWish = async () => {
    if (wishName.trim() && wishMessage.trim() && attendance) {
      setIsSending(true);
      try {
        await addDoc(collection(db, 'wishes'), {
          name: wishName,
          message: wishMessage,
          attendance,
          createdAt: serverTimestamp()
        });
        setWishName('');
        setWishMessage('');
        setAttendance('');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'wishes');
      } finally {
        setIsSending(false);
      }
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Target date: 4 April 2026
  const targetDate = new Date('2026-04-04T10:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleOpen = () => {
    setShowGrandDoves(true);
    setIsOpen(true);
    setIsPlaying(true);
    // Hide grand doves after animation completes
    setTimeout(() => setShowGrandDoves(false), 4000);
  };

  return (
    <ErrorBoundary>
      <div className="relative bg-white min-h-screen selection:bg-gold-500/20 selection:text-royal-text overflow-x-hidden">
      <PictureBackground />
      {/* Music Toggle */}
      {isOpen && <MusicPlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} />}

      {/* Fixed Watermark */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none opacity-20">
        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-gold-600 font-black font-sans whitespace-nowrap">
          GIMA HOSTING INVITATION
        </p>
      </div>

      <audio 
        ref={audioRef}
        src="/wedding-song.mp3"
        loop
      />

      {/* Grand Dove Animation on Open */}
      <AnimatePresence>
        {showGrandDoves && (
          <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: i % 2 === 0 ? "-20vw" : "120vw", 
                  y: `${Math.random() * 100}vh`,
                  scale: 0.3 + Math.random() * 1.2,
                  opacity: 0,
                  rotate: i % 2 === 0 ? 45 : -45
                }}
                animate={{ 
                  x: i % 2 === 0 ? "120vw" : "-20vw",
                  y: `${Math.random() * 100}vh`,
                  opacity: [0, 1, 1, 0],
                  rotate: i % 2 === 0 ? [45, 0, 45] : [-45, 0, -45]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3,
                  ease: "easeInOut",
                  delay: Math.random() * 1.5
                }}
                className="absolute text-gold-300/80 drop-shadow-[0_5px_10px_rgba(212,175,55,0.3)]"
              >
                <Bird 
                  size={20 + Math.random() * 40} 
                  fill="currentColor" 
                  stroke="none"
                  style={{ transform: i % 2 === 0 ? 'none' : 'scaleX(-1)' }} 
                />
              </motion.div>
            ))}
            {/* Sparkles trail */}
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{ opacity: 0, scale: 0, x: "50vw", y: "50vh" }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 2, 0],
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`
                }}
                transition={{ duration: 3, delay: Math.random() * 2 }}
                className="absolute text-gold-300"
              >
                <Sparkles size={12 + Math.random() * 24} />
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2 }}
              className="absolute inset-0 bg-white mix-blend-overlay"
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-royal-text p-6 overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="/hero.jpg" 
                alt="Aulia & Jarwal" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />
            </div>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
              <WeddingLogo size="sm" />
            </div>
            {/* Watermark on Cover */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 opacity-30">
              <p className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-gold-500 font-black font-sans">
                GIMA HOSTING INVITATION
              </p>
            </div>
            {/* Elegant Background for Cover */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')] opacity-30" />
              <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 border-l-2 border-t-2 border-gold-400/30 m-4 md:m-8" />
              <div className="absolute bottom-0 right-0 w-32 h-32 md:w-64 md:h-64 border-r-2 border-b-2 border-gold-400/30 m-4 md:m-8" />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative z-10 flex flex-col items-center text-center w-full max-w-[90vw] text-white"
            >
              <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-gold-400 mb-6 md:mb-8 font-sans font-semibold">The Wedding Celebration of</span>
              
              <h1 className="text-4xl md:text-7xl font-display mb-6 tracking-widest gold-text-shimmer font-black">
                AULIA <span className="text-2xl md:text-4xl block md:inline text-gold-500 font-serif italic my-4 md:my-0 md:mx-4">&</span> JARWAL
              </h1>

              <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent my-8 md:my-10" />

              <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-gold-300 mb-10 md:mb-12 font-sans font-bold">
                Sabtu, 4 April 2026
              </p>

              <div className="mb-10 md:mb-12 p-6 md:p-8 border border-white/30 rounded-none bg-black/20 backdrop-blur-md shadow-[0_0_30px_rgba(248,59,101,0.2)] relative overflow-hidden group w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/80 mb-3 font-bold">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                <p className="text-2xl md:text-3xl font-serif italic text-white gold-text-shimmer">{guestName}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(248,59,101,0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className="group relative px-10 py-4 md:px-12 md:py-5 bg-gold-600 text-royal-bg uppercase tracking-[0.5em] text-[9px] md:text-[10px] font-black transition-all duration-500 overflow-hidden shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-4">
                  Buka Undangan
                  <ChevronDown className="group-hover:translate-y-1 transition-transform" size={18} />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Hero Section */}
            <Section className="pt-32 pb-20">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2 }}
                className="relative mb-20"
              >
                <div className="absolute -inset-12 border border-gold-500/20 rounded-full animate-spin-slow" />
                <div className="absolute -inset-6 border border-gold-400/10 rounded-full animate-reverse-spin-slow" />
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-gold-500/50 shadow-[0_0_60px_rgba(248,59,101,0.3)] relative z-10 bg-white">
                  <img 
                    src="/hero.jpg" 
                    alt="Aulia & Jarwal" 
                    className="w-full h-full object-cover opacity-90"
                    onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/wedding-hero/800/800" }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              <span className="text-[10px] md:text-xs uppercase tracking-[0.8em] text-gold-500 mb-6 md:mb-8 font-sans font-black">The Royal Wedding Celebration of</span>
              <h2 className="text-4xl md:text-8xl font-display gold-text-shimmer mb-8 md:mb-10 tracking-tighter font-black">
                Aulia <span className="text-2xl md:text-5xl font-serif italic text-gold-500">&</span> Jarwal
              </h2>
              
              <RoyalOrnament />

              <p className="text-lg md:text-2xl font-body italic text-royal-text/80 max-w-3xl leading-relaxed px-4 md:px-6">
                "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."
              </p>
              <p className="mt-8 text-xs uppercase tracking-[0.4em] text-gold-500 font-black">— Ar-Rum: 21</p>
            </Section>

            {/* --- Invitation Text --- */}
            <RoyalDivider />
            <Section>
              <div className="flex flex-col items-center justify-center gap-6 md:gap-8 mb-16 md:mb-24 relative z-10">
                <Bird className="w-10 h-10 md:w-12 md:h-12 text-gold-500" fill="currentColor" stroke="none" />
                <h2 className="font-display text-2xl md:text-5xl gold-text-shimmer tracking-[0.4em] uppercase font-black">Invitation</h2>
                <RoyalOrnament />
                <p className="font-serif text-gold-500 text-xs tracking-[0.3em] uppercase font-black -mt-4">Undangan Suci</p>
              </div>
              <div className="max-w-4xl glass-card royal-border p-8 md:p-24 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <h3 className="text-2xl md:text-4xl font-display gold-text-shimmer mb-10 md:mb-12 tracking-[0.2em] uppercase font-bold">Assalamu'alaikum Wr. Wb.</h3>
                <p className="font-body text-lg md:text-xl leading-relaxed mb-10 md:mb-12 text-royal-text/80 italic">
                  Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri Resepsi Pernikahan putra-putri kami:
                </p>

                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center my-16 md:my-20">
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-3xl md:text-5xl font-display gold-text-shimmer font-black tracking-tight">Aulia Ramadani</h4>
                    <p className="text-[9px] md:text-[10px] text-gold-500 font-sans uppercase tracking-[0.4em] font-black">Putri kedua dari</p>
                    <p className="text-lg md:text-xl font-serif text-royal-text italic">Bapak ABD AZIZ & Ibu NABASIA</p>
                    <motion.a 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      href="https://www.instagram.com/dedeaul_?igsh=MWZmaDE4eG1oNjBrNQ==" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex p-3 rounded-full bg-gold-500/10 text-gold-400 hover:bg-gold-500 hover:text-royal-bg transition-all shadow-md mt-4 border border-gold-500/20"
                    >
                      <Instagram className="w-5 h-5" />
                    </motion.a>
                  </div>
                  <div className="text-5xl font-script text-gold-500">&</div>
                  <div className="space-y-6">
                    <h4 className="text-5xl font-display gold-text-shimmer font-black tracking-tight">Jarwal</h4>
                    <p className="text-[10px] text-gold-500 font-sans uppercase tracking-[0.4em] font-black">Putra bungsu dari</p>
                    <p className="text-xl font-serif text-royal-text italic">Bapak H RAMLI & Ibu HJ HAWANG</p>
                    <motion.a 
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      href="https://www.instagram.com/jarwall_09?igsh=MWVubnI2MW1scTUzMA==" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex p-3 rounded-full bg-gold-500/10 text-gold-400 hover:bg-gold-500 hover:text-royal-bg transition-all shadow-md mt-4 border border-gold-500/20"
                    >
                      <Instagram className="w-5 h-5" />
                    </motion.a>
                  </div>
                </div>
              </div>
            </Section>

            {/* Event Details */}
            <RoyalDivider />
            <Section className="relative">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')]" />
              
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="glass-card p-8 md:p-16 royal-border rounded-sm max-w-5xl w-full shadow-2xl relative overflow-hidden z-10"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-6 md:gap-8 mb-12 md:mb-16">
                    <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gold-400 animate-pulse" />
                    <h2 className="font-display text-2xl md:text-5xl gold-text-shimmer tracking-[0.4em] uppercase font-black">Save The Date</h2>
                    <p className="font-serif text-gold-500 text-xs tracking-[0.3em] uppercase font-black -mt-4">Waktu & Tempat</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-12 md:gap-24">
                    <div className="space-y-8 md:space-y-10">
                      <div className="flex flex-col items-center">
                        <div className="p-6 md:p-8 bg-gold-500/10 rounded-full mb-6 md:mb-8 shadow-[inset_0_0_20px_rgba(248,59,101,0.2)] border border-gold-500/30">
                          <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gold-400" />
                        </div>
                        <h3 className="font-display text-xl md:text-3xl font-black text-gold-800 mb-4 md:mb-6 uppercase tracking-[0.2em]">Akad Nikah</h3>
                        <div className="w-20 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mb-6 md:mb-8 mx-auto" />
                        <p className="font-serif text-xl md:text-2xl text-royal-text font-bold mb-2 md:mb-3 italic">Sabtu, 4 April 2026</p>
                        <div className="flex items-center justify-center gap-4 text-gold-400 font-black uppercase tracking-[0.4em] text-[10px]">
                          <Clock className="w-5 h-5" />
                          <span>10.00 WITA - Selesai</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 md:space-y-10">
                      <div className="flex flex-col items-center">
                        <div className="p-6 md:p-8 bg-gold-500/10 rounded-full mb-6 md:mb-8 shadow-[inset_0_0_20px_rgba(248,59,101,0.2)] border border-gold-500/30">
                          <Heart className="w-10 h-10 md:w-12 md:h-12 text-gold-400" />
                        </div>
                        <h3 className="font-display text-xl md:text-3xl font-black text-gold-800 mb-4 md:mb-6 uppercase tracking-[0.2em]">Resepsi</h3>
                        <div className="w-20 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mb-6 md:mb-8 mx-auto" />
                        <p className="font-serif text-xl md:text-2xl text-royal-text font-bold mb-2 md:mb-3 italic">Sabtu, 4 April 2026</p>
                        <div className="flex items-center justify-center gap-4 text-gold-400 font-black uppercase tracking-[0.4em] text-[10px]">
                          <Clock className="w-5 h-5" />
                          <span>12.00 WITA - Selesai</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 md:mt-24 pt-16 md:pt-20 border-t border-gold-500/20 flex flex-col items-center">
                    <MapPin className="w-12 h-12 md:w-16 md:h-16 text-gold-400 mb-6 md:mb-8 animate-bounce" />
                    <h3 className="font-display text-xl md:text-3xl font-black text-gold-800 mb-4 md:mb-6 uppercase tracking-[0.2em]">Lokasi Acara</h3>
                    <p className="font-serif text-royal-text max-w-lg mb-10 md:mb-12 text-xl md:text-2xl leading-relaxed font-bold italic">
                      BTN PEPABRI SUDIANG BLOK E12/7
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(248,59,101,0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open('https://maps.app.goo.gl/DavZrebYAX4FPHXN6?g_st=awb', '_blank')}
                      className="px-12 py-5 bg-gold-600 text-royal-bg rounded-none font-display tracking-[0.5em] uppercase text-[10px] font-black shadow-2xl flex items-center gap-4 hover:bg-gold-500 transition-all"
                    >
                      <Navigation className="w-6 h-6" />
                      Petunjuk Lokasi
                    </motion.button>
                    
                    <div className="flex flex-wrap justify-center gap-6 mt-10">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const event = {
                            title: 'Wedding of Aulia & Jarwal',
                            start: '20260404T100000',
                            end: '20260404T220000',
                            location: 'BTN PEPABRI SUDIANG BLOK E12/7',
                            details: 'Pernikahan Aulia & Jarwal'
                          };
                          window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`, '_blank');
                        }}
                        className="px-8 py-4 border border-gold-500/30 text-gold-600 font-display tracking-[0.3em] uppercase text-[9px] font-black flex items-center gap-3 hover:bg-gold-500/10 transition-all"
                      >
                        <Calendar size={16} />
                        Ingatkan Saya
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Undangan Pernikahan Aulia & Jarwal',
                              text: 'Kami mengundang Anda untuk hadir di hari bahagia kami.',
                              url: window.location.href
                            });
                          } else {
                            copyToClipboard(window.location.href, 2);
                          }
                        }}
                        className="px-8 py-4 border border-gold-500/30 text-gold-600 font-display tracking-[0.3em] uppercase text-[9px] font-black flex items-center gap-3 hover:bg-gold-500/10 transition-all"
                      >
                        <Share2 size={16} />
                        Bagikan Undangan
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Section>

            <RoyalDivider />

            {/* Dress Code & Virtual Wedding */}
            <Section className="relative">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')]" />
              <div className="flex flex-col items-center justify-center gap-6 md:gap-8 mb-16 md:mb-24 relative z-10">
                <Info className="w-10 h-10 md:w-12 md:h-12 text-gold-400 animate-pulse" />
                <h2 className="font-display text-2xl md:text-5xl gold-text-shimmer tracking-[0.4em] uppercase font-black">Information</h2>
                <RoyalOrnament />
                <p className="font-serif text-gold-500 text-xs tracking-[0.3em] uppercase font-black -mt-4">Informasi Tambahan</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 max-w-5xl w-full relative z-10">
                {/* Dress Code */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="glass-card p-10 royal-border text-center flex flex-col items-center"
                >
                  <div className="p-6 bg-gold-500/10 rounded-full mb-8 border border-gold-500/30">
                    <Shirt className="w-10 h-10 text-gold-400" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-gold-800 mb-6 uppercase tracking-[0.2em]">Dress Code</h3>
                  <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mb-8" />
                  <p className="font-serif text-xl text-royal-text font-bold italic mb-4">Pakaian Bebas & Rapi</p>
                  <p className="font-body text-lg text-royal-text/70 italic">Kehadiran Anda adalah kado terindah bagi kami. Mohon gunakan pakaian yang rapi dan sopan.</p>
                </motion.div>

                {/* Virtual Wedding */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="glass-card p-10 royal-border text-center flex flex-col items-center"
                >
                  <div className="p-6 bg-gold-500/10 rounded-full mb-8 border border-gold-500/30">
                    <Video className="w-10 h-10 text-gold-400" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-gold-800 mb-6 uppercase tracking-[0.2em]">Virtual Wedding</h3>
                  <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mb-8" />
                  <p className="font-serif text-xl text-royal-text font-bold italic mb-4">Live Streaming</p>
                  <p className="font-body text-lg text-royal-text/70 italic mb-8">Bagi keluarga dan teman-teman yang berhalangan hadir secara langsung, dapat menyaksikan melalui:</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open('https://www.instagram.com/dedeaul_?igsh=MWZmaDE4eG1oNjBrNQ==', '_blank')}
                    className="px-8 py-4 bg-gold-600 text-royal-bg font-display tracking-[0.3em] uppercase text-[10px] font-black shadow-xl flex items-center gap-3 hover:bg-gold-500 transition-all"
                  >
                    <Instagram size={18} />
                    Nonton Live
                  </motion.button>
                </motion.div>
              </div>
            </Section>

            <RoyalDivider />

            {/* Gallery Section */}
            <Section className="relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')]" />
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-6xl w-full text-center relative z-10"
              >
                <div className="flex flex-col items-center justify-center gap-6 md:gap-8 mb-16 md:mb-20">
                  <Camera className="w-10 h-10 md:w-12 md:h-12 text-gold-400 mb-6 md:mb-8 animate-pulse" />
                  <h2 className="font-display text-2xl md:text-5xl gold-text-shimmer tracking-[0.4em] uppercase font-black">Our Gallery</h2>
                  <RoyalOrnament />
                  <p className="font-serif text-gold-500 text-xs tracking-[0.3em] uppercase font-black -mt-4">Momen Indah Kami</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <motion.div
                      key={num}
                      whileHover={{ scale: 1.05, y: -15, rotate: num % 2 === 0 ? 2 : -2 }}
                      onClick={() => setSelectedImage(`/love${num}.jpg`)}
                      className={`relative overflow-hidden royal-border glass-card p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer ${num % 2 === 0 ? 'md:mt-16' : ''}`}
                    >
                      <div className="overflow-hidden aspect-[3/4] rounded-sm">
                        <img 
                          src={`/love${num}.jpg`} 
                          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/love${num}/400/${num % 2 === 0 ? '600' : '400'}` }} 
                          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-125" 
                          alt={`Gallery ${num}`} 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-gold-900/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <Camera className="text-white w-8 h-8" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Section>

            {/* Gallery Modal */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                  className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                >
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6 text-white hover:text-gold-400 transition-colors z-10"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X size={40} />
                  </motion.button>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
                  >
                    <img 
                      src={selectedImage} 
                      onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/wedding-gallery/1200/800" }}
                      className="max-w-full max-h-full object-contain rounded-sm shadow-2xl border-2 border-gold-500/30"
                      alt="Gallery Preview"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Love Story Section */}
            <RoyalDivider />
            <Section className="relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')]" />
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-4xl w-full text-center relative z-10"
              >
                <div className="flex flex-col items-center justify-center gap-6 md:gap-8 mb-16 md:mb-24">
                  <RoyalOrnament />
                  <h2 className="font-display text-2xl md:text-5xl gold-text-shimmer tracking-[0.4em] uppercase font-black">Our Love Story</h2>
                  <p className="font-serif text-gold-500 text-xs tracking-[0.3em] uppercase font-black -mt-4">Perjalanan Cinta Kami</p>
                </div>
                
                <div className="space-y-24 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-gold-500/50 before:to-transparent">
                  {[
                    { year: "2025", title: "Pertama Bertemu", desc: "Takdir membawa kami pada sebuah pertemuan yang sederhana, namun di sanalah awal dari segalanya dimulai." },
                    { year: "2025", title: "Menjalin Kasih", desc: "Dua hati yang berbeda akhirnya menemukan satu tujuan, memutuskan untuk saling melengkapi dan melangkah bersama." },
                    { year: "2026", title: "Lamaran", desc: "Di hadapan keluarga, kami mengikat janji suci untuk melangkah ke jenjang yang lebih serius, menuju ibadah terlama kami." }
                  ].map((story, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-royal-bg bg-gold-600 text-royal-bg shadow-[0_0_20px_rgba(248,59,101,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-125 group-hover:bg-gold-400">
                        <Heart size={24} fill="currentColor" />
                      </div>
                      <div className="w-[calc(100%-4.5rem)] md:w-[calc(50%-4rem)] p-10 rounded-[2.5rem] glass-card royal-border text-left group-hover:shadow-[0_0_50px_rgba(248,59,101,0.2)] transition-all duration-500">
                        <div className="flex items-center justify-between space-x-4 mb-6">
                          <div className="font-display font-black text-gold-800 text-2xl tracking-widest uppercase">{story.title}</div>
                          <time className="font-serif italic text-gold-500 font-black text-xl">{story.year}</time>
                        </div>
                        <div className="text-royal-text/80 leading-relaxed font-body text-lg italic">"{story.desc}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Section>



            {/* Countdown Section */}
            <RoyalDivider />
            <Section className="relative">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')]" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="text-center relative z-10"
              >
                <div className="flex flex-col items-center justify-center gap-6 md:gap-8 mb-16 md:mb-20">
                  <Clock className="w-10 h-10 md:w-12 md:h-12 text-gold-400 animate-pulse" />
                  <h2 className="font-display text-2xl md:text-5xl gold-text-shimmer tracking-[0.4em] uppercase font-black">Countdown</h2>
                  <RoyalOrnament />
                  <p className="font-serif text-gold-500 text-xs tracking-[0.3em] uppercase font-black -mt-4">Menuju Hari Bahagia</p>
                </div>
                <div className="flex justify-center items-center gap-6 md:gap-12">
                  <CountdownItem value={timeLeft.days} label="Hari" />
                  <CountdownItem value={timeLeft.hours} label="Jam" />
                  <CountdownItem value={timeLeft.minutes} label="Menit" />
                  <CountdownItem value={timeLeft.seconds} label="Detik" />
                </div>
              </motion.div>
            </Section>

            <RoyalDivider />

            {/* RSVP / Wish Section */}
            <Section>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-5xl w-full text-center"
              >
                <div className="flex flex-col items-center justify-center gap-6 md:gap-8 mb-12 md:mb-16">
                  <div className="wax-seal mb-4" />
                  <Flower className="w-10 h-10 md:w-12 md:h-12 text-gold-400 animate-pulse" />
                  <h2 className="font-display text-2xl md:text-5xl gold-text-shimmer tracking-[0.4em] uppercase font-black">Guest Book</h2>
                  <RoyalOrnament />
                  <p className="font-serif text-gold-500 text-xs tracking-[0.3em] uppercase font-black -mt-4">Ucapan & Doa Restu</p>
                </div>
                <p className="font-body text-lg md:text-2xl text-royal-text/70 mb-16 md:mb-20 italic">Berikan doa restu Anda untuk perjalanan suci kami</p>
                
                <div className="grid md:grid-cols-5 gap-16 items-start">
                  <div className="md:col-span-2 space-y-8 text-left glass-card p-12 royal-border shadow-2xl">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.5em] text-gold-500 font-black ml-2">Nama Lengkap</label>
                      <input 
                        type="text" 
                        placeholder="Yth. Bapak/Ibu/Saudara/i" 
                        value={wishName}
                        onChange={(e) => setWishName(e.target.value)}
                        className="w-full bg-gold-500/5 border-b-2 border-gold-500/30 py-4 px-4 focus:border-gold-400 focus:bg-gold-500/10 outline-none transition-all font-body text-xl text-royal-text placeholder:text-gold-500/30 rounded-t-lg"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.5em] text-gold-500 font-black ml-2">Pesan & Doa Restu</label>
                      <textarea 
                        placeholder="Tuliskan doa restu Anda..." 
                        rows={5}
                        value={wishMessage}
                        onChange={(e) => setWishMessage(e.target.value)}
                        className="w-full bg-gold-500/5 border-b-2 border-gold-500/30 py-4 px-4 focus:border-gold-400 focus:bg-gold-500/10 outline-none transition-all font-body text-xl text-royal-text resize-none placeholder:text-gold-500/30 rounded-t-lg"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.5em] text-gold-500 font-black ml-2">Konfirmasi Kehadiran</label>
                      <div className="flex gap-6 mt-2">
                        <button 
                          onClick={() => setAttendance('hadir')}
                          className={`flex-1 py-3 border ${attendance === 'hadir' ? 'bg-gold-600 border-gold-600 text-royal-bg' : 'border-gold-500/30 text-gold-500'} font-display text-[10px] uppercase tracking-widest font-black transition-all`}
                        >
                          Hadir
                        </button>
                        <button 
                          onClick={() => setAttendance('tidak_hadir')}
                          className={`flex-1 py-3 border ${attendance === 'tidak_hadir' ? 'bg-gold-600 border-gold-600 text-royal-bg' : 'border-gold-500/30 text-gold-500'} font-display text-[10px] uppercase tracking-widest font-black transition-all`}
                        >
                          Tidak Hadir
                        </button>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(248,59,101,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendWish}
                      disabled={isSending}
                      className="w-full py-6 bg-gold-600 text-royal-bg uppercase tracking-[0.5em] text-[10px] font-black shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 mt-10 hover:bg-gold-500 transition-all"
                    >
                      {isSending ? (
                        <div className="w-6 h-6 border-2 border-royal-bg/30 border-t-royal-bg rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={16} />
                          Kirim Pesan
                        </>
                      )}
                    </motion.button>
                  </div>

                  <div className="md:col-span-3 space-y-8 max-h-[700px] overflow-y-auto pr-6 custom-scrollbar">
                    {wishes.length > 0 ? (
                      wishes.map((wish, i) => (
                        <motion.div 
                          key={wish.id || i}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-10 royal-border glass-card text-left shadow-xl hover:shadow-gold-500/20 transition-all duration-500"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-300 font-display font-black text-xl shadow-inner">
                                {wish.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h4 className="font-display font-black text-gold-800 text-lg tracking-widest uppercase">{wish.name}</h4>
                                  <span className={`text-[8px] px-2 py-0.5 rounded-full border ${wish.attendance === 'hadir' ? 'border-green-500/50 text-green-600' : 'border-red-500/50 text-red-600'} uppercase font-black tracking-tighter`}>
                                    {wish.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gold-500/70 font-sans uppercase tracking-[0.3em] font-black">
                                  {wish.createdAt?.toDate ? wish.createdAt.toDate().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-royal-text/80 leading-relaxed font-body text-xl pl-20 italic">"{wish.message}"</p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-gold-500/20 italic font-body text-2xl">
                        Belum ada ucapan...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Section>

            <RoyalDivider />

            {/* Wedding Gift */}
            <Section className="relative">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')]" />
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-5xl w-full relative z-10"
              >
                <div className="text-center mb-20">
                  <Gift className="w-12 h-12 text-gold-400 mx-auto mb-8 animate-bounce" />
                  <h2 className="font-display text-4xl md:text-6xl gold-text-shimmer mb-8 tracking-[0.4em] uppercase font-black">Wedding Gift</h2>
                  <RoyalOrnament />
                  <p className="font-body text-2xl text-royal-text/70 max-w-3xl mx-auto italic mt-8">Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, dapat melalui:</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-10 max-w-4xl mx-auto">
                  {/* Dana */}
                  <div className="p-12 glass-card royal-border shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-125" />
                    <div className="relative z-10">
                      <div className="h-8 mb-10 flex items-center font-display font-black text-gold-300 tracking-[0.3em] text-sm uppercase">E-Wallet</div>
                      <p className="text-[10px] uppercase tracking-[0.5em] text-gold-500 font-black mb-3">Nomor Dana</p>
                      <p className="text-3xl font-display font-black text-royal-text mb-2 tracking-tighter">085756148415</p>
                      <p className="text-lg font-body text-gold-600 italic">a.n. Aulia Ramadani</p>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard('085756148415', 0)}
                        className="mt-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gold-600 hover:text-gold-900 transition-all"
                      >
                        {copiedIndex === 0 ? (
                          <><Check size={18} className="text-green-500" /> Tersalin</>
                        ) : (
                          <><Copy size={18} /> Salin Nomor</>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Bank/Other */}
                  <div className="p-12 glass-card royal-border shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-125" />
                    <div className="relative z-10">
                      <div className="h-8 mb-10 flex items-center font-display font-black text-gold-300 tracking-[0.3em] text-sm uppercase">Kirim Kado</div>
                      <p className="text-[10px] uppercase tracking-[0.5em] text-gold-500 font-black mb-3">Alamat Pengiriman</p>
                      <p className="text-2xl font-display text-royal-text mb-2 font-black tracking-tight leading-tight">BTN PEPABRI SUDIANG BLOK E12/7</p>
                      <p className="text-lg font-body text-gold-600 italic">Makassar, Sulawesi Selatan</p>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard('BTN PEPABRI SUDIANG BLOK E12/7', 1)}
                        className="mt-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gold-600 hover:text-gold-900 transition-all"
                      >
                        {copiedIndex === 1 ? (
                          <><Check size={18} className="text-green-500" /> Tersalin</>
                        ) : (
                          <><Copy size={18} /> Salin Alamat</>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Section>

            <RoyalDivider />

            {/* Closing Quote */}
            <Section className="py-40">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl text-center"
              >
                <div className="wax-seal mx-auto mb-16" />
                <p className="font-body text-3xl text-royal-text leading-relaxed italic mb-12 px-8">
                  "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."
                </p>
                <RoyalOrnament />
                <p className="font-display text-gold-500 font-black tracking-[0.6em] uppercase text-sm mt-12">QS. Ar-Rum: 21</p>
              </motion.div>
            </Section>

            {/* Footer */}
            <footer className="py-32 text-center relative overflow-hidden border-t border-gold-500/10 bg-transparent">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/royal-feather.png')] z-[1]" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-12">
                  <WeddingLogo size="lg" />
                </div>
                <h2 className="font-display text-5xl md:text-7xl gold-text-shimmer mb-10 tracking-[0.5em] uppercase font-black">Aulia & Jarwal</h2>
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-600 to-transparent mx-auto mb-12" />
                <p className="font-sans text-gold-500 text-xs tracking-[0.8em] uppercase font-black">Terima Kasih Atas Doa Restu Anda</p>
                <div className="mt-20 opacity-30">
                  <RoyalOrnament />
                </div>
                <div className="mt-24 pb-8">
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-gold-500/40 font-black font-sans">
                    GIMA HOSTING INVITATION
                  </p>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffccd5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f83b65;
        }
      `}</style>
    </div>
    </ErrorBoundary>
  );
}
