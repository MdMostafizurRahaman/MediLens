import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Back' }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center px-4 py-2 rounded-lg shadow-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:from-pink-500 hover:to-blue-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      style={{ marginBottom: '1.5rem' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 mr-2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}
