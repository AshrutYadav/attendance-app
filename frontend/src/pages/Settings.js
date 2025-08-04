import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import './PageTemplate.css';

const Settings = () => {
  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FontAwesomeIcon icon={faCog} className="title-icon" />
            Settings
          </h1>
          <p className="page-subtitle">Configure your attendance app preferences</p>
        </div>
      </div>
      
      <div className="page-content">
        <div className="placeholder-content">
          <h2>Settings & Configuration</h2>
          <p>This page will contain user settings, app configuration, and preferences management.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings; 