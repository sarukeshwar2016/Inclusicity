import HelperNavbar from '../components/HelperNavbar';
import HelperSidebar from '../components/HelperSidebar';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  MapPin,
  Power,
  Star,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelperHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 flex">
      {/* Sidebar */}
      <HelperSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-20 lg:ml-60 transition-all duration-300">
        <HelperNavbar />

        <div className="max-w-6xl mx-auto px-4 py-12 pt-28">
          
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              Welcome, Helper 👋
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You are part of a trusted network helping people live with dignity,
              independence, and confidence.
            </p>
          </motion.div>

          {/* HOW IT WORKS */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              How Helping Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Step
                icon={<Power />}
                title="Go Online"
                text="Turn on availability when you are ready to help."
              />
              <Step
                icon={<MapPin />}
                title="Receive Requests"
                text="See nearby requests based on your location."
              />
              <Step
                icon={<CheckCircle />}
                title="Accept & Assist"
                text="Accept only when you are confident you can help."
              />
              <Step
                icon={<Star />}
                title="Complete & Get Rated"
                text="Finish the task and receive honest feedback."
              />
            </div>
          </section>

          {/* RESPONSIBILITIES */}
          <section className="mb-20 bg-white rounded-2xl shadow-xl p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Your Responsibilities
            </h2>

            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-600 mt-1" />
                Respect user privacy and dignity at all times
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-600 mt-1" />
                Be punctual and communicate clearly
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-600 mt-1" />
                Accept requests only when you can commit
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-600 mt-1" />
                Cancel early if you cannot complete a task
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-600 mt-1" />
                Never ask for extra money or favors
              </li>
            </ul>
          </section>

          {/* DASHBOARD EXPLANATION */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              What You’ll See in Your Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InfoCard
                title="Pending Requests"
                text="Requests you can choose to accept when online."
              />
              <InfoCard
                title="Accepted Requests"
                text="Tasks you are currently responsible for."
              />
              <InfoCard
                title="Ratings & Reviews"
                text="Feedback from users you’ve helped."
              />
            </div>
          </section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={() => navigate('/helper/dashboard')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition"
            >
              Go to Helper Dashboard
              <ArrowRight size={22} />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

/* ---------------- SMALL COMPONENTS ---------------- */

const Step = ({ icon, title, text }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
    <div className="flex justify-center mb-4 text-indigo-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

const InfoCard = ({ title, text }) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default HelperHome;
