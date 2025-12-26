import { Link } from 'react-router-dom';
import { 
  ArrowRight, Heart, Shield, Users, MapPin, UserPlus, 
  Bell, Mic, CheckCircle, Lock, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: { 
    transition: { 
      staggerChildren: 0.12,
      delayChildren: 0.2
    } 
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const slideIn = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tight group">
            <span className="text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300">INCLUSI</span>
            <span className="text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">CITY</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              to="/login" 
              className="text-slate-600 font-bold text-sm hover:text-indigo-600 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              LOGIN
            </Link>
            <Link 
              to="/signup/helper" 
              className="group relative px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm overflow-hidden shadow-lg shadow-indigo-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300/50 hover:-translate-y-0.5"
            >
              <span className="relative z-10">BECOME A HELPER</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Mesh Gradient */}
      <section ref={heroRef} className="relative pt-44 pb-32 px-6 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-indigo-50/30">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-200 to-indigo-300 blur-[120px] rounded-full"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100 to-emerald-200 blur-[120px] rounded-full"
          ></motion.div>
          <motion.div 
            animate={{ 
              y: [0, 100, 0],
              x: [0, 50, 0],
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-violet-200/50 to-purple-300/50 blur-[100px] rounded-full"
          ></motion.div>
        </div>

        <motion.div 
          style={{ y: smoothY, opacity, scale }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200/50 text-indigo-700 text-xs font-bold mb-8 uppercase tracking-widest shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={14} />
            </motion.div>
            Redefining Urban Accessibility
          </motion.div>
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tight"
          >
            A city that looks <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                after its own.
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-2 left-0 right-0 h-3 bg-indigo-200/40 -z-10 origin-left"
              ></motion.div>
            </span>
          </motion.h1>
          
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
              }
            }}
            className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12 font-light"
          >
            Connecting seniors and people with disabilities to verified NGO volunteers 
            through real-time tracking, secure SOS systems, and digital dignity.
          </motion.p>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
              }
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/signup" 
              className="group relative px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started 
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              ></motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-[10%] w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl hidden lg:block"
        ></motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute bottom-1/4 right-[10%] w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full backdrop-blur-sm border border-white/20 shadow-xl hidden lg:block"
        ></motion.div>
      </section>

      {/* Feature Section - Dark Background Block */}
      <section className="py-32 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="grid lg:grid-cols-3 gap-16">
            <motion.div variants={fadeUp} className="lg:col-span-1">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 mb-8 rounded-full"
              ></motion.div>
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
                User Core Features
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed font-light">
                Specifically designed interfaces for clarity, speed, and emergency response.
              </p>
            </motion.div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {[
                { icon: <Bell className="text-red-400" size={28} />, title: "SOS Emergency", desc: "One-tap alerts with JWT protection directly to admins.", color: "red" },
                { icon: <MapPin className="text-emerald-400" size={28} />, title: "Live Map", desc: "See verified helpers nearby with real-time location sync.", color: "emerald" },
                { icon: <Mic className="text-indigo-400" size={28} />, title: "Voice Rooms", desc: "WebRTC powered communication for social and tech support.", color: "indigo" },
                { icon: <CheckCircle className="text-blue-400" size={28} />, title: "Rating System", desc: "Build trust through community-driven helper reviews.", color: "blue" }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                  }}
                  className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 backdrop-blur-xl overflow-hidden shadow-xl hover:shadow-2xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${f.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <motion.div 
                    className="mb-6 relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {f.icon}
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 relative z-10">{f.title}</h3>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed relative z-10">{f.desc}</p>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/5 to-transparent rounded-tl-full transform translate-x-16 translate-y-16 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Helper & Trust Section - Indigo Background Block */}
      <section className="py-32 px-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 relative overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl"
        ></motion.div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeUp}
              className="text-5xl md:text-6xl font-black text-white mb-12 leading-tight"
            >
              The Helper Network
            </motion.h2>
            <div className="space-y-6">
              {[
                { icon: <Shield size={28} />, title: "NGO Verification", text: "Mandatory ID and certificate checks." },
                { icon: <Lock size={28} />, title: "Single Active Task", text: "Helpers focus on one user at a time for safety." },
                { icon: <Users size={28} />, title: "Admin Controlled", text: "Every helper is manually vetted before going online." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={slideIn}
                  whileHover={{ 
                    x: 10,
                    transition: { duration: 0.3 }
                  }}
                  className="group flex gap-6 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 text-white transition-all duration-300 hover:bg-white/15 hover:border-white/30 shadow-lg hover:shadow-2xl"
                >
                  <motion.div 
                    className="mt-1 flex-shrink-0"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-indigo-100 leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-bold text-slate-400 italic shadow-inner text-lg"
                >
                  IMG
                </motion.div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">Verified Volunteer</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Active Now</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <motion.p 
                  className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-indigo-800 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  4.9
                </motion.p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Rating</p>
              </div>
            </div>
            
            <div className="space-y-5 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '75%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="h-5 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full shadow-inner"
              ></motion.div>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '50%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-5 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full shadow-inner"
              ></motion.div>
              
              <div className="pt-8 flex gap-3 flex-wrap">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 rounded-xl text-xs font-bold tracking-tight uppercase shadow-sm"
                >
                  Physical Help
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600 rounded-xl text-xs font-bold tracking-tight uppercase shadow-sm"
                >
                  Tech Support
                </motion.div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-indigo-100/50 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-2xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Admin Panel Feature */}
      <section className="py-32 px-6 bg-gradient-to-br from-white via-slate-50 to-white relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-xl"
          >
            <AlertCircle className="text-red-600" size={40} />
          </motion.div>
          
          <motion.h2 
            variants={fadeUp}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-tight"
          >
            Uncompromising Safety
          </motion.h2>
          
          <motion.p 
            variants={fadeUp}
            className="text-lg md:text-xl text-slate-600 mb-16 leading-relaxed max-w-3xl mx-auto font-light"
          >
            Our Admin Dashboard provides real-time oversight of every SOS alert and voice room. 
            We maintain platform integrity through manual helper vetting and active moderation.
          </motion.p>
          
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {['SOS Alerts', 'Helper Vetting', 'Voice Control', 'User Analytics'].map((label, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ 
                  y: -8,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="group relative p-6 md:p-8 bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 font-bold text-slate-700 text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <span className="relative z-10">{label}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-indigo-100/30 to-transparent rounded-tl-full transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black mb-12"
          >
            INCLUSI<span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">CITY</span>
          </motion.h2>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12 text-slate-400 text-sm font-bold uppercase tracking-widest"
          >
            {['NGO Partners', 'Accessibility', 'Safety'].map((item, i) => (
              <motion.span 
                key={i}
                variants={fadeIn}
                className="hover:text-white cursor-pointer transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full pb-1"
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="pt-8 border-t border-slate-800 text-slate-500 text-xs md:text-sm"
          >
            © {new Date().getFullYear()} InclusiCity Platform. All Rights Reserved.
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
