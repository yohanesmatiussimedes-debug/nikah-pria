/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';

// --- Components ---

const FloatingHeart = ({ delay = 0, left = "50%" }: { delay?: number, left?: string }) => (
  <motion.div
    initial={{ y: "100vh", opacity: 0, scale: 0 }}
    animate={{ 
      y: "-10vh", 
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.5],
      x: ["0%", "10%", "-10%", "0%"]
    }}
    transition={{ 
      duration: 10, 
      repeat: Infinity, 
      delay,
      ease: "linear"
    }}
    className="fixed pointer-events-none z-0 text-pink-200/40"
    style={{ left }}
  >
    <Heart fill="currentColor" size={24} />
  </motion.div>
);

const Section = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden ${className}`}>
    {children}
  </section>
);

const CountdownItem = ({ value, label }: { value: number, label: string }) => (
  <div className="flex flex-col items-center mx-2 sm:mx-4">
    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-pink-100 border border-pink-200 shadow-inner">
      <span className="text-2xl sm:text-3xl font-serif font-bold text-pink-700">{value}</span>
    </div>
    <span className="text-xs sm:text-sm mt-2 uppercase tracking-widest text-pink-600 font-medium">{label}</span>
  </div>
);

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    setIsOpen(true);
    setIsPlaying(true);
  };

  return (
    <div className="relative bg-pink-50 min-h-screen selection:bg-pink-200 selection:text-pink-900">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-300 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Floating Decorations */}
      {isOpen && (
        <>
          <FloatingHeart delay={0} left="10%" />
          <FloatingHeart delay={2} left="30%" />
          <FloatingHeart delay={5} left="70%" />
          <FloatingHeart delay={8} left="90%" />
          <FloatingHeart delay={3} left="50%" />
        </>
      )}

      {/* Music Toggle */}
      {isOpen && (
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200 text-pink-600 shadow-lg hover:bg-pink-50 transition-colors"
        >
          {isPlaying ? <Music className="w-6 h-6 animate-pulse" /> : <Music2 className="w-6 h-6" />}
        </button>
      )}

      <audio 
        ref={audioRef}
        src="/wedding-song.mp3"
        loop
      />

      <AnimatePresence>
        {!isOpen ? (
          /* --- Cover Screen --- */
          <motion.div 
            key="cover"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pink-50 p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 border-2 border-pink-200 rounded-full -m-8 animate-pulse" />
              <Heart className="w-16 h-16 text-pink-400 mx-auto mb-8 fill-pink-100" />
            </motion.div>

            <h2 className="font-serif text-xl tracking-[0.3em] uppercase text-pink-600 mb-4">The Wedding of</h2>
            <h1 className="font-script text-7xl sm:text-8xl text-pink-700 mb-8">Aulia & Jarwal</h1>
            
            <div className="max-w-md mx-auto mb-12">
              <p className="font-serif italic text-pink-800 leading-relaxed text-lg">
                "Jika waktu adalah rahasia-Mu, maka biarlah aku menjadi hamba yang setia yang tetap percaya, bahwa doa tidak pernah mengetuk pintu yang salah, hanya saja amin-nya sedang Kau titipkan pada waktu yang paling indah"
              </p>
            </div>

            <button 
              onClick={handleOpen}
              className="px-10 py-4 bg-pink-600 text-white rounded-full font-serif tracking-widest uppercase hover:bg-pink-700 transition-all shadow-xl hover:shadow-pink-200 flex items-center gap-3 group"
            >
              Buka Undangan
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          /* --- Main Content --- */
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            {/* Hero Section */}
            <Section className="bg-gradient-to-b from-pink-100 to-pink-50">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-2xl"
              >
                <Heart className="w-12 h-12 text-pink-400 mx-auto mb-6" />
                <h2 className="font-serif text-2xl text-pink-600 mb-4 italic">Assalamu'alaikum Wr. Wb.</h2>
                <p className="font-serif text-pink-800 mb-12 leading-relaxed">
                  Maha Suci Allah yang telah menciptakan mahluk-Nya berpasang-pasangan. 
                  Ya Allah semoga Engkau memberkahi pernikahan kami.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6">
                      <img src="/bride.jpg" alt="Bride" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/bride/400/400" }} referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="font-script text-4xl text-pink-700 mb-2">Aulia Ramadani</h3>
                    <p className="text-sm text-pink-600 font-medium">Putri dari Bapak ABD AZIZ & Ibu NABASIA</p>
                    <a href="https://www.instagram.com/dedeaul_?igsh=MWZmaDE4eG1oNjBrNQ==" target="_blank" rel="noopener noreferrer" className="mt-3 text-pink-400 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></a>
                  </div>

                  <span className="font-script text-5xl text-pink-300">&</span>

                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6">
                      <img src="/groom.jpg" alt="Groom" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/groom/400/400" }} referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="font-script text-4xl text-pink-700 mb-2">Jarwal</h3>
                    <p className="text-sm text-pink-600 font-medium">Putra dari Bapak H RAMLI & Ibu HJ HAWANG</p>
                    <a href="https://www.instagram.com/jarwall_09?igsh=MWVubnI2MW1scTUzMA==" target="_blank" rel="noopener noreferrer" className="mt-3 text-pink-400 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></a>
                  </div>
                </div>
              </motion.div>
            </Section>

            {/* Event Details */}
            <Section className="bg-white">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-50 to-transparent" />
              
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="glass-card p-12 rounded-[3rem] max-w-4xl w-full"
              >
                <h2 className="font-serif text-4xl text-pink-700 mb-12 tracking-widest uppercase">Save The Date</h2>
                
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-pink-50 rounded-2xl mb-4">
                        <Calendar className="w-8 h-8 text-pink-600" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-pink-800 mb-2 uppercase tracking-wider">Akad Nikah</h3>
                      <p className="font-serif text-pink-600">Sabtu, 4 April 2026</p>
                      <div className="flex items-center gap-2 mt-2 text-pink-600">
                        <Clock className="w-4 h-4" />
                        <span>10.00 - Selesai</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-pink-50 rounded-2xl mb-4">
                        <Heart className="w-8 h-8 text-pink-600" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-pink-800 mb-2 uppercase tracking-wider">Resepsi</h3>
                      <p className="font-serif text-pink-600">Sabtu, 4 April 2026</p>
                      <div className="flex items-center gap-2 mt-2 text-pink-600">
                        <Clock className="w-4 h-4" />
                        <span>12.00 - Selesai</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-pink-100 flex flex-col items-center">
                  <MapPin className="w-8 h-8 text-pink-600 mb-4" />
                  <h3 className="font-serif text-xl font-bold text-pink-800 mb-2">Lokasi Acara</h3>
                  <p className="font-serif text-pink-600 max-w-sm mb-6">
                    BTN PEPABRI SUDIANG BLOK E12/7
                  </p>
                  <button 
                    onClick={() => window.open('https://maps.app.goo.gl/DavZrebYAX4FPHXN6?g_st=awb', '_blank')}
                    className="px-8 py-3 bg-pink-600 text-white rounded-full font-serif tracking-widest uppercase hover:bg-pink-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Lihat Peta
                  </button>
                </div>
              </motion.div>
            </Section>

            {/* Gallery Section */}
            <Section className="bg-white">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-5xl w-full"
              >
                <Camera className="w-12 h-12 text-pink-400 mx-auto mb-6" />
                <h2 className="font-serif text-4xl text-pink-700 mb-4 tracking-widest uppercase">Our Gallery</h2>
                <p className="font-serif text-pink-600 mb-12 italic">Momen-momen indah perjalanan cinta kami</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-4">
                    <img src="https://picsum.photos/seed/love1/400/600" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 1" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/love2/400/400" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 2" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <img src="https://picsum.photos/seed/love3/400/400" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 3" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/love4/400/600" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 4" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-4">
                    <img src="https://picsum.photos/seed/love5/400/600" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 5" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/love6/400/400" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 6" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <img src="https://picsum.photos/seed/love7/400/400" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 7" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/love8/400/600" className="rounded-2xl w-full object-cover shadow-md hover:scale-[1.02] transition-transform" alt="Gallery 8" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </motion.div>
            </Section>

            {/* Love Story Section */}
            <Section className="bg-pink-50/50">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-3xl w-full"
              >
                <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-6" />
                <h2 className="font-serif text-4xl text-pink-700 mb-12 tracking-widest uppercase">Love Story</h2>
                
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-pink-200 before:to-transparent">
                  {[
                    { year: "2022", title: "Pertama Bertemu", desc: "Awal mula pertemuan yang tak disengaja namun berkesan." },
                    { year: "2023", title: "Menjalin Kasih", desc: "Memutuskan untuk melangkah bersama dalam suka dan duka." },
                    { year: "2025", title: "Lamaran", desc: "Satu langkah lebih dekat menuju janji suci pernikahan." }
                  ].map((story, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-pink-100 text-pink-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Heart size={16} fill="currentColor" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-pink-100 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-pink-800">{story.title}</div>
                          <time className="font-serif italic text-pink-400">{story.year}</time>
                        </div>
                        <div className="text-pink-600 text-sm">{story.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Section>

            {/* Countdown Section */}
            <Section className="bg-pink-100">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="font-serif text-3xl text-pink-700 mb-12 italic">Menuju Hari Bahagia</h2>
                <div className="flex justify-center items-center">
                  <CountdownItem value={timeLeft.days} label="Hari" />
                  <CountdownItem value={timeLeft.hours} label="Jam" />
                  <CountdownItem value={timeLeft.minutes} label="Menit" />
                  <CountdownItem value={timeLeft.seconds} label="Detik" />
                </div>
              </motion.div>
            </Section>

            {/* RSVP / Wish Section */}
            <Section className="bg-white">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-2xl w-full"
              >
                <MessageCircle className="w-12 h-12 text-pink-400 mx-auto mb-6" />
                <h2 className="font-serif text-4xl text-pink-700 mb-4 tracking-widest uppercase">Ucapan & Doa</h2>
                <p className="font-serif text-pink-600 mb-12">Berikan ucapan dan doa restu untuk kedua mempelai</p>
                
                <div className="space-y-4 text-left">
                  <input 
                    type="text" 
                    placeholder="Nama Anda" 
                    className="w-full px-6 py-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/50"
                  />
                  <textarea 
                    placeholder="Tulis ucapan anda..." 
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/50"
                  />
                  <button className="w-full py-4 bg-pink-600 text-white rounded-2xl font-serif tracking-widest uppercase hover:bg-pink-700 transition-all shadow-lg">
                    Kirim Ucapan
                  </button>
                </div>

                <div className="mt-12 space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {/* Ucapan akan muncul di sini */}
                  <div className="text-center py-8 text-pink-300 italic">
                    Belum ada ucapan...
                  </div>
                </div>
              </motion.div>
            </Section>

            {/* Wedding Gift */}
            <Section className="bg-pink-50">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-md w-full glass-card p-10 rounded-[2rem]"
              >
                <Gift className="w-12 h-12 text-pink-400 mx-auto mb-6" />
                <h2 className="font-serif text-3xl text-pink-700 mb-4 tracking-widest uppercase">Wedding Gift</h2>
                <p className="font-serif text-pink-600 mb-8">Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, dapat melalui:</p>
                
                <div className="space-y-6 max-w-sm mx-auto">
                  <div className="p-6 bg-white rounded-2xl border border-pink-100 shadow-sm relative group">
                    <p className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2">Dana</p>
                    <p className="text-xl font-serif font-bold text-pink-800">085756148415</p>
                    <p className="text-sm text-pink-600">a.n. Aulia Ramadani</p>
                    <button 
                      onClick={() => copyToClipboard('085756148415', 0)}
                      className="absolute top-4 right-4 p-2 text-pink-300 hover:text-pink-600 transition-colors"
                    >
                      {copiedIndex === 0 ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Section>

            {/* Footer */}
            <footer className="py-12 bg-pink-100 text-center">
              <h2 className="font-script text-4xl text-pink-700 mb-4">Aulia & Jarwal</h2>
              <p className="font-serif text-pink-600 text-sm tracking-widest uppercase">Terima Kasih</p>
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
          background: #fbcfe8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f9a8d4;
        }
      `}</style>
    </div>
  );
}
