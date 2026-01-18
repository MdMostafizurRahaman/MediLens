import { AuthProvider } from '@/lib/auth-context'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'PrescribeCorrect - Your Prescription Made Clear',
  description: 'AI-powered prescription analysis and medical guidance in Bangla',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
