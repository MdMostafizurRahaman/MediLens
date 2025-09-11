'use client'

import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Navigation */}
      <Navigation />
      
      {/* Enhanced Background Elements - positioned below navbar with proper z-index */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-32 right-10 w-96 h-96 bg-gradient-to-br from-primary-200/10 to-secondary-200/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-10 w-80 h-80 bg-gradient-to-tr from-accent-200/10 to-success-200/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-2/3 right-1/3 w-64 h-64 bg-gradient-to-bl from-warning-200/10 to-error-200/10 rounded-full blur-2xl"
          animate={{
            y: [0, -30, 30, 0],
            x: [0, 20, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content with proper spacing from navbar */}
      <div className="relative z-20 pt-20">
        <Hero />
        
        {/* Enhanced Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-30"
        >
          <Features />
        </motion.div>

        {/* Statistics Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
          <div className="container-professional relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join the growing community of users who trust MediLens for their healthcare needs
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '10,000+', label: 'Users Served', icon: '👥', color: 'from-success-400 to-success-600' },
                { number: '50,000+', label: 'Prescriptions Analyzed', icon: '📋', color: 'from-warning-400 to-warning-600' },
                { number: '99.9%', label: 'Accuracy Rate', icon: '🎯', color: 'from-accent-400 to-accent-600' },
                { number: '24/7', label: 'AI Support', icon: '🤖', color: 'from-error-400 to-error-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className={`card-professional bg-gradient-to-br ${stat.color} text-white p-6 text-center relative overflow-hidden group`}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <motion.div 
                    className="text-4xl mb-3 relative z-10"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      delay: index * 0.5,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.h3 
                    className="text-3xl text-black font-bold mb-2 relative z-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    {stat.number}
                  </motion.h3>
                  <p className="text-black/90 relative z-10 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          className="py-20 bg-gradient-to-br from-secondary-50 to-accent-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container-professional">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real feedback from people who have transformed their healthcare experience with MediLens
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'রহিম আহমেদ',
                  role: 'Patient',
                  text: 'MediLens helped me understand my prescription completely. The Bangla translation was perfect!',
                  rating: 5,
                  avatar: '👨'
                },
                {
                  name: 'ফাতিমা খাতুন',
                  role: 'Caregiver',
                  text: 'As a caregiver for elderly parents, this app has been a lifesaver. So easy to use!',
                  rating: 5,
                  avatar: '👩'
                },
                {
                  name: 'ডা. করিম হাসান',
                  role: 'Doctor',
                  text: 'I recommend MediLens to my patients. It helps them follow prescriptions correctly.',
                  rating: 5,
                  avatar: '👨‍⚕️'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="card-professional bg-white p-6 relative overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-warning-500 text-lg">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
