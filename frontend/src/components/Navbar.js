import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faHome, 
  faCalendarCheck, 
  faChartBar, 
  faUsers, 
  faCog,
  faUserPlus,
  faSearch,
  faEdit,
  faTrash,
  faSitemap
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: faHome, label: 'Dashboard' },
    { path: '/mark-attendance', icon: faCalendarCheck, label: 'Mark Attendance' },
    { path: '/branch', icon: faSitemap, label: 'Branch Stats' },
    { path: '/add-student', icon: faUserPlus, label: 'Add Student' },
    { path: '/search-student', icon: faSearch, label: 'Search Student' },
    { path: '/update-student', icon: faEdit, label: 'Update Student' },
    { path: '/delete-student', icon: faTrash, label: 'Delete Student' },
    { path: '/reports', icon: faChartBar, label: 'Reports' },
    { path: '/team', icon: faUsers, label: 'Team' },
    { path: '/settings', icon: faCog, label: 'Settings' }
  ];

  return (
    <motion.nav 
      className="navbar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="nav-brand">
        <FontAwesomeIcon icon={faClock} className="brand-icon" />
        <span className="brand-text">Attendance Pro</span>
      </div>
      
      <div className="nav-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="nav-link-content"
            >
              <FontAwesomeIcon icon={item.icon} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </motion.div>
          </NavLink>
        ))}
      </div>

      <div className="nav-profile">
        <motion.img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
          alt="Profile"
          className="profile-img"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
      </div>
    </motion.nav>
  );
};

export default Navbar; 