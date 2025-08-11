// Medical terminology loader from training data
import fs from 'fs'
import path from 'path'

let medicalTermsCache = null

export function loadMedicalTerms() {
  if (medicalTermsCache) {
    return medicalTermsCache
  }

  try {
    // Load training data from the root level
    const trainingDataPath = path.join(process.cwd(), '..', '..', 'training_data.json')
    
    let trainingData = []
    if (fs.existsSync(trainingDataPath)) {
      const rawData = fs.readFileSync(trainingDataPath, 'utf8')
      trainingData = JSON.parse(rawData)
    }

    // Extract medical terms and common corrections
    const medicalTerms = new Set()
    const commonCorrections = {
      // Common OCR mistakes in medical prescriptions
      'rng': 'mg',
      'n19': 'mg',
      'rnl': 'ml',
      'tahlet': 'tablet',
      'tahlets': 'tablets',
      'capsul': 'capsule',
      'capsuls': 'capsules',
      'syrap': 'syrup',
      'moming': 'morning',
      'evemng': 'evening',
      'nigth': 'night',
      'befre': 'before',
      'afer': 'after',
      'daly': 'daily',
      'tim': 'time',
      'tims': 'times',
      'medicin': 'medicine',
      'prescriptin': 'prescription',
      'dosag': 'dosage',
      'instrction': 'instruction',
      'paracetamal': 'paracetamol',
      'amoxicilin': 'amoxicillin',
      'ibuprofn': 'ibuprofen',
      'asprin': 'aspirin',
      'omeprazol': 'omeprazole',
      'loratadin': 'loratadine',
      'cetirizin': 'cetirizine',
      'prednisolon': 'prednisolone',
      'azithromycin': 'azithromycin',
      'metformin': 'metformin',
      'lisinopril': 'lisinopril',
      'atorvastatin': 'atorvastatin',
      'levothyroxin': 'levothyroxine',
      'gabapentin': 'gabapentin',
      'hydrochlorothiazid': 'hydrochlorothiazide'
    }

    // Process training data to extract medical terms
    trainingData.forEach(item => {
      if (item.text_input && item.text_output) {
        // Extract terms from training examples
        const words = (item.text_input + ' ' + item.text_output)
          .toLowerCase()
          .match(/\b[a-z]{3,}\b/g) || []
        
        words.forEach(word => {
          if (word.length > 2 && !commonCorrections[word]) {
            medicalTerms.add(word)
          }
        })
      }
    })

    // Additional medical terms
    const additionalTerms = [
      'paracetamol', 'ibuprofen', 'aspirin', 'omeprazole', 'loratadine',
      'cetirizine', 'prednisolone', 'azithromycin', 'metformin', 'lisinopril',
      'atorvastatin', 'levothyroxine', 'gabapentin', 'hydrochlorothiazide',
      'amoxicillin', 'doxycycline', 'ciprofloxacin', 'clindamycin',
      'furosemide', 'spironolactone', 'amlodipine', 'losartan',
      'simvastatin', 'rosuvastatin', 'clopidogrel', 'warfarin',
      'insulin', 'glipizide', 'glyburide', 'pioglitazone',
      'sertraline', 'fluoxetine', 'paroxetine', 'venlafaxine',
      'alprazolam', 'lorazepam', 'clonazepam', 'diazepam',
      'tablet', 'tablets', 'capsule', 'capsules', 'syrup', 'injection',
      'morning', 'evening', 'night', 'daily', 'twice', 'thrice',
      'before', 'after', 'food', 'meal', 'empty', 'stomach',
      'milligram', 'milliliter', 'gram', 'liter', 'dose', 'dosage',
      'prescription', 'medicine', 'medication', 'drug', 'pharmacy',
      'doctor', 'patient', 'treatment', 'therapy', 'diagnosis'
    ]

    additionalTerms.forEach(term => medicalTerms.add(term))

    medicalTermsCache = {
      terms: Array.from(medicalTerms),
      corrections: commonCorrections,
      patterns: {
        dosage: /(\d+)\s*(mg|ml|g|l|mcg|μg)/gi,
        frequency: /(once|twice|thrice|\d+\s*times?)\s*(daily|per\s*day|a\s*day)/gi,
        timing: /(morning|evening|night|bedtime|before|after)\s*(meal|food|breakfast|lunch|dinner)/gi
      }
    }

    console.log(`Loaded ${medicalTermsCache.terms.length} medical terms`)
    return medicalTermsCache

  } catch (error) {
    console.error('Error loading medical terms:', error)
    
    // Fallback minimal dataset
    medicalTermsCache = {
      terms: ['paracetamol', 'ibuprofen', 'tablet', 'mg', 'ml', 'daily'],
      corrections: {
        'rng': 'mg',
        'rnl': 'ml',
        'tahlet': 'tablet'
      },
      patterns: {
        dosage: /(\d+)\s*(mg|ml)/gi,
        frequency: /(daily|twice)/gi,
        timing: /(morning|evening)/gi
      }
    }
    
    return medicalTermsCache
  }
}

// Enhanced text correction using medical knowledge
export function correctMedicalText(text) {
  const medicalData = loadMedicalTerms()
  let correctedText = text

  // Apply direct corrections
  Object.entries(medicalData.corrections).forEach(([mistake, correction]) => {
    const regex = new RegExp(`\\b${mistake}\\b`, 'gi')
    correctedText = correctedText.replace(regex, correction)
  })

  // Fix common dosage patterns
  correctedText = correctedText.replace(medicalData.patterns.dosage, (match, number, unit) => {
    return `${number} ${unit.toLowerCase()}`
  })

  // Standardize frequency patterns
  correctedText = correctedText.replace(medicalData.patterns.frequency, (match) => {
    return match.toLowerCase().replace(/\s+/g, ' ')
  })

  // Clean up spacing and formatting
  correctedText = correctedText
    .replace(/\s+/g, ' ')           // Multiple spaces to single
    .replace(/\n+/g, '\n')          // Multiple newlines to single
    .replace(/\s*\n\s*/g, '\n')     // Clean newline spacing
    .trim()

  return correctedText
}

export default { loadMedicalTerms, correctMedicalText }
