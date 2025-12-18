import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Users, MapPin, UserPlus } from 'lucide-react';
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold">
            <span className="text-indigo-600">Inclusi</span>
            <span className="text-green-600">City</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-gray-600 font-medium hover:text-indigo-600 transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="text-gray-600 font-medium hover:text-indigo-600 transition"
            >
              Sign up
            </Link>

            <Link
              to="/signup/helper"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full 
                         font-semibold hover:bg-indigo-700 transition shadow"
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
            InclusiCity is a civic-tech platform designed to work with NGOs and
            local organizations to connect seniors and people with disabilities
            to verified helpers — safely and with dignity.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 
                         bg-indigo-600 text-white rounded-xl font-semibold 
                         hover:bg-indigo-700 transition"
            >
              Create account
              <UserPlus size={20} />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 
                         bg-white text-gray-800 rounded-xl font-semibold 
                         hover:bg-gray-100 transition border"
            >
              Login
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/signup/helper"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 
                         text-pink-600 hover:bg-pink-50 rounded-xl font-semibold transition"
            >
              Volunteer nearby
              <Heart size={20} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Institutional Context */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Designed for real-world adoption
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            InclusiCity is built as an NGO-integrated system. Helpers are verified
            through partner organizations, ensuring trust, accountability, and
            safety. This project demonstrates how accessibility platforms are
            structured before large-scale deployment.
          </p>
        </div>
      </section>

      {/* How it Works */}
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
                desc: 'Wheelchair-friendly routes and accessible locations.',
                color: 'bg-teal-50'
              },
              {
                icon: <Users size={36} className="text-indigo-600" />,
                title: 'Volunteer Assistance',
                desc: 'Book verified helpers safely and respectfully.',
                color: 'bg-indigo-50'
              },
              {
                icon: <Heart size={36} className="text-pink-600" />,
                title: 'Social Meetups',
                desc: 'Reduce isolation and build belonging.',
                color: 'bg-pink-50'
              },
              {
                icon: <Shield size={36} className="text-purple-600" />,
                title: 'NGO-certified Network',
                desc: 'Verified volunteers via trusted NGOs.',
                color: 'bg-purple-50'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 text-center shadow-md 
                           hover:shadow-xl hover:scale-105 transition"
                variants={fadeUp}
              >
                <div className={`w-16 h-16 ${item.color} rounded-xl 
                                 flex items-center justify-center mx-auto mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-semibold mb-6">
            Make your city more inclusive
          </h2>
          <p className="text-xl opacity-90 mb-10">
            One request. One helper. One act of kindness.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-indigo-700 rounded-xl 
                         font-semibold hover:bg-gray-100 transition"
            >
              Sign up as user
            </Link>
            <Link
              to="/signup/helper"
              className="px-8 py-4 border border-white rounded-xl 
                         font-semibold hover:bg-white/10 transition"
            >
              Become a volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 bg-white border-t">
        © {new Date().getFullYear()} InclusiCity · NGO-integrated accessibility platform (Prototype)
      </footer>
    </div>
  );
}
