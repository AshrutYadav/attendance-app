import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import './PageTemplate.css';

const Reports = () => {
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
            <FontAwesomeIcon icon={faChartBar} className="title-icon" />
            Reports
          </h1>
          <p className="page-subtitle">Generate and view attendance reports</p>
        </div>
      </div>
      
      <div className="page-content">
        <div className="placeholder-content">
          <h2>Reports & Analytics</h2>
          <p>This page will contain detailed reports, analytics, charts, and data visualization for attendance tracking.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports; 