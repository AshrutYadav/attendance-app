import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faEdit, 
  faClock, 
  faTrash, 
  faSearch, 
  faUsers,
  faPlus,
  faCheckCircle,
  faTimesCircle,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const cards = [
    {
      id: 1,
      title: 'Add Student',
      description: 'Add new student details',
      icon: faUserPlus,
      path: '/add-student'
    },
    {
      id: 2,
      title: 'Update Details',
      description: 'Update student information',
      icon: faEdit,
      path: '/update-student'
    },
    {
      id: 3,
      title: 'Mark Attendance',
      description: 'Mark student attendance',
      icon: faClock,
      path: '/mark-attendance'
    },
    {
      id: 4,
      title: 'Delete Student',
      description: 'Remove student data',
      icon: faTrash,
      path: '/delete-student'
    },
    {
      id: 5,
      title: 'Search Student',
      description: 'Find student by UID',
      icon: faSearch,
      path: '/search-student'
    },
    {
      id: 6,
      title: 'Branch',
      description: 'View branch-wise students',
      icon: faUsers,
      path: '/branch'
    }
  ];

  const stats = [
    {
      id: 1,
      title: 'Present Today',
      value: 24,
      icon: faCheckCircle,
      color: 'success'
    },
    {
      id: 2,
      title: 'Absent Today',
      value: 3,
      icon: faTimesCircle,
      color: 'error'
    },
    {
      id: 3,
      title: 'Average Hours',
      value: 8.5,
      icon: faClock,
      color: 'warning'
    }
  ];

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setHasCheckedIn(true);
    setIsCheckingIn(false);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setHasCheckedIn(false);
    }, 2000);
  };

  const handleCardClick = (card) => {
    if (card.path) {
      navigate(card.path);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.header 
        className="page-header"
        variants={cardVariants}
      >
        <div className="header-content">
          <h1 className="page-title">Attendance Management System</h1>
          <p className="page-subtitle">Welcome back! Here's your attendance overview</p>
        </div>
        <div className="header-actions">
          <motion.button
            className={`btn btn-primary ${hasCheckedIn ? 'checked-in' : ''}`}
            onClick={handleCheckIn}
            disabled={isCheckingIn || hasCheckedIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon 
              icon={hasCheckedIn ? faCheckCircle : isCheckingIn ? 'spinner' : faPlus} 
              className={isCheckingIn ? 'fa-spin' : ''}
            />
            {hasCheckedIn ? 'Checked In!' : isCheckingIn ? 'Checking In...' : 'Check In'}
          </motion.button>
        </div>
      </motion.header>

      {/* Dashboard Cards */}
      <motion.div 
        className="dashboard-grid"
        variants={containerVariants}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className="card"
            variants={cardVariants}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick(card)}
          >
            <motion.div 
              className="card-icon"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <FontAwesomeIcon icon={card.icon} />
            </motion.div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
            </div>
            <motion.div 
              className="card-arrow"
              whileHover={{ x: 4 }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="stats-section"
        variants={containerVariants}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="stat-card"
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <motion.div 
              className={`stat-icon ${stat.color}`}
              whileHover={{ scale: 1.1 }}
            >
              <FontAwesomeIcon icon={stat.icon} />
            </motion.div>
            <div className="stat-info">
              <h4>{stat.title}</h4>
              <motion.p 
                className="stat-value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {stat.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 