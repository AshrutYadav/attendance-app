import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import './PageTemplate.css';

const Team = () => {
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
            <FontAwesomeIcon icon={faUsers} className="title-icon" />
            Team
          </h1>
          <p className="page-subtitle">Manage team members and their attendance</p>
        </div>
      </div>
      
      <div className="page-content">
        <div className="placeholder-content">
          <h2>Team Management</h2>
          <p>This page will contain team member management, user profiles, and team attendance overview.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Team; 