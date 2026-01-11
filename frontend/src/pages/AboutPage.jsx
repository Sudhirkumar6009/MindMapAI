import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function AboutPage() {
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

        <h1 className={`text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          About MindMap
        </h1>

        <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            MindMap is a professional diagramming tool designed to help individuals and teams visualize complex information.
          </p>
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Our mission is to make diagram creation accessible to everyone, from students brainstorming ideas to developers mapping system architectures.
          </p>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Built with modern web technologies, MindMap provides a seamless experience for creating mind maps, flowcharts, network diagrams, and more.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
