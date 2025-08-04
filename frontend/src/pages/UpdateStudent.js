import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faSearch, 
  faUsers, 
  faArrowLeft,
  faSave,
  faCheckCircle,
  faTimesCircle,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import './UpdateStudent.css';

const UpdateStudent = () => {
  const [updateMode, setUpdateMode] = useState(''); // 'branch' or 'uid'
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchUID, setSearchUID] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'];
  const years = [1, 2, 3, 4];

  const [updateData, setUpdateData] = useState({
    studentName: '',
    branch: '',
    rollNo: '',
    studentPhone: '',
    parentPhone: '',
    year: '',
    admissionYear: ''
  });

  const handleModeSelect = (mode) => {
    setUpdateMode(mode);
    setSelectedStudent(null);
    setStudents([]);
    setMessage({ type: '', text: '' });
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
        setUpdateData({
          studentName: data.data.studentName,
          branch: data.data.branch,
          rollNo: data.data.rollNo,
          studentPhone: data.data.studentPhone,
          parentPhone: data.data.parentPhone,
          year: data.data.year,
          admissionYear: data.data.admissionYear
        });
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
    setUpdateData({
      studentName: student.studentName,
      branch: student.branch,
      rollNo: student.rollNo,
      studentPhone: student.studentPhone,
      parentPhone: student.parentPhone,
      year: student.year,
      admissionYear: student.admissionYear
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setMessage({ type: 'error', text: 'Please select a student to update' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`http://localhost:5000/api/students/${selectedStudent.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Student updated successfully!' });
        setSelectedStudent(data.data);
        setUpdateData({
          studentName: data.data.studentName,
          branch: data.data.branch,
          rollNo: data.data.rollNo,
          studentPhone: data.data.studentPhone,
          parentPhone: data.data.parentPhone,
          year: data.data.year,
          admissionYear: data.data.admissionYear
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update student' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
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
      className="update-student-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <div className="header-content">
          <h1>Update Student Details</h1>
          <p>Choose your preferred update method</p>
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

      {!updateMode && (
        <div className="mode-selection">
          <motion.div className="mode-card" variants={cardVariants}>
            <div className="mode-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h2>Branch-wise Update</h2>
            <p>Select a branch and year to view all students, then choose one to update</p>
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
            <h2>UID-wise Update</h2>
            <p>Search for a specific student using their UID and update their details</p>
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

      {updateMode === 'branch' && (
        <div className="branch-update-section">
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
                    <div className="select-indicator">
                      {selectedStudent?._id === student._id && (
                        <FontAwesomeIcon icon={faCheckCircle} />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {updateMode === 'uid' && (
        <div className="uid-update-section">
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
        <motion.div className="update-form-section" variants={cardVariants}>
          <div className="form-card">
            <div className="form-header">
              <FontAwesomeIcon icon={faEdit} />
              <h2>Update Student Details</h2>
            </div>

            <div className="selected-student-info">
              <h3>Updating: {selectedStudent.studentName}</h3>
              <p>UID: {selectedStudent.uid}</p>
            </div>

            <form onSubmit={handleSubmit} className="update-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={updateData.studentName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Branch</label>
                  <select
                    name="branch"
                    value={updateData.branch}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="number"
                    name="rollNo"
                    value={updateData.rollNo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <select
                    name="year"
                    value={updateData.year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>Year {year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Student Phone</label>
                  <input
                    type="tel"
                    name="studentPhone"
                    value={updateData.studentPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Parent Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={updateData.parentPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Admission Year</label>
                  <input
                    type="number"
                    name="admissionYear"
                    value={updateData.admissionYear}
                    onChange={handleInputChange}
                    min="2020"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSave} spin />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Update Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UpdateStudent; 