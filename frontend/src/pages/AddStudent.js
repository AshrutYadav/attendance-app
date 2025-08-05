import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faSave, 
  faArrowLeft,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { getAuthHeaders } from '../utils/auth';
import './AddStudent.css';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    branch: '',
    rollNo: '',
    studentPhone: '',
    parentPhone: '',
    year: 1,
    admissionYear: new Date().getFullYear()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'];
  const years = [1, 2, 3, 4];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateUID = () => {
    const { year, branch, admissionYear, rollNo } = formData;
    if (year && branch && admissionYear && rollNo) {
      const yearCode = year;
      const branchCode = branch;
      const admissionYearCode = admissionYear.toString().slice(-2);
      const rollNoStr = rollNo.toString().padStart(2, '0');
      return `${yearCode}${branchCode}${admissionYearCode}${rollNoStr}`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('https://backend-nd9n.onrender.com/api/students', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Student added successfully!' });
        setFormData({
          studentName: '',
          branch: '',
          rollNo: '',
          studentPhone: '',
          parentPhone: '',
          year: 1,
          admissionYear: new Date().getFullYear()
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add student' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <motion.div
      className="add-student-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="page-header">
        <div className="header-content">
          <h1>Add Student</h1>
          <p>Enter student details to add to the system</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
        </div>
      </div>

      <motion.div 
        className="form-container"
        variants={containerVariants}
      >
        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="studentName">Student Name *</label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                placeholder="Enter student name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="branch">Branch *</label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year} Year</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rollNo">Roll Number *</label>
              <input
                type="number"
                id="rollNo"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Enter roll number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admissionYear">Admission Year *</label>
              <input
                type="number"
                id="admissionYear"
                name="admissionYear"
                value={formData.admissionYear}
                onChange={handleInputChange}
                required
                min="2020"
                max={new Date().getFullYear()}
                placeholder="Enter admission year"
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentPhone">Student Phone *</label>
              <input
                type="tel"
                id="studentPhone"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleInputChange}
                required
                pattern="[6-9][0-9]{9}"
                placeholder="Enter 10-digit phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentPhone">Parent Phone *</label>
              <input
                type="tel"
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                required
                pattern="[6-9][0-9]{9}"
                placeholder="Enter 10-digit phone number"
              />
            </div>
          </div>

          {/* Generated UID Display */}
          {formData.branch && formData.year && formData.admissionYear && formData.rollNo && (
            <div className="uid-display">
              <label>Generated UID:</label>
              <div className="uid-value">{generateUID()}</div>
            </div>
          )}

          {/* Message Display */}
          {message.text && (
            <motion.div
              className={`message ${message.type}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FontAwesomeIcon 
                icon={message.type === 'success' ? faCheckCircle : faTimesCircle} 
              />
              {message.text}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={isSubmitting ? 'spinner' : faSave} className={isSubmitting ? 'fa-spin' : ''} />
            {isSubmitting ? 'Adding Student...' : 'Add Student'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddStudent; 