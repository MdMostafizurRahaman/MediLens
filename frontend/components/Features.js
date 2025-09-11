'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Features() {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    {
      icon: '🔍',
      title: 'OCR-Based Medical Report Analysis',
      description: 'Upload prescriptions or test reports (image/PDF). Extracted content is translated and presented in Bangla. Works with both printed and handwritten formats.',
      bengali: 'প্রেসক্রিপশন বা টেস্ট রিপোর্ট আপলোড করুন (ছবি/PDF)। বাংলায় অনুবাদ করা হয়।',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      icon: '💬',
      title: 'Bangla Chatbot with Medical Intelligence',
      description: 'Patients can ask questions about their health, prescriptions, or tests. The chatbot responds in natural Bangla.',
      bengali: 'স্বাস্থ্য, প্রেসক্রিপশন বা টেস্ট সম্পর্কে প্রশ্ন করুন। চ্যাটবট বাংলায় উত্তর দেয়।',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      icon: '📊',
      title: 'Vital Signs Interpretation',
      description: 'Input vital signs like Blood Pressure, Temperature, Heart Rate, SpO₂. System analyzes and gives a simple Bangla summary.',
      bengali: 'রক্তচাপ, তাপমাত্রা, হার্ট রেট, SpO₂ ইনপুট করুন। সিস্টেম বাংলায় সহজ সারসংক্ষেপ দেয়।',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600'
    },
    {
      icon: '💊',
      title: 'Drug Side Effect Explanation',
      description: 'Shows common side effects in Bangla and provides basic dos and don\'ts for associated conditions.',
      bengali: 'ওষুধের পার্শ্বপ্রতিক্রিয়া বাংলায় দেখায় এবং করণীয়-বর্জনীয় পরামর্শ দেয়।',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600'
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor Directory',
      description: 'Browse or search verified doctors. Filter by specialization, location, availability with degrees and experience.',
      bengali: 'যাচাইকৃত ডাক্তারদের তালিকা। বিশেষত্ব, অবস্থান, সময়সূচী অনুযায়ী খুঁজুন।',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-600'
    },
    {
      icon: '📄',
      title: 'PDF Report & Chat Export',
      description: 'All prescription analysis and chatbot conversations can be exported as PDF for keeping medical records.',
      bengali: 'সব প্রেসক্রিপশন বিশ্লেষণ এবং চ্যাটবট কথোপকথন PDF হিসেবে রপ্তানি করুন।',
      color: 'from-teal-500 to-green-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-600'
    }
  ]

  const uniqueFeatures = [
    {
      icon: '🤖',
      title: 'AI + Language',
      description: 'Personalized responses in Bangla',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: '📋',
      title: 'Prescription Understanding',
      description: 'No need to decode handwriting',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: '❤️',
      title: 'Care Beyond Translation',
      description: 'Advice, side effects, explanations',
      color: 'from-pink-400 to-pink-600'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'All data stays with you',
      color: 'from-purple-400 to-purple-600'
    }
  ]

  return (
    <div className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          >
            <span className="text-6xl">⚡</span>
          </motion.div>
          <h2 className="text-responsive-lg text-gradient font-display mb-8">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive medical assistance powered by AI and designed specifically for Bangladesh's healthcare ecosystem
          </p>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mt-6 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          />
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={`card-enhanced ${feature.bgColor} border-2 ${feature.borderColor} relative group cursor-pointer`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)"
              }}
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              {/* Gradient Overlay */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 rounded-2xl`}
                animate={{ opacity: hoveredFeature === index ? 0.1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              
              <div className="card-body p-8 relative z-10">
                <motion.div 
                  className="text-5xl mb-6 text-center"
                  animate={{ 
                    scale: hoveredFeature === index ? 1.2 : 1,
                    rotate: hoveredFeature === index ? 10 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                
                <h3 className={`card-title ${feature.textColor} mb-4 text-xl font-bold text-center`}>
                  {feature.title}
                </h3>
                
                <p className="text-white mb-6 leading-relaxed text-center">
                  {feature.description}
                </p>
                
                <div className="divider my-4"></div>
                
                <motion.div
                  className={`p-4 ${feature.bgColor} rounded-xl border ${feature.borderColor}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={`text-sm ${feature.textColor} font-medium bangla-text text-center`}>
                    {feature.bengali}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* What Makes MediLens Unique Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-responsive-md text-gradient font-display mb-12">
            What Makes MediLens Unique?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {uniqueFeatures.map((unique, index) => (
              <motion.div 
                key={index}
                className="stat-enhanced hover:scale-105 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <motion.div 
                  className={`stat-figure text-5xl mb-4 bg-gradient-to-br ${unique.color} bg-clip-text text-transparent`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {unique.icon}
                </motion.div>
                
                <div className={`stat-title text-gray-800 font-bold text-lg mb-3 group-hover:bg-gradient-to-r ${unique.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                  {unique.title}
                </div>
                
                <div className="stat-desc text-gray-600 text-base leading-relaxed">
                  {unique.description}
                </div>

                {/* Hover Effect Border */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${unique.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="glass-effect p-8 rounded-3xl max-w-2xl mx-auto"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Transform Your Healthcare Experience?
            </h4>
            <p className="text-gray-600 mb-6">
              Join thousands of users who trust MediLens for their medical needs
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.a
                href="/google-lens-test"
                className="btn btn-enhanced btn-lg px-8 shadow-glow-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl mr-2">🚀</span>
                Start Analysis Now
              </motion.a>
              <motion.a
                href="/chat"
                className="btn btn-outline btn-lg px-8 border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl mr-2">💬</span>
                Chat with AI
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
