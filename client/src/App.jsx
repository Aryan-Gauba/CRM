// client/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import AiInsights from './pages/AiInsights';
import Chat from './pages/Chat';
import Analytics from './pages/Analytics';
import OrgSettings from './pages/OrgSettings';
import Layout from './components/Layout';

// Enhanced ProtectedRoute with Role Checking
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user's role is not included, redirect to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Layout Routes */}
      <Route 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* RESTRICTED ROUTES: Only Admin and Sales Manager can enter */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-insights" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
              <AiInsights />
            </ProtectedRoute>
          } 
        />
        {/* MOVED INSIDE LAYOUT: Only Admin can enter */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <OrgSettings />
            </ProtectedRoute>
          } 
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;