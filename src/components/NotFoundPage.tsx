import { useNavigate } from 'react-router-dom';
import { Factory, AlertCircle, Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border-2 border-red-600 p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-red-500 animate-bounce" />
        </div>

        <h1 className="text-5xl font-bold text-red-500 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>

        <div className="bg-red-900/30 border-l-4 border-red-500 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-300">
            Sorry, the page you're looking for doesn't exist or the URL is incorrect. 
            Please return to the home page or login to access the manufacturing dashboard.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors border border-gray-600 min-h-[48px]"
          >
            Go Back
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Factory className="w-4 h-4" />
            <p className="text-xs">Cyclone Manufacturing - Workflow Control System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
