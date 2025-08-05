import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faUsers,
  faArrowLeft,
  faFilter,
  faCalendar,
  faSave,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'];
  const years = [1, 2, 3, 4];

  // Set default date to today in DD_MM_YYYY format
  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    setSelectedDate(`${day}/${month}/${year}`);
  }, []);

  useEffect(() => {
    if (selectedYear && selectedBranch) {
      fetchStudents();
    }
  }, [selectedYear, selectedBranch]);

  const fetchStudents = async () => {
    if (!selectedYear || !selectedBranch) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`https://backend-yv2f.onrender.com/api/students/attendance/${selectedYear}/${selectedBranch}`);
      const data = await response.json();

      if (response.ok) {
        // Sort students by roll number
        const sortedStudents = data.data.sort((a, b) => a.rollNo - b.rollNo);
        setStudents(sortedStudents);

        // Initialize attendance data for each student
        const initialAttendance = {};
        sortedStudents.forEach(student => {
          initialAttendance[student._id] = 'absent'; // Default to absent
        });
        setAttendanceData(initialAttendance);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch students' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedYear || !selectedBranch || !selectedDate) {
      setMessage({ type: 'error', text: 'Please select year, branch, and date' });
      return;
    }

    if (students.length === 0) {
      setMessage({ type: 'error', text: 'No students found for the selected criteria' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      // Convert DD_MM_YYYY to YYYY-MM-DD for backend
      const [day, month, year] = selectedDate.split('_');
      const formattedDate = `${year}-${month}-${day}`;

      const attendancePayload = {
        year: parseInt(selectedYear),
        branch: selectedBranch,
        date: formattedDate,
        attendanceData: Object.keys(attendanceData).map(studentId => {
          const student = students.find(s => s._id === studentId);
          return {
            studentId: studentId,
            status: attendanceData[studentId],
            studentName: student.studentName,
            rollNo: student.rollNo
          };
        })
      };

      const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendancePayload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to mark attendance' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendanceData).filter(status => status === 'present').length;
    const absent = total - present;
    return { total, present, absent };
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

  return (
    <motion.div
      className="mark-attendance-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <div className="header-content">
          <h1>Mark Attendance</h1>
          <p>Select filters and mark attendance for students</p>
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

      <div className="attendance-form-section">
        <motion.div className="form-card" variants={cardVariants}>
          <div className="form-header">
            <FontAwesomeIcon icon={faFilter} />
            <h2>Select Filters</h2>
          </div>

          <div className="attendance-form">
            <div className="form-row">
              <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
                <label>Select Date</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <input
                    type="date"
                    value={convertToInputDate(selectedDate)}
                    onChange={(e) => setSelectedDate(convertToDisplayDate(e.target.value))}
                  />
                  <FontAwesomeIcon icon={faCalendar} />
                </div>
              </div>

            </div>
          </div>

          {students.length > 0 && (
            <div className="attendance-stats">
              <div className="stats-grid">
                <div className="stat-item total">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{getAttendanceStats().total}</span>
                </div>
                <div className="stat-item present">
                  <span className="stat-label">Present</span>
                  <span className="stat-value">{getAttendanceStats().present}</span>
                </div>
                <div className="stat-item absent">
                  <span className="stat-label">Absent</span>
                  <span className="stat-value">{getAttendanceStats().absent}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {loading && (
        <div className="loading-section">
          <div className="loading">Loading students...</div>
        </div>
      )}

      {students.length > 0 && !loading && (
        <motion.div className="students-section" variants={cardVariants}>
          <div className="students-header">
            <div className="header-info">
              <h2>
                <FontAwesomeIcon icon={faUsers} />
                Students in {selectedBranch} Year {selectedYear}
              </h2>
              <p>Date: {selectedDate}</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSaveAttendance}
              disabled={saving}
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSave} spin />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Save Attendance
                </>
              )}
            </button>
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
                  <div className="student-details">
                    <span className="student-uid">{student.uid}</span>
                    <span className="student-name">{student.studentName}</span>
                    <span className="student-branch">{student.branch}</span>
                    <span className="student-roll">Roll No: {student.rollNo}</span>
                  </div>
                </div>
                <div className="attendance-buttons">
                  <button
                    className={`attendance-btn present ${attendanceData[student._id] === 'present' ? 'active' : ''}`}
                    onClick={() => handleAttendanceChange(student._id, 'present')}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Present
                  </button>
                  <button
                    className={`attendance-btn absent ${attendanceData[student._id] === 'absent' ? 'active' : ''}`}
                    onClick={() => handleAttendanceChange(student._id, 'absent')}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    Absent
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {students.length === 0 && !loading && selectedYear && selectedBranch && (
        <motion.div className="no-students" variants={cardVariants}>
          <FontAwesomeIcon icon={faUsers} />
          <h3>No students found</h3>
          <p>No students found in {selectedBranch} Year {selectedYear}</p>
        </motion.div>
      )}
    </motion.div>
  );
};









const convertToInputDate = (ddmmyyyy) => {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`; // format for <input type="date">
};

const convertToDisplayDate = (yyyymmdd) => {
  const [yyyy, mm, dd] = yyyymmdd.split('-');
  return `${dd}/${mm}/${yyyy}`; // format for your app state
};







export default MarkAttendance; 