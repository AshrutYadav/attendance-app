import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSitemap, 
  faUsers, 
  faArrowLeft,
  faFilter,
  faGraduationCap,
  faCalendar,
  faUser,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import './Branch.css';

const Branch = () => {
  const [statistics, setStatistics] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'];
  const years = [1, 2, 3, 4];

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchStudentsByBranch();
    }
  }, [selectedBranch, selectedYear]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('${process.env.REACT_APP_BACKEND_URL}/api/students/statistics');
      const data = await response.json();

      if (response.ok) {
        setStatistics(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch statistics' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByBranch = async () => {
    if (!selectedBranch) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      let url = `${process.env.REACT_APP_BACKEND_URL}/api/students/branch/${selectedBranch}`;
      if (selectedYear) {
        url += `?year=${selectedYear}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // Sort students by roll number in ascending order
        const sortedStudents = data.data.sort((a, b) => a.rollNo - b.rollNo);
        setStudents(sortedStudents);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch students' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    setSelectedYear('');
    setStudents([]);
  };

  const handleBackToStats = () => {
    setSelectedBranch(null);
    setSelectedYear('');
    setStudents([]);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading && !statistics) {
    return (
      <div className="branch-page">
        <div className="loading">Loading branch statistics...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="branch-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <div className="header-content">
          <h1>
            {selectedBranch ? `${selectedBranch} Students` : 'Branch Statistics'}
          </h1>
          <p>
            {selectedBranch 
              ? `Viewing students in ${selectedBranch} branch` 
              : 'Overview of student distribution across branches'
            }
          </p>
        </div>
        <div className="header-actions">
          {selectedBranch && (
            <button className="btn btn-secondary" onClick={handleBackToStats}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Stats
            </button>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {!selectedBranch && statistics && (
        <>
          {/* Overall Statistics */}
          <motion.div className="overall-stats-section" variants={cardVariants}>
            <div className="section-header">
              <FontAwesomeIcon icon={faUsers} />
              <h2>Overall Statistics</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="stat-content">
                  <h3>{statistics.totalStudents}</h3>
                  <p>Total Students</p>
                </div>
              </div>
              <div className="stat-card branches">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faSitemap} />
                </div>
                <div className="stat-content">
                  <h3>{statistics.totalBranches}</h3>
                  <p>Active Branches</p>
                </div>
              </div>
              <div className="stat-card average">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faGraduationCap} />
                </div>
                <div className="stat-content">
                  <h3>{statistics.averageStudentsPerBranch}</h3>
                  <p>Avg per Branch</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Branch Cards */}
          <motion.div className="branch-cards-section" variants={cardVariants}>
            <div className="section-header">
              <FontAwesomeIcon icon={faSitemap} />
              <h2>Branch-wise Distribution</h2>
            </div>
            <div className="branch-cards-grid">
              {branches.map((branch, index) => {
                const branchStats = statistics.branchStats.find(stat => stat.branch === branch);
                const totalStudents = branchStats ? branchStats.totalStudents : 0;
                
                return (
                  <motion.div
                    key={branch}
                    className="branch-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleBranchClick(branch)}
                  >
                    <div className="branch-header">
                      <div className="branch-icon">
                        <FontAwesomeIcon icon={faSitemap} />
                      </div>
                      <h3>{branch}</h3>
                    </div>
                    <div className="branch-stats">
                      <div className="stat-item">
                        <span className="stat-value">{totalStudents}</span>
                        <span className="stat-label">Total Students</span>
                      </div>
                      {branchStats && (
                        <div className="year-breakdown">
                          {branchStats.yearBreakdown.map((yearStat, yearIndex) => (
                            <div key={yearIndex} className="year-stat">
                              <span className="year-label">Year {yearStat.year}</span>
                              <span className="year-count">{yearStat.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="branch-action">
                      <span>Click to view students</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {selectedBranch && (
        <div className="students-section">
          <motion.div className="filter-card" variants={cardVariants}>
            <div className="filter-header">
              <FontAwesomeIcon icon={faFilter} />
              <h2>Filter Students</h2>
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label>Filter by Year (Optional)</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {loading && (
            <div className="loading">Loading students...</div>
          )}

          {students.length > 0 && !loading && (
            <motion.div className="students-list-section" variants={cardVariants}>
              <div className="section-header">
                <h3>
                  Students in {selectedBranch} {selectedYear && `Year ${selectedYear}`}
                </h3>
                <span className="student-count">{students.length} student{students.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="students-list">
                {students.map((student, index) => (
                  <motion.div
                    key={student._id}
                    className="student-list-item"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="student-info">
                      <div className="student-basic">
                        <h4>{student.studentName}</h4>
                        <p className="student-uid">{student.uid}</p>
                      </div>
                      <div className="student-details">
                        <div className="detail-item">
                          <FontAwesomeIcon icon={faSitemap} />
                          <span>{student.branch}</span>
                        </div>
                        <div className="detail-item">
                          <FontAwesomeIcon icon={faGraduationCap} />
                          <span>Year {student.year}</span>
                        </div>
                        <div className="detail-item">
                          <FontAwesomeIcon icon={faUser} />
                          <span>Roll No: {student.rollNo}</span>
                        </div>
                        <div className="detail-item">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{student.studentPhone}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {students.length === 0 && !loading && (
            <motion.div className="no-students" variants={cardVariants}>
              <FontAwesomeIcon icon={faUsers} />
              <h3>No students found</h3>
              <p>No students found in {selectedBranch} {selectedYear && `Year ${selectedYear}`}</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Branch; 