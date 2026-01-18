# PrescribeCorrect Frontend

A modern, responsive web application for medical prescription analysis and healthcare assistance in Bangladesh.

## Features

- 🔐 **Authentication**: Firebase-based login and registration
- 📱 **Responsive Design**: Works on all devices
- 🌐 **Multi-language Support**: English and Bangla
- 📄 **OCR Integration**: Tesseract.js for prescription scanning
- 💬 **AI Chatbot**: Medical assistance in Bangla
- 👨‍⚕️ **Doctor Directory**: Find and connect with doctors
- 📊 **Vital Signs Analysis**: Health monitoring and insights

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Authentication**: Firebase Auth
- **OCR**: Tesseract.js
- **Animations**: Framer Motion
- **Icons**: Heroicons + Headless UI

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication
   - Add your Firebase config to `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Project Structure

```
frontend/
├── app/                 # Next.js App Router
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Protected dashboard
│   ├── doctors/        # Doctor directory
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
├── lib/               # Utilities and configurations
├── public/            # Static assets
└── styles/            # Global styles
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
