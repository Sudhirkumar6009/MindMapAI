import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function PrivacyPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm mb-8 transition-colors
            ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
              <Shield className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Privacy Policy
            </h1>
          </div>

          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Last Updated: January 2026
          </p>

          <div className={`space-y-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Information We Collect
              </h2>
              <p className="mb-3">
                We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email)</li>
                <li>Usage data and preferences</li>
                <li>Diagrams you create</li>
                <li>Device and browser information</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                How We Use Your Information
              </h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you about our services.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Rights
              </h2>
              <p>
                You have the right to access, update, or delete your personal information at any time. You can also export your data or request account deletion through your settings.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
