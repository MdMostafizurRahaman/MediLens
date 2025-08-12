'use client';

import { useState } from 'react';
import { Upload, FileText, TestTube, CheckCircle, AlertCircle } from 'lucide-react';

export default function OCRTest() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleTest = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/enhanced-ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('OCR test error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <TestTube className="w-10 h-10 mr-3 text-purple-600" />
            OCR Testing Lab
          </h1>
          <p className="text-xl text-gray-600">
            Test and validate OCR extraction capabilities
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-purple-600" />
                Upload Test Image
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    Click to select test image
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, WebP formats
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      {selectedFile.name}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleTest}
                disabled={!selectedFile || isProcessing}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-5 h-5 mr-2" />
                    Run OCR Test
                  </>
                )}
              </button>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Preview</h2>
              
              {selectedFile ? (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Test image"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-lg p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No image selected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              OCR Test Results
            </h2>
            
            <div className="space-y-6">
              {result.extractedText && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Extracted Text</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {result.extractedText}
                    </pre>
                  </div>
                </div>
              )}

              {result.confidence && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Extraction Confidence</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-green-800 font-semibold">
                        {result.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
