// client/src/components/Layout.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import socket from '../services/socket'; // Import socket client
import api from '../services/api';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 📱 Mobile menu toggle state

  // Fetch initial notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  // ⚡ SOCKET.IO REAL-TIME LISTENER SETUP
  useEffect(() => {
    if (user && user.id) {
      if (!socket.connected) {
        socket.connect();
      }
      
      socket.emit('join_user_room', user.id);

      socket.on('receive_notification', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      socket.off('receive_notification');
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [user]);

  return (
    <div className="layout-container">
      <aside className="sidebar">
        {/* Sidebar headers and links */}
        <div className="sidebar-header">
          <h2>CRM System</h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Theme Toggle */}
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            {/* Notification Bell */}
            <div className="notification-bell-wrapper" onClick={() => setShowDropdown(!showDropdown)}>
              🔔 {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </div>

            {/* 📱 Mobile Hamburger Toggle Button */}
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {showDropdown && (
            <div className="notification-dropdown">
              <h4>Live Notifications</h4>
              {notifications.length > 0 ? (
                notifications.map((n, index) => (
                  <div key={n.id || index} className={`notif-item ${n.type}`}>
                    {n.message}
                  </div>
                ))
              ) : (
                <p className="no-notif">No new alerts</p>
              )}
            </div>
          )}
        </div>

        {/* 📱 Nav dynamically gets 'open' class on mobile */}
        <nav className={`sidebar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/dashboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
          <Link to="/leads" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Leads</Link>
          <Link to="/customers" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Customers</Link>
          <Link to="/tasks" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Tasks</Link>
          <Link className="nav-link" to="/chat" onClick={() => setIsMobileMenuOpen(false)}>Team Chat</Link>
          <Link className="nav-link" to="/analytics" onClick={() => setIsMobileMenuOpen(false)}>Analytics & Forecast</Link>
          
          {(user?.role === 'Admin' || user?.role === 'Sales Manager') && (
            <>
              <Link to="/reports" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Reports</Link>
              <Link to="/ai-insights" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>AI Insights</Link>
            </>
          )}

          {/* CONDITIONAL LINK: Only visible to Admins */}
          {user?.role === 'Admin' && (
            <Link to="/settings" className="nav-link" style={{ fontWeight: 'bold', color: 'var(--primary-color, #007bff)' }} onClick={() => setIsMobileMenuOpen(false)}>
              Org Settings
            </Link>
          )}

          {/* Logout inside mobile dropdown for accessibility */}
          <div className="mobile-logout-wrapper">
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </nav>

        <div className="sidebar-footer desktop-footer">
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;