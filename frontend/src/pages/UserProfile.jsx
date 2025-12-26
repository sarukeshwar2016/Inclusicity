import { useState } from 'react';
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import SOSButton from "../components/SOSButton";
import { motion } from "framer-motion";

const UserProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    city: '',
    bio: '',
    primaryNeeds: [],
    communicationPrefs: [],
    assistiveTools: [],
    emergencyName: '',
    emergencyPhone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile saved successfully! 🎉');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50 relative">
      <Navbar />
      <div className="flex pt-16">
        <SideBar />

        <motion.div
          className="flex-1"
          animate={{ marginLeft: "240px" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="px-6 py-12 max-w-5xl mx-auto">
            {/* Clean, welcoming header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
                Your Profile
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Share what feels right for you. Everything is optional and private — we’re here to support you better.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-12">

              {/* About You */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl">👤</span>
                  About You
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="fullName" className="block text-lg font-semibold text-gray-800 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferredName" className="block text-lg font-semibold text-gray-800 mb-3">
                      Preferred Name <span className="font-normal text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="preferredName"
                      name="preferredName"
                      value={formData.preferredName}
                      onChange={handleChange}
                      className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                      placeholder="How you'd like to be known in the community"
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-lg font-semibold text-gray-800 mb-3">
                      Date of Birth <span className="font-normal text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-lg font-semibold text-gray-800 mb-3">
                      City / Location <span className="font-normal text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                      placeholder="Helps us show nearby accessible places"
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <label htmlFor="bio" className="block text-lg font-semibold text-gray-800 mb-3">
                    About Me <span className="font-normal text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition resize-none"
                    placeholder="Your hobbies, passions, or what makes you smile..."
                  />
                </div>
              </section>

              {/* Support Needs */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">🤝</span>
                  How Can We Support You Better?
                </h2>
                <p className="text-lg text-gray-600 mb-10 max-w-3xl">
                  Choose any that apply. This helps us personalize your experience and match you with the right help.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <p className="text-xl font-semibold text-gray-800 mb-6">Accessibility Needs</p>
                    <div className="space-y-5">
                      {['Mobility / Wheelchair user', 'Low vision / Blind', 'Deaf / Hard of hearing', 'Speech impairment', 'Cognitive / Neurodivergent', 'Chronic illness / Limited stamina', 'Other', 'Prefer not to say'].map(need => (
                        <label key={need} className="flex items-center gap-5 cursor-pointer text-lg">
                          <input
                            type="checkbox"
                            name="primaryNeeds"
                            value={need}
                            checked={formData.primaryNeeds.includes(need)}
                            onChange={handleCheckbox}
                            className="w-7 h-7 text-indigo-600 rounded-lg focus:ring-indigo-500"
                          />
                          <span className="text-gray-800">{need}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xl font-semibold text-gray-800 mb-6">Preferred Communication</p>
                    <div className="space-y-5">
                      {['Voice (speaking & listening)', 'Text / Chat', 'Sign language (video)', 'Text-to-speech or captions needed', 'Other'].map(pref => (
                        <label key={pref} className="flex items-center gap-5 cursor-pointer text-lg">
                          <input
                            type="checkbox"
                            name="communicationPrefs"
                            value={pref}
                            checked={formData.communicationPrefs.includes(pref)}
                            onChange={handleCheckbox}
                            className="w-7 h-7 text-indigo-600 rounded-lg focus:ring-indigo-500"
                          />
                          <span className="text-gray-800">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Safety & Tools */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-2xl">🛡️</span>
                  Safety & Tools
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <p className="text-xl font-semibold text-gray-800 mb-6">
                      Emergency Contact <span className="font-normal text-gray-500">(Highly recommended for SOS)</span>
                    </p>
                    <input
                      type="text"
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleChange}
                      placeholder="Contact name"
                      className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl mb-5 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition"
                    />
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition"
                    />
                    <p className="mt-4 text-sm text-gray-600">
                      This information is encrypted and only used when you tap the SOS button.
                    </p>
                  </div>

                  <div>
                    <p className="text-xl font-semibold text-gray-800 mb-6">Assistive Tools You Use</p>
                    <div className="space-y-5">
                      {['Screen reader', 'Voice control', 'Braille display', 'Captioning/subtitles', 'Alternative keyboard/mouse', 'Hearing aids / Cochlear implant'].map(tool => (
                        <label key={tool} className="flex items-center gap-5 cursor-pointer text-lg">
                          <input
                            type="checkbox"
                            name="assistiveTools"
                            value={tool}
                            checked={formData.assistiveTools.includes(tool)}
                            onChange={handleCheckbox}
                            className="w-7 h-7 text-indigo-600 rounded-lg focus:ring-indigo-500"
                          />
                          <span className="text-gray-800">{tool}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Submit */}
              <div className="text-center py-8">
                <button
                  type="submit"
                  className="px-16 py-5 bg-gradient-to-r from-indigo-600 to-green-600 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-indigo-500/50 transition transform hover:scale-105"
                >
                  Save Profile
                </button>
                <p className="mt-8 text-lg text-gray-600">
                  You can update this anytime. Thank you for trusting us. ❤️
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <SOSButton />
    </div>
  );
};

export default UserProfile;