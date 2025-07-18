'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  
  const { currentUser } = useAuth()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    setFile(droppedFile)
  }

  const handleUpload = async () => {
    if (!file) return
    
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setResult({
        originalText: 'Dr. Rahman\nPatient: John Doe\nAge: 35\nRx:\n1. Paracetamol 500mg - 1+1+1 (After meal)\n2. Omeprazole 20mg - 1+0+0 (Before meal)\n3. Cetirizine 10mg - 0+0+1 (At night)',
        banglaTranslation: 'ডাঃ রহমান\nরোগী: জন ডো\nবয়স: ৩৫\nব্যবস্থাপত্র:\n১। প্যারাসিটামল ৫০০ মিগ্রা - ১+১+১ (খাবারের পর)\n২। ওমিপ্রাজল ২০ মিগ্রা - ১+০+০ (খাবারের আগে)\n৩। সেটিরিজিন ১০ মিগ্রা - ০+০+১ (রাতে)',
        medications: [
          {
            name: 'Paracetamol 500mg',
            bangla: 'প্যারাসিটামল ৫০০ মিগ্রা',
            dosage: '১+১+১ (খাবারের পর)',
            sideEffects: 'সাধারণত নিরাপদ, তবে অতিরিক্ত সেবনে লিভারের ক্ষতি হতে পারে'
          },
          {
            name: 'Omeprazole 20mg',
            bangla: 'ওমিপ্রাজল ২০ মিগ্রা',
            dosage: '১+০+০ (খাবারের আগে)',
            sideEffects: 'মাথাব্যথা, পেট ব্যথা, বমি বমি ভাব হতে পারে'
          }
        ]
      })
      setLoading(false)
    }, 2000)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to upload prescriptions</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-primary mb-4">🔍 Upload Prescription</h1>
          <p className="text-lg text-base-content/70">
            Upload your prescription image or PDF to get it analyzed in Bangla
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div 
            className="card bg-base-200 shadow-xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-body">
              <h2 className="card-title text-primary">Upload Document</h2>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-primary bg-primary/10' : 'border-base-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-4xl mb-4">📄</div>
                <p className="text-lg mb-4">
                  Drag and drop your prescription here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full max-w-xs"
                />
              </div>

              {file && (
                <div className="mt-4 p-4 bg-base-100 rounded-lg">
                  <p className="font-semibold">Selected file:</p>
                  <p className="text-sm text-base-content/70">{file.name}</p>
                </div>
              )}

              <div className="card-actions justify-end mt-4">
                <button 
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  onClick={handleUpload}
                  disabled={!file || loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze Prescription'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            className="card bg-base-200 shadow-xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card-body">
              <h2 className="card-title text-primary">Analysis Results</h2>
              
              {result ? (
                <div className="space-y-4">
                  <div className="collapse collapse-arrow bg-base-100">
                    <input type="checkbox" /> 
                    <div className="collapse-title text-xl font-medium">
                      Original Text
                    </div>
                    <div className="collapse-content"> 
                      <pre className="text-sm whitespace-pre-wrap">{result.originalText}</pre>
                    </div>
                  </div>

                  <div className="collapse collapse-arrow bg-base-100">
                    <input type="checkbox" defaultChecked /> 
                    <div className="collapse-title text-xl font-medium">
                      Bangla Translation
                    </div>
                    <div className="collapse-content"> 
                      <pre className="text-sm whitespace-pre-wrap">{result.banglaTranslation}</pre>
                    </div>
                  </div>

                  <div className="collapse collapse-arrow bg-base-100">
                    <input type="checkbox" /> 
                    <div className="collapse-title text-xl font-medium">
                      Medication Details
                    </div>
                    <div className="collapse-content"> 
                      <div className="space-y-3">
                        {result.medications.map((med, index) => (
                          <div key={index} className="card bg-base-200 shadow-sm">
                            <div className="card-body p-4">
                              <h4 className="font-semibold">{med.name}</h4>
                              <p className="text-primary">{med.bangla}</p>
                              <p className="text-sm"><strong>Dosage:</strong> {med.dosage}</p>
                              <p className="text-sm text-warning"><strong>Side Effects:</strong> {med.sideEffects}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions justify-end">
                    <button className="btn btn-secondary">Export PDF</button>
                    <button className="btn btn-accent">Ask Questions</button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-base-content/70">
                    Upload a prescription to see the analysis results here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
