import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function TermsPage() {
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
            <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
              <FileText className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Terms of Service
            </h1>
          </div>

          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Last Updated: January 2026
          </p>

          <div className={`space-y-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Acceptance of Terms
              </h2>
              <p>
                By accessing and using MindMap, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Description of Service
              </h2>
              <p>
                MindMap provides an online platform for creating and managing diagrams, mind maps, and visual representations of information. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                User Accounts
              </h2>
              <p className="mb-3">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us of unauthorized access immediately</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Content and Intellectual Property
              </h2>
              <p className="mb-3">
                You retain ownership of all content you create or upload to MindMap. By submitting content, you grant us a license to use, store, and display your content solely for providing the service.
              </p>
              <p>
                The MindMap platform, including its design, features, and software, is protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Acceptable Use
              </h2>
              <p className="mb-3">
                You agree not to use the service for any unlawful purpose or in any way that could damage the service.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Do not upload harmful, illegal, or offensive content</li>
                <li>Do not attempt to gain unauthorized access</li>
                <li>Do not interfere with service operations</li>
                <li>Do not attempt to reverse engineer the service</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Disclaimer of Warranties
              </h2>
              <p>
                The service is provided "as is" without any warranties, express or implied. We do not guarantee uninterrupted or error-free operation of the service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, MindMap shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
