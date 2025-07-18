import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata = {
  title: 'MediLens - Your Prescription Made Clear',
  description: 'AI-powered prescription analysis and medical guidance in Bangla',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
