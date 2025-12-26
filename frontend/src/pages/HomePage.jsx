import { Link } from 'react-router-dom';
import { 
  ArrowRight, Heart, Shield, Users, MapPin, UserPlus, 
  Bell, Mic, CheckCircle, Lock, AlertCircle, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tight">
            <span className="text-indigo-600">INCLUSI</span>
            <span className="text-emerald-600">CITY</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-slate-600 font-bold text-sm hover:text-indigo-600 transition">LOGIN</Link>
            <Link to="/signup/helper" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">
              BECOME A HELPER
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Mesh Gradient */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-100 blur-[120px] rounded-full"></div>
        </div>

        <motion.div 
          className="max-w-5xl mx-auto text-center relative z-10"
          initial="hidden" animate="visible" variants={fadeUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 uppercase tracking-widest">
            <Sparkles size={14} /> Redefining Urban Accessibility
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-8">
            A city that looks <br />
            <span className="text-indigo-600">after its own.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Connecting seniors and people with disabilities to verified NGO volunteers 
            through real-time tracking, secure SOS systems, and digital dignity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="group px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl">
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Section - Dark Background Block */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-4xl font-bold mb-6">User Core Features</h2>
              <p className="text-slate-400 text-lg mb-8">Specifically designed interfaces for clarity, speed, and emergency response.</p>
              <div className="w-20 h-1 bg-emerald-500"></div>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {[
                { icon: <Bell className="text-red-400" />, title: "SOS Emergency", desc: "One-tap alerts with JWT protection directly to admins." },
                { icon: <MapPin className="text-emerald-400" />, title: "Live Map", desc: "See verified helpers nearby with real-time location sync." },
                { icon: <Mic className="text-indigo-400" />, title: "Voice Rooms", desc: "WebRTC powered communication for social and tech support." },
                { icon: <CheckCircle className="text-blue-400" />, title: "Rating System", desc: "Build trust through community-driven helper reviews." }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500 transition">
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Helper & Trust Section - Indigo Background Block */}
      <section className="py-24 px-6 bg-indigo-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" variants={fadeUp}>
            <h2 className="text-4xl font-black text-white mb-8">The Helper Network</h2>
            <div className="space-y-4">
              {[
                { icon: <Shield />, title: "NGO Verification", text: "Mandatory ID and certificate checks." },
                { icon: <Lock />, title: "Single Active Task", text: "Helpers focus on one user at a time for safety." },
                { icon: <Users />, title: "Admin Controlled", text: "Every helper is manually vetted before going online." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                  <div className="mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-indigo-100 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="bg-white rounded-[2rem] p-10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 italic">IMG</div>
                <div>
                  <p className="font-bold text-slate-900">Verified Volunteer</p>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Active Now</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-indigo-600">4.9</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Rating</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
              <div className="pt-6 flex gap-2">
                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold tracking-tighter uppercase">Physical Help</div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold tracking-tighter uppercase">Tech Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel Feature */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="mx-auto text-red-500 mb-6" size={48} />
          <h2 className="text-4xl font-black text-slate-900 mb-6">Uncompromising Safety</h2>
          <p className="text-lg text-slate-600 mb-12 leading-relaxed">
            Our Admin Dashboard provides real-time oversight of every SOS alert and voice room. 
            We maintain platform integrity through manual helper vetting and active moderation.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['SOS Alerts', 'Helper Vetting', 'Voice Control', 'User Analytics'].map((label, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-700 text-sm">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-8">INCLUSI<span className="text-emerald-500">CITY</span></h2>
          <div className="flex justify-center gap-8 mb-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition">NGO Partners</span>
            <span className="hover:text-white cursor-pointer transition">Accessibility</span>
            <span className="hover:text-white cursor-pointer transition">Safety</span>
          </div>
          <div className="pt-8 border-t border-slate-800 text-slate-500 text-xs">
            © {new Date().getFullYear()} InclusiCity Platform. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}