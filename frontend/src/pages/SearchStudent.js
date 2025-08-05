import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUsers, 
  faArrowLeft,
  faFilter,
  faUser,
  faPhone,
  faCalendar,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import './SearchStudent.css';

const SearchStudent = () => {
  const [searchMode, setSearchMode] = useState(''); // 'uid', 'branch', 'year'
  const [searchUID, setSearchUID] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'];
  const years = [1, 2, 3, 4];

  const handleModeSelect = (mode) => {
    setSearchMode(mode);
    setStudents([]);
    setMessage({ type: '', text: '' });
    setSearchUID('');
    setSelectedBranch('');
    setSelectedYear('');
  };

  const searchStudentByUID = async () => {
    if (!searchUID.trim()) {
      setMessage({ type: 'error', text: 'Please enter a UID to search' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`https://backend-yv2f.onrender.com/api/students/search/${searchUID}`);
      const data = await response.json();

      if (response.ok) {
        setStudents([data.data]);
      } else {
        setMessage({ type: 'error', text: data.message || 'Student not found' });
        setStudents([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByBranch = async () => {
    if (!selectedBranch) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      let url = `https://backend-yv2f.onrender.com/api/students/branch/${selectedBranch}`;
      if (selectedYear) {
        url += `?year=${selectedYear}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setStudents(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch students' });
        setStudents([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByYear = async () => {
    if (!selectedYear) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`https://backend-yv2f.onrender.com/api/students/year/${selectedYear}`);
      const data = await response.json();

      if (response.ok) {
        setStudents(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch students' });
        setStudents([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchMode === 'branch' && selectedBranch) {
      fetchStudentsByBranch();
    }
  }, [selectedBranch, selectedYear]);

  useEffect(() => {
    if (searchMode === 'year' && selectedYear) {
      fetchStudentsByYear();
    }
  }, [selectedYear]);

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

  return (
    <motion.div
      className="search-student-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <div className="header-content">
          <h1>Search Students</h1>
          <p>Choose your preferred search method</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {!searchMode && (
        <div className="mode-selection">
          <motion.div className="mode-card" variants={cardVariants}>
            <div className="mode-icon">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <h2>Search by UID</h2>
            <p>Search for a specific student using their unique UID</p>
            <button 
              className="btn btn-primary"
              onClick={() => handleModeSelect('uid')}
            >
              <FontAwesomeIcon icon={faSearch} />
              Search by UID
            </button>
          </motion.div>

          <motion.div className="mode-card" variants={cardVariants}>
            <div className="mode-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h2>Search by Branch</h2>
            <p>View all students in a specific branch with optional year filter</p>
            <button 
              className="btn btn-primary"
              onClick={() => handleModeSelect('branch')}
            >
              <FontAwesomeIcon icon={faFilter} />
              Search by Branch
            </button>
          </motion.div>

          <motion.div className="mode-card" variants={cardVariants}>
            <div className="mode-icon">
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <h2>Search by Year</h2>
            <p>View all students in a specific year across all branches</p>
            <button 
              className="btn btn-primary"
              onClick={() => handleModeSelect('year')}
            >
              <FontAwesomeIcon icon={faFilter} />
              Search by Year
            </button>
          </motion.div>
        </div>
      )}

      {searchMode === 'uid' && (
        <div className="uid-search-section">
          <motion.div className="search-card" variants={cardVariants}>
            <div className="search-header">
              <FontAwesomeIcon icon={faSearch} />
              <h2>Search by UID</h2>
            </div>
            
            <div className="search-form">
              <div className="search-group">
                <label>Enter Student UID</label>
                <div className="search-input-group">
                  <input
                    type="text"
                    value={searchUID}
                    onChange={(e) => setSearchUID(e.target.value.toUpperCase())}
                    placeholder="e.g., 1CSE2410"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={searchStudentByUID}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon="spinner" spin />
                        Searching...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSearch} />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {searchMode === 'branch' && (
        <div className="branch-search-section">
          <motion.div className="filter-card" variants={cardVariants}>
            <div className="filter-header">
              <FontAwesomeIcon icon={faFilter} />
              <h2>Branch & Year Filter</h2>
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label>Select Branch</label>
                <select 
                  value={selectedBranch} 
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="">Choose Branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

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
        </div>
      )}

      {searchMode === 'year' && (
        <div className="year-search-section">
          <motion.div className="filter-card" variants={cardVariants}>
            <div className="filter-header">
              <FontAwesomeIcon icon={faFilter} />
              <h2>Year Filter</h2>
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label>Select Year</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">Choose Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {loading && (
        <div className="loading">Loading students...</div>
      )}

      {students.length > 0 && !loading && (
        <motion.div className="students-section" variants={cardVariants}>
          <div className="section-header">
            <h3>
              {searchMode === 'uid' && 'Search Results'}
              {searchMode === 'branch' && `Students in ${selectedBranch} ${selectedYear && `Year ${selectedYear}`}`}
              {searchMode === 'year' && `Students in Year ${selectedYear}`}
            </h3>
            <span className="student-count">{students.length} student{students.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="students-grid">
            {students.map((student, index) => (
              <motion.div
                key={student._id}
                className="student-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
              >
                <div className="student-header">
                  <div className="student-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="student-basic-info">
                    <h4>{student.studentName}</h4>
                    <p className="student-uid">{student.uid}</p>
                  </div>
                </div>

                <div className="student-details">
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    <div>
                      <span className="label">Branch</span>
                      <span className="value">{student.branch}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faCalendar} />
                    <div>
                      <span className="label">Year</span>
                      <span className="value">Year {student.year}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faUser} />
                    <div>
                      <span className="label">Roll No</span>
                      <span className="value">{student.rollNo}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faPhone} />
                    <div>
                      <span className="label">Student Phone</span>
                      <span className="value">{student.studentPhone}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faPhone} />
                    <div>
                      <span className="label">Parent Phone</span>
                      <span className="value">{student.parentPhone}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FontAwesomeIcon icon={faCalendar} />
                    <div>
                      <span className="label">Admission Year</span>
                      <span className="value">{student.admissionYear}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {students.length === 0 && !loading && searchMode && (
        <motion.div className="no-results" variants={cardVariants}>
          <div className="no-results-content">
            <FontAwesomeIcon icon={faSearch} />
            <h3>No students found</h3>
            <p>Try adjusting your search criteria or check if the data exists.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchStudent; 