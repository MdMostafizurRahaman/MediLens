# MediLens - AI-Powered Medical Prescription Analyzer

## 🏥 Overview
MediLens is a comprehensive medical prescription analysis system that uses fine-tuned AI models to extract detailed medical information from prescription images with Bengali language support.

## 🚀 Features
- **Advanced OCR**: Enhanced image preprocessing for better text extraction
- **Fine-tuned AI Analysis**: Google Gemini model trained on 50,000+ medical terms
- **Bengali Support**: Bilingual medical analysis and translations
- **Comprehensive Analysis**: Medications, symptoms, diagnosis, test results
- **Role-based Access**: User, Doctor, and Admin portals
- **Real-time Chat**: Medical consultation chatbot

## 📋 Prerequisites
- Node.js 18+ 
- Python 3.8+
- Java 11+ (for Spring Boot backend)
- MongoDB

## 🔧 Environment Setup



## 👥 User Roles

### Regular User
- Upload prescription images
- Get detailed medical analysis
- Chat with medical AI
- View analysis history

### Doctor
- Register and manage profile
- Access patient consultations
- Provide medical advice

### Admin
- Approve/reject doctor registrations
- Manage user accounts
- System oversight

## 🔐 Security Features
- JWT-based authentication
- Role-based access control
- API key protection via environment variables
- Secure prescription data handling

## 📁 Project Structure
```
MediLens/
├── frontend/              # Next.js React application
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility libraries
│   └── .env.local        # Frontend environment variables
├── backend/              # Spring Boot application
│   ├── src/main/java/    # Java source code
│   └── src/main/resources/ # Application properties
├── Fine_tune.py          # AI model fine-tuning script
├── training_data.json    # Medical terminology dataset
├── requirements.txt      # Python dependencies
├── .env                  # Python environment variables
└── .gitignore           # Git ignore rules
```

## 🧠 AI Model Details
- **Base Model**: Google Gemini-1.5-flash
- **Training Data**: 50,000+ medical terms with definitions
- **Languages**: English and Bengali
- **Specialization**: Medical terminology, prescriptions, diagnoses

## 🚨 Important Notes
- Never commit API keys to version control
- Keep .env files secure and local only
- Regularly update dependencies for security
- Monitor API usage and costs

## 📞 Support
For issues or questions, please create an issue in the GitHub repository.

## 📄 License
This project is licensed under the MIT License.
