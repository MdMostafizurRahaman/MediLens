'use client'

import { motion } from 'framer-motion'

export default function Features() {
  const features = [
    {
      icon: '🔍',
      title: 'OCR-Based Medical Report Analysis',
      description: 'Upload prescriptions or test reports (image/PDF). Extracted content is translated and presented in Bangla. Works with both printed and handwritten formats.',
      bengali: 'প্রেসক্রিপশন বা টেস্ট রিপোর্ট আপলোড করুন (ছবি/PDF)। বাংলায় অনুবাদ করা হয়।'
    },
    {
      icon: '💬',
      title: 'Bangla Chatbot with Medical Intelligence',
      description: 'Patients can ask questions about their health, prescriptions, or tests. The chatbot responds in natural Bangla.',
      bengali: 'স্বাস্থ্য, প্রেসক্রিপশন বা টেস্ট সম্পর্কে প্রশ্ন করুন। চ্যাটবট বাংলায় উত্তর দেয়।'
    },
    {
      icon: '📊',
      title: 'Vital Signs Interpretation',
      description: 'Input vital signs like Blood Pressure, Temperature, Heart Rate, SpO₂. System analyzes and gives a simple Bangla summary.',
      bengali: 'রক্তচাপ, তাপমাত্রা, হার্ট রেট, SpO₂ ইনপুট করুন। সিস্টেম বাংলায় সহজ সারসংক্ষেপ দেয়।'
    },
    {
      icon: '💊',
      title: 'Drug Side Effect Explanation',
      description: 'Shows common side effects in Bangla and provides basic dos and don\'ts for associated conditions.',
      bengali: 'ওষুধের পার্শ্বপ্রতিক্রিয়া বাংলায় দেখায় এবং করণীয়-বর্জনীয় পরামর্শ দেয়।'
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor Directory',
      description: 'Browse or search verified doctors. Filter by specialization, location, availability with degrees and experience.',
      bengali: 'যাচাইকৃত ডাক্তারদের তালিকা। বিশেষত্ব, অবস্থান, সময়সূচী অনুযায়ী খুঁজুন।'
    },
    {
      icon: '📄',
      title: 'PDF Report & Chat Export',
      description: 'All prescription analysis and chatbot conversations can be exported as PDF for keeping medical records.',
      bengali: 'সব প্রেসক্রিপশন বিশ্লেষণ এবং চ্যাটবট কথোপকথন PDF হিসেবে রপ্তানি করুন।'
    }
  ]

  return (
    <div className="py-20 bg-base-200">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Key Features
          </h2>
          <p className="text-xl text-base-content/80 max-w-2xl mx-auto">
            Comprehensive medical assistance powered by AI and designed for Bangladesh
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="card-body">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="card-title text-primary mb-3">{feature.title}</h3>
                <p className="text-base-content/80 mb-3">{feature.description}</p>
                <div className="divider"></div>
                <p className="text-sm text-accent font-medium">{feature.bengali}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-primary">What Makes MediLens Unique?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
            <motion.div 
              className="stat bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 p-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stat-figure text-blue-600 text-4xl mb-3">🤖</div>
              <div className="stat-title text-blue-800 font-bold text-lg mb-2">AI + Language</div>
              <div className="stat-desc text-blue-700 text-base">Personalized responses in Bangla</div>
            </motion.div>
            <motion.div 
              className="stat bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 p-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stat-figure text-green-600 text-4xl mb-3">📋</div>
              <div className="stat-title text-green-800 font-bold text-lg mb-2">Prescription Understanding</div>
              <div className="stat-desc text-green-700 text-base">No need to decode handwriting</div>
            </motion.div>
            <motion.div 
              className="stat bg-gradient-to-br from-pink-50 to-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200 p-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stat-figure text-pink-600 text-4xl mb-3">❤️</div>
              <div className="stat-title text-pink-800 font-bold text-lg mb-2">Care Beyond Translation</div>
              <div className="stat-desc text-pink-700 text-base">Advice, side effects, explanations</div>
            </motion.div>
            <motion.div 
              className="stat bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200 p-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stat-figure text-purple-600 text-4xl mb-3">🔒</div>
              <div className="stat-title text-purple-800 font-bold text-lg mb-2">Secure & Private</div>
              <div className="stat-desc text-purple-700 text-base">All data stays with you</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
