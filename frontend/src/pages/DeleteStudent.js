import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faSearch, 
  faUsers, 
  faArrowLeft,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import './DeleteStudent.css';

const DeleteStudent = () => {
  const [deleteMode, setDeleteMode] = useState(''); // 'branch' or 'uid'
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchUID, setSearchUID] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showConfirm, setShowConfirm] = useState(false);

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'];
  const years = [1, 2, 3, 4];

  const handleModeSelect = (mode) => {
    setDeleteMode(mode);
    setSelectedStudent(null);
    setStudents([]);
    setMessage({ type: '', text: '' });
    setShowConfirm(false);
  };

  const fetchStudentsByBranch = async () => {
    if (!selectedBranch) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      let url = `http://localhost:5000/api/students/branch/${selectedBranch}`;
      if (selectedYear) {
        url += `?year=${selectedYear}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setStudents(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch students' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const searchStudentByUID = async () => {
    if (!searchUID.trim()) {
      setMessage({ type: 'error', text: 'Please enter a UID to search' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`http://localhost:5000/api/students/search/${searchUID}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedStudent(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Student not found' });
        setSelectedStudent(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedStudent) {
      setMessage({ type: 'error', text: 'Please select a student to delete' });
      return;
    }

    try {
      setDeleting(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`http://localhost:5000/api/students/${selectedStudent.uid}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Student deleted successfully!' });
        setSelectedStudent(null);
        setShowConfirm(false);
        
        // Refresh the student list if in branch mode
        if (deleteMode === 'branch' && selectedBranch) {
          fetchStudentsByBranch();
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete student' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedBranch) {
      setMessage({ type: 'error', text: 'Please select a branch to delete students from' });
      return;
    }

    try {
      setDeleting(true);
      setMessage({ type: '', text: '' });

      let url = `http://localhost:5000/api/students/branch/${selectedBranch}`;
      if (selectedYear) {
        url += `?year=${selectedYear}`;
      }

      const response = await fetch(url, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Successfully deleted ${data.deletedCount} students from ${selectedBranch}${selectedYear ? ` Year ${selectedYear}` : ''}!` 
        });
        setStudents([]);
        setSelectedBranch('');
        setSelectedYear('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete students' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (selectedBranch) {
      fetchStudentsByBranch();
    }
  }, [selectedBranch, selectedYear]);

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
      className="delete-student-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <div className="header-content">
          <h1>Delete Student</h1>
          <p>Choose your preferred deletion method</p>
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

      {!deleteMode && (
        <div className="mode-selection">
          <motion.div className="mode-card" variants={cardVariants}>
            <div className="mode-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h2>Branch-wise Deletion</h2>
            <p>Select a branch and year to view all students, then choose one to delete or delete all</p>
            <button 
              className="btn btn-primary"
              onClick={() => handleModeSelect('branch')}
            >
              <FontAwesomeIcon icon={faFilter} />
              Select Branch
            </button>
          </motion.div>

          <motion.div className="mode-card" variants={cardVariants}>
            <div className="mode-icon">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <h2>UID-wise Deletion</h2>
            <p>Search for a specific student using their UID and delete them</p>
            <button 
              className="btn btn-primary"
              onClick={() => handleModeSelect('uid')}
            >
              <FontAwesomeIcon icon={faSearch} />
              Search by UID
            </button>
          </motion.div>
        </div>
      )}

      {deleteMode === 'branch' && (
        <div className="branch-delete-section">
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

            {students.length > 0 && (
              <div className="bulk-delete-section">
                <div className="bulk-delete-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <div>
                    <h3>Bulk Delete Warning</h3>
                    <p>This will delete ALL {students.length} students in {selectedBranch} {selectedYear && `Year ${selectedYear}`}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={handleBulkDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <FontAwesomeIcon icon={faTrash} spin />
                      Deleting All...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} />
                      Delete All Students
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {loading && (
            <div className="loading">Loading students...</div>
          )}

          {students.length > 0 && !loading && (
            <motion.div className="students-section" variants={cardVariants}>
              <div className="section-header">
                <h3>Students in {selectedBranch} {selectedYear && `Year ${selectedYear}`}</h3>
                <span className="student-count">{students.length} students</span>
              </div>

              <div className="students-grid">
                {students.map((student, index) => (
                  <motion.div
                    key={student._id}
                    className={`student-card ${selectedStudent?._id === student._id ? 'selected' : ''}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="student-info">
                      <h4>{student.studentName}</h4>
                      <p className="student-uid">{student.uid}</p>
                      <p>Roll No: {student.rollNo}</p>
                      <p>Year: {student.year}</p>
                    </div>
                    <div className="delete-indicator">
                      <FontAwesomeIcon icon={faTrash} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {deleteMode === 'uid' && (
        <div className="uid-delete-section">
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

      {selectedStudent && (
        <motion.div className="delete-confirmation-section" variants={cardVariants}>
          <div className="confirmation-card">
            <div className="confirmation-header">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <h2>Confirm Deletion</h2>
            </div>

            <div className="selected-student-info">
              <h3>Student to be deleted:</h3>
              <div className="student-details">
                <p><strong>Name:</strong> {selectedStudent.studentName}</p>
                <p><strong>UID:</strong> {selectedStudent.uid}</p>
                <p><strong>Branch:</strong> {selectedStudent.branch}</p>
                <p><strong>Year:</strong> {selectedStudent.year}</p>
                <p><strong>Roll No:</strong> {selectedStudent.rollNo}</p>
              </div>
            </div>

            <div className="warning-message">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p>This action cannot be undone. The student will be permanently deleted from the system.</p>
            </div>

            <div className="confirmation-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedStudent(null);
                  setShowConfirm(false);
                }}
                disabled={deleting}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <FontAwesomeIcon icon={faTrash} spin />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Student
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DeleteStudent; 