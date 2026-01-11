import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import LandingPage from './components/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import GraphsPage from './pages/GraphsPage';
import GraphBuilderPage from './pages/GraphBuilderPage';
import DemoPage from './pages/DemoPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import BlogPage from './pages/BlogPage';

// Wrapper for CreatePage - uses AppLayout for authenticated users
function CreatePageWrapper() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // For authenticated users, wrap with AppLayout (sidebar)
  if (isAuthenticated) {
    return (
      <AppLayout>
        <CreatePage />
      </AppLayout>
    );
  }
  
  // For demo/unauthenticated users, CreatePage handles its own layout
  return <CreatePage />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Landing Page - Accessible to everyone */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes - Redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route path="/demo" element={<DemoPage />} />

            {/* Protected Routes - Require Authentication with Sidebar Layout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HistoryPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/graphs" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GraphsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/graphs/new" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GraphBuilderPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/graphs/builder" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GraphBuilderPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/graphs/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreatePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

             {/* Create Page - Works for both authenticated and demo users */}
            <Route 
              path="/create" 
              element={
                <CreatePageWrapper />
              } 
            />

            {/* Information Pages */}
            <Route 
              path="/about" 
              element={
                <AboutPage />
              } 
            />
            <Route 
              path="/contact" 
              element={
                <ContactPage />
              } 
            />
            <Route 
              path="/blog" 
              element={
                <BlogPage />
              } 
            />
            <Route 
              path="/privacy" 
              element={
                <PrivacyPage />
              } 
            />
            <Route 
              path="/terms" 
              element={
                <TermsPage />
              } 
            />

            {/* Catch all - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
