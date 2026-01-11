import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function BlogPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const blogPosts = [
    {
      title: "How to Create Your First Mind Map",
      date: "January 10, 2026",
      excerpt: "Learn the basics of creating mind maps with MindMap in just a few simple steps."
    },
    {
      title: "10 Tips for Better Diagram Organization",
      date: "January 8, 2026",
      excerpt: "Discover techniques to organize your diagrams more effectively and improve productivity."
    },
    {
      title: "Mind Mapping for Students: A Complete Guide",
      date: "January 5, 2026",
      excerpt: "How students can use mind maps to enhance learning and retention."
    },
    {
      title: "Network Diagrams vs Flowcharts: Which to Use?",
      date: "January 3, 2026",
      excerpt: "Understanding when to use different diagram types for your projects."
    }
  ];

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
          Blog
        </h1>
        <p className={`text-lg mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Tips, tutorials, and insights on diagramming and visual thinking.
        </p>

        <div className="space-y-8">
          {blogPosts.map((post, index) => (
            <article 
              key={index}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02]
                ${isDark 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg'}`}
            >
              <div className={`flex items-center gap-2 text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {post.title}
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>

        <div className={`mt-12 p-8 rounded-2xl text-center ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            More articles coming soon!
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Subscribe to our newsletter for updates on new content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
