import AdvancedPrescriptionAnalyzer from '@/components/AdvancedPrescriptionAnalyzer'

export default function GoogleLensTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            🔬 Google Lens + AI Prescription Analysis
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Google Lens API + Enhanced Medical AI + Gemini Vision দিয়ে উন্নত প্রেসক্রিপশন বিশ্লেষণ।
            50,000+ মেডিকেল টার্মিনোলজি ডেটা সহ সম্পূর্ণ চিকিৎসা পরামর্শ।
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Gemini Vision AI</h3>
            <p className="text-gray-600">
              Google এর সবচেয়ে উন্নত ভিশন AI যা সরাসরি ছবি থেকে টেক্সট এবং 
              চিকিৎসা তথ্য বিশ্লেষণ করে।
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Google Lens OCR</h3>
            <p className="text-gray-600">
              ব্যাকআপ পদ্ধতি হিসেবে Google Lens API যা হাতের লেখা এবং 
              প্রিন্টেড টেক্সট উভয়ই নির্ভুলভাবে পড়তে পারে।
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold mb-2">Comprehensive Analysis</h3>
            <p className="text-gray-600">
              রোগ নির্ণয়, ওষুধের তালিকা, পরীক্ষা-নিরীক্ষা এবং চিকিৎসা পরামর্শ 
              সহ সম্পূর্ণ বিশ্লেষণ বাংলায়।
            </p>
          </div>
        </div>

        {/* Main Component */}
        <AdvancedPrescriptionAnalyzer />


        {/* Training Data Status */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 text-xl mr-3">📊</div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Training Data Status</h3>
              <p className="text-blue-700 text-sm">
                ✅ 50,000+ মেডিকেল টার্মিনোলজি ডেটা আপলোড করা হয়েছে (1.93 MB)<br/>
                ✅ Fine-tuning এর জন্য প্রস্তুত<br/>
                ⚙️ Run <code>python Fine_tune.py</code> to create specialized medical model
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-600 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">গুরুত্বপূর্ণ সতর্কতা</h3>
              <p className="text-yellow-700 text-sm">
                এই AI বিশ্লেষণ শুধুমাত্র তথ্যগত এবং শিক্ষামূলক উদ্দেশ্যে। এটি কোনো চিকিৎসকের 
                পরামর্শের বিকল্প নয়। ওষুধ সেবনের আগে অবশ্যই যোগ্য চিকিৎসকের সাথে পরামর্শ করুন। 
                জরুরি অবস্থায় তাৎক্ষণিক চিকিৎসা সেবা নিন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Google Lens Prescription Analysis - MediLens',
  description: 'Advanced prescription analysis using Google Lens API and fine-tuned medical AI',
}
