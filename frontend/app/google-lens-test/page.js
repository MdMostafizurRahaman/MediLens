import AdvancedPrescriptionAnalyzer from '@/components/AdvancedPrescriptionAnalyzer'
import Navigation from '@/components/Navigation'

export default function GoogleLensTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-15 animate-pulse-subtle"></div>
      </div>

      <Navigation />
      
      <div className="relative z-10 container mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-28">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="text-6xl md:text-7xl animate-float">🔬</div>
          </div>
          <h1 className="text-responsive-lg text-gradient font-display mb-6">
            Prescription Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
            সরাসরি ছবি বিশ্লেষণ + চিকিৎসা পরামর্শ
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
        </div>


        {/* Main Component - Enhanced Container */}
        <div className="glass-effect rounded-3xl p-8 mb-12 border-2 border-white/20 shadow-extra">
          <AdvancedPrescriptionAnalyzer />
        </div>

        {/* Enhanced Disclaimer */}
        <div className=" bg-red-600 rounded-2xl p-6 border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-start gap-4">
            <div className="text-yellow-600 text-3xl flex-shrink-0 animate-pulse-subtle">⚠️</div>
            <div>
              <h3 className="font-bold text-red-700 mb-3 text-lg">গুরুত্বপূর্ণ সতর্কতা</h3>
              <p className="text-red-700 leading-relaxed bangla-text">
                এই AI বিশ্লেষণ শুধুমাত্র তথ্যগত এবং শিক্ষামূলক উদ্দেশ্যে। এটি কোনো চিকিৎসকের 
                পরামর্শের বিকল্প নয়। ওষুধ সেবনের আগে অবশ্যই যোগ্য চিকিৎসকের সাথে পরামর্শ করুন। 
                জরুরি অবস্থায় তাৎক্ষণিক চিকিৎসা সেবা নিন।
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge badge-warning">Educational Purpose</span>
                <span className="badge badge-warning">Not Medical Advice</span>
                <span className="badge badge-warning">Consult Doctor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-enhanced text-center">
            <div className="text-3xl text-blue-600 mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-800">93%</div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
          </div>
          <div className="stat-enhanced text-center">
            <div className="text-3xl text-green-600 mb-2">⚡</div>
            <div className="text-2xl font-bold text-gray-800">&lt;3 min</div>
            <div className="text-sm text-gray-600">Analysis Time</div>
          </div>
          <div className="stat-enhanced text-center">
            <div className="text-3xl text-purple-600 mb-2">🔒</div>
            <div className="text-2xl font-bold text-gray-800">100%</div>
            <div className="text-sm text-gray-600">Data Privacy</div>
          </div>
          <div className="stat-enhanced text-center">
            <div className="text-3xl text-orange-600 mb-2">🌐</div>
            <div className="text-2xl font-bold text-gray-800">বাংলা</div>
            <div className="text-sm text-gray-600">Native Support</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Google Lens Prescription Analysis - PrescribeCorrect',
  description: 'Advanced prescription analysis using Google Lens API and fine-tuned medical AI',
}
