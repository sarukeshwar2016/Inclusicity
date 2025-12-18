import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
            <span className="text-indigo-600">Inclusi</span>
            <span className="text-green-600">City</span>
          </Link>

          <div className="flex gap-3">
            <Link
              to="/login"
              aria-label="Login to InclusiCity"
              className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Login
            </Link>
            <Link
              to="/signup/helper"
              aria-label="Become a helper"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Become a Helper
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 leading-tight">
            A city that supports
            <span className="block text-indigo-600 mt-2">everyone.</span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            InclusiCity connects people with disabilities and seniors to verified helpers nearby —
            for daily assistance, mobility, and companionship.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              aria-label="Request support"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Request support
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/signup/helper"
              aria-label="Volunteer nearby"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-pink-600 hover:bg-pink-50 rounded-xl font-semibold transition focus-visible:ring-2 focus-visible:ring-pink-300"
            >
              Volunteer nearby
              <Heart size={20} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How it Works - Extended */}
      {/* How it Works - Redesigned Features */}
<section className="py-28 px-6 bg-white">
  <div className="max-w-6xl mx-auto">
    <motion.h2
      className="text-4xl font-semibold text-center text-gray-900 mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
    >
      How InclusiCity works
    </motion.h2>

    <motion.div
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      {[
        {
          icon: <MapPin size={36} className="text-teal-600" />,
          title: 'Accessible Smart Map',
          desc: 'Navigation map highlighting wheelchair-friendly routes, accessible buildings, transport options, and support points.',
          color: 'bg-teal-50'
        },
        {
          icon: <Users size={36} className="text-indigo-600" />,
          title: 'Volunteer Assistance',
          desc: 'Book verified volunteers for errands, mobility, or personal assistance safely and respectfully.',
          color: 'bg-indigo-50'
        },
        {
          icon: <Heart size={36} className="text-pink-600" />,
          title: 'Social Meetups',
          desc: 'Organize or join meetups and activities designed to reduce isolation and build belonging.',
          color: 'bg-pink-50'
        },
        {
          icon: <Shield size={36} className="text-purple-600" />,
          title: 'NGO-certified Network',
          desc: 'Volunteers are verified and trained via partnered NGOs to ensure safety and reliability.',
          color: 'bg-purple-50'
        }
      ].map((item, i) => (
        <motion.div
          key={i}
          className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300"
          variants={fadeUp}
        >
          <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
            {item.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600 text-base">{item.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>


      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-16">Trusted by communities</h2>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { quote: 'InclusiCity helped my mother attend appointments with dignity.', name: 'Caregiver, Chennai' },
              { quote: 'Volunteering here feels meaningful and well-structured.', name: 'Verified Volunteer' },
              { quote: 'NGO-backed safety gave us confidence from day one.', name: 'Partner NGO' }
            ].map((t, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition"
                variants={fadeUp}
              >
                <p className="text-gray-700 italic mb-4">“{t.quote}”</p>
                <span className="text-sm font-semibold text-gray-500">— {t.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-semibold mb-6">Make your city more inclusive</h2>
          <p className="text-xl opacity-90 mb-10">One request. One helper. One act of kindness.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-gray-100 transition">Get started</Link>
            <Link to="/signup/helper" className="px-8 py-4 border border-white rounded-xl font-semibold hover:bg-white/10 transition">Become a volunteer</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 bg-white border-t">
        © {new Date().getFullYear()} InclusiCity · Built for accessibility and dignity
      </footer>
    </div>
  );
}
