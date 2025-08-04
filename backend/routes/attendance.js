const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const router = express.Router();

// @route   POST /api/attendance/mark
// @desc    Mark attendance for multiple students
// @access  Private
router.post('/mark', async (req, res) => {
  try {
    const { year, branch, date, attendanceData } = req.body;

    // Validate required fields
    if (!year || !branch || !date || !attendanceData) {
      return res.status(400).json({
        success: false,
        message: 'Year, branch, date, and attendance data are required'
      });
    }

    const attendanceDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance for this date already exists
    const existingAttendance = await Attendance.findOne({
      year: parseInt(year),
      branch: branch.toUpperCase(),
      date: attendanceDate
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance for this date already exists'
      });
    }

    // Create attendance records
    const attendanceRecords = [];
    for (const record of attendanceData) {
      const { studentId, status } = record;
      
      // Verify student exists
      const student = await Student.findById(studentId);
      if (!student) {
        continue;
      }

      attendanceRecords.push({
        student: studentId,
        year: parseInt(year),
        branch: branch.toUpperCase(),
        date: attendanceDate,
        status: status, // 'present' or 'absent'
        markedBy: req.user.id
      });
    }

    // Save all attendance records
    const savedAttendance = await Attendance.insertMany(attendanceRecords);

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${savedAttendance.length} students`,
      data: savedAttendance
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/attendance/:year/:branch/:date
// @desc    Get attendance for specific date, year, and branch
// @access  Private
router.get('/:year/:branch/:date', async (req, res) => {
  try {
    const { year, branch, date } = req.params;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      year: parseInt(year),
      branch: branch.toUpperCase(),
      date: attendanceDate
    }).populate('student', 'studentName uid rollNo');

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/attendance/:year/:branch/:date
// @desc    Update attendance for specific date, year, and branch
// @access  Private
router.put('/:year/:branch/:date', async (req, res) => {
  try {
    const { year, branch, date } = req.params;
    const { attendanceData } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Update attendance records
    let updatedCount = 0;
    for (const record of attendanceData) {
      const { studentId, status } = record;
      
      const result = await Attendance.updateOne(
        {
          student: studentId,
          year: parseInt(year),
          branch: branch.toUpperCase(),
          date: attendanceDate
        },
        {
          status: status,
          updatedBy: req.user.id,
          updatedAt: new Date()
        }
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Updated attendance for ${updatedCount} students`,
      updatedCount
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/attendance/statistics/:year/:branch
// @desc    Get attendance statistics for year and branch
// @access  Private
router.get('/statistics/:year/:branch', async (req, res) => {
  try {
    const { year, branch } = req.params;
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          year: parseInt(year),
          branch: branch.toUpperCase(),
          ...dateQuery
        }
      },
      {
        $group: {
          _id: {
            date: '$date',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          totalStudents: { $sum: '$count' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: attendanceStats
    });

  } catch (error) {
    console.error('Get attendance statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get attendance history for a specific student
// @access  Private
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const attendance = await Attendance.find({
      student: studentId,
      ...dateQuery
    }).populate('student', 'studentName uid rollNo branch year')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance
// @access  Private
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: today
    }).populate('student', 'studentName uid rollNo branch year')
      .sort({ 'student.branch': 1, 'student.year': 1, 'student.rollNo': 1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/attendance
// @desc    Get all attendance with filters
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { year, branch, date, status, page = 1, limit = 10 } = req.query;

    let query = {};
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (branch) {
      query.branch = branch.toUpperCase();
    }
    
    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      query.date = attendanceDate;
    }
    
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'studentName uid rollNo branch year')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      count: attendance.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: attendance
    });

  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 