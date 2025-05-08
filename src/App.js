import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NutritionPage from './pages/NutritionPage';
import CustomizedNutritionPage from './pages/CustomizedNutritionPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

// Protected Route component to check authentication
const PrivateRoute = ({ element }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // If authenticated, render the component, otherwise redirect to auth page
  return isAuthenticated ? element : <Navigate to="/auth" replace />;
};

function App() {
  // Add state to track authentication globally
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status on app load and when it changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    
    // Check initial auth state
    checkAuth();
    
    // Listen for auth changes
    window.addEventListener('loginStatusChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('loginStatusChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/custom-nutrition" element={<CustomizedNutritionPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
