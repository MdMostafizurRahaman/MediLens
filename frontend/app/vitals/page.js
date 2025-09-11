'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import BackButton from "../../components/BackButton";
import Navigation from '@/components/Navigation';

export default function VitalsPage() {
  const [vitals, setVitals] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    temperature: '',
    heartRate: '',
    oxygenSaturation: '',
    respiratoryRate: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();

  const handleChange = (field, value) => {
    if (field === 'bloodPressure') {
      setVitals(prev => ({
        ...prev,
        bloodPressure: { ...prev.bloodPressure, ...value }
      }));
    } else {
      setVitals(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const analyzeVitals = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { bloodPressure, temperature, heartRate, oxygenSaturation, respiratoryRate } = vitals;
    
    const systolic = parseInt(bloodPressure.systolic);
    const diastolic = parseInt(bloodPressure.diastolic);
    const temp = parseFloat(temperature);
    const hr = parseInt(heartRate);
    const o2 = parseFloat(oxygenSaturation);
    const rr = parseInt(respiratoryRate);
    
    const warnings = [];
    
    // Blood pressure analysis
    if (systolic > 140 || diastolic > 90) {
      warnings.push('উচ্চ রক্তচাপ পরিলক্ষিত - চিকিৎসকের পরামর্শ নিন');
    } else if (systolic < 90 || diastolic < 60) {
      warnings.push('নিম্ন রক্তচাপ পরিলক্ষিত - চিকিৎসকের পরামর্শ নিন');
    }
    
    // Temperature analysis
    if (temp > 37.5) {
      warnings.push('জ্বর রয়েছে - বিশ্রাম নিন এবং প্রয়োজনে চিকিৎসকের পরামর্শ নিন');
    } else if (temp < 36.0) {
      warnings.push('শরীরের তাপমাত্রা কম - গরম পোশাক পরুন');
    }
    
    // Heart rate analysis
    if (hr > 100) {
      warnings.push('হৃদস্পন্দন দ্রুত - বিশ্রাম নিন এবং প্রয়োজনে চিকিৎসকের পরামর্শ নিন');
    } else if (hr < 60) {
      warnings.push('হৃদস্পন্দন ধীর - যদি লক্ষণ থাকে তাহলে চিকিৎসকের পরামর্শ নিন');
    }
    
    // Oxygen saturation analysis
    if (o2 < 95) {
      warnings.push('অক্সিজেনের মাত্রা কম - অবিলম্বে চিকিৎসকের পরামর্শ নিন');
    }
    
    setResult({
      vitals,
      warnings,
      timestamp: new Date(),
      summary: warnings.length === 0 ? 'আপনার সকল চিহ্ন স্বাভাবিক রয়েছে' : `${warnings.length}টি বিষয়ে সতর্কতা প্রয়োজন`
    });
    setLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        <Navigation />
        <motion.div 
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card-professional p-12 max-w-md mx-auto">
            <motion.div 
              className="text-8xl mb-6"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              🔐
            </motion.div>
            <h1 className="text-3xl font-bold text-white text-gradient-primary mb-4">Login Required</h1>
            <p className="text-white mb-6 text-lg">Please log in to access vital signs monitoring</p>
            <motion.a 
              href="/auth/login" 
              className="btn-professional-primary inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚪 Login Now
            </motion.a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-accent-200/20 to-success-200/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Navigation />
      
      <div className="pt-24 pb-12 relative z-10">
        <div className="container-professional">
          {/* Enhanced Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BackButton />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
              🩺 Vital Signs Monitor
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your essential health metrics with AI-powered insights
            </p>
            <motion.div
              className="h-1 w-32 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mt-6"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.div>

          {result && (
            <motion.div 
              className="mb-8 card-professional p-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-accent-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
                  📊
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gradient-success">Analysis Results</h2>
                  <p className="text-gray-600">Generated at {result.timestamp.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-success-50 to-primary-50 p-6 rounded-xl border border-success-200 mb-6">
                <h3 className="font-semibold text-success-800 text-lg mb-2">📋 Summary</h3>
                <p className="text-success-700 text-lg">{result.summary}</p>
              </div>

              {result.warnings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-warning-800 text-lg">⚠️ Important Notes:</h3>
                  {result.warnings.map((warning, index) => (
                    <motion.div 
                      key={index}
                      className="bg-gradient-to-r from-warning-50 to-error-50 p-4 rounded-xl border border-warning-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <p className="text-warning-800 font-medium">{warning}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Enhanced Input Form */}
          <motion.div 
            className="card-professional p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                📝
              </div>
              <h2 className="text-2xl font-bold text-gradient-primary">Enter Your Vital Signs</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Blood Pressure */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="label-professional">
                  <span className="label-text-professional">🩺 Blood Pressure (mmHg)</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Systolic (120)"
                    value={vitals.bloodPressure.systolic}
                    onChange={(e) => handleChange('bloodPressure', { systolic: e.target.value })}
                    className="form-input-professional"
                  />
                  <input
                    type="number"
                    placeholder="Diastolic (80)"
                    value={vitals.bloodPressure.diastolic}
                    onChange={(e) => handleChange('bloodPressure', { diastolic: e.target.value })}
                    className="form-input-professional"
                  />
                </div>
                <p className="text-sm text-gray-500">Normal: 120/80 mmHg</p>
              </motion.div>

              {/* Temperature */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="label-professional">
                  <span className="label-text-professional">🌡️ Body Temperature (°C)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={vitals.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  className="form-input-professional"
                />
                <p className="text-sm text-gray-500">Normal: 36.5-37.5°C</p>
              </motion.div>

              {/* Heart Rate */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="label-professional">
                  <span className="label-text-professional">❤️ Heart Rate (BPM)</span>
                </label>
                <input
                  type="number"
                  placeholder="72"
                  value={vitals.heartRate}
                  onChange={(e) => handleChange('heartRate', e.target.value)}
                  className="form-input-professional"
                />
                <p className="text-sm text-gray-500">Normal: 60-100 BPM</p>
              </motion.div>

              {/* Oxygen Saturation */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="label-professional">
                  <span className="label-text-professional">🫁 Oxygen Saturation (%)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98"
                  value={vitals.oxygenSaturation}
                  onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
                  className="form-input-professional"
                />
                <p className="text-sm text-gray-500">Normal: 95-100%</p>
              </motion.div>

              {/* Respiratory Rate */}
              <motion.div 
                className="space-y-4 md:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="label-professional">
                  <span className="label-text-professional">🌬️ Respiratory Rate (per minute)</span>
                </label>
                <input
                  type="number"
                  placeholder="16"
                  value={vitals.respiratoryRate}
                  onChange={(e) => handleChange('respiratoryRate', e.target.value)}
                  className="form-input-professional max-w-xs"
                />
                <p className="text-sm text-gray-500">Normal: 12-20 per minute</p>
              </motion.div>
            </div>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={analyzeVitals}
                disabled={loading}
                className={`btn-professional-primary px-8 py-4 text-lg font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? (
                  <>
                    <div className="loading-professional w-5 h-5 mr-3"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🔍 Analyze Vital Signs
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Enhanced Reference Values */}
          <motion.div 
            className="mt-8 card-professional p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-warning-500 to-error-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                📚
              </div>
              <h2 className="text-2xl font-bold text-gradient-warning">Normal Reference Values</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Blood Pressure", value: "120/80 mmHg", desc: "Normal range", icon: "🩺", color: "primary" },
                { title: "Body Temperature", value: "36.5-37.5°C", desc: "Normal range", icon: "🌡️", color: "secondary" },
                { title: "Heart Rate", value: "60-100 BPM", desc: "Resting rate", icon: "❤️", color: "accent" },
                { title: "Oxygen Saturation", value: "95-100%", desc: "Normal range", icon: "🫁", color: "success" },
                { title: "Respiratory Rate", value: "12-20/min", desc: "Adult range", icon: "🌬️", color: "warning" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className={`card-professional p-6 border-l-4 hover:shadow-xl transition-all duration-300 ${
                    item.color === 'primary' ? 'border-primary-500' :
                    item.color === 'secondary' ? 'border-secondary-500' :
                    item.color === 'accent' ? 'border-accent-500' :
                    item.color === 'success' ? 'border-success-500' :
                    item.color === 'warning' ? 'border-warning-500' : 'border-gray-500'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className={`font-semibold ${
                      item.color === 'primary' ? 'text-primary-700' :
                      item.color === 'secondary' ? 'text-secondary-700' :
                      item.color === 'accent' ? 'text-accent-700' :
                      item.color === 'success' ? 'text-success-700' :
                      item.color === 'warning' ? 'text-warning-700' : 'text-gray-700'
                    }`}>{item.title}</h3>
                  </div>
                  <div className={`text-xl font-bold mb-1 ${
                    item.color === 'primary' ? 'text-primary-600' :
                    item.color === 'secondary' ? 'text-secondary-600' :
                    item.color === 'accent' ? 'text-accent-600' :
                    item.color === 'success' ? 'text-success-600' :
                    item.color === 'warning' ? 'text-warning-600' : 'text-gray-600'
                  }`}>{item.value}</div>
                  <div className="text-gray-600 text-sm">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Educational Note */}
          <motion.div 
            className="mt-8 card-professional p-8 border-l-4 border-info-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-info-500 to-info-600 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg flex-shrink-0">
                📝
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gradient-info mb-4">Vital Signs Healthcare Guide</h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    <span className="font-semibold text-info-700">নোট:</span> আপনার শরীরের গুরুত্বপূর্ণ চিহ্ন (ভিটাল সাইন) যেমন রক্তচাপ, শরীরের তাপমাত্রা, হৃদস্পন্দন, অক্সিজেনের মাত্রা ও শ্বাসপ্রশ্বাসের হার নিয়মিত পর্যবেক্ষণ করা অত্যন্ত গুরুত্বপূর্ণ। এই তথ্যগুলো ডাক্তারের সাথে শেয়ার করলে রোগ নির্ণয় ও চিকিৎসা আরও সহজ হয়।
                  </p>
                  
                  <div className="bg-gradient-to-r from-info-50 to-primary-50 p-4 rounded-xl border border-info-200 mb-4">
                    <p className="font-semibold text-info-800 mb-2">🩺 ডাক্তারের সাথে যোগাযোগের সময়:</p>
                    <p className="text-info-700">
                      আপনার ভিটাল সাইন রিপোর্টটি সংরক্ষণ করুন এবং প্রয়োজনে ডাক্তারের সাথে শেয়ার করুন। এতে চিকিৎসক আপনার বর্তমান স্বাস্থ্য পরিস্থিতি দ্রুত বুঝতে পারবেন এবং সঠিক পরামর্শ দিতে পারবেন।
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600 italic border-t border-gray-200 pt-4">
                    <span className="font-medium">⚠️ গুরুত্বপূর্ণ:</span> এই নোটটি শিক্ষামূলক উদ্দেশ্যে ব্যবহার করা যেতে পারে। স্বাস্থ্য সংক্রান্ত যেকোনো সিদ্ধান্তের জন্য অবশ্যই চিকিৎসকের পরামর্শ নিন।
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}