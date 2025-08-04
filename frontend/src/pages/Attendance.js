import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import './PageTemplate.css';

const Attendance = () => {
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
            <FontAwesomeIcon icon={faCalendarCheck} className="title-icon" />
            Attendance
          </h1>
          <p className="page-subtitle">Manage and track attendance records</p>
        </div>
      </div>
      
      <div className="page-content">
        <div className="placeholder-content">
          <h2>Attendance Management</h2>
          <p>This page will contain attendance tracking features, check-in/check-out functionality, and attendance history.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Attendance; 