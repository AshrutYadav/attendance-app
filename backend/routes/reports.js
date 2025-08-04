const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private (Admin/Manager)
router.get('/dashboard', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's statistics
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('user', 'firstName lastName department');

    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;

    // Total users
    const totalUsers = await User.countDocuments({ isActive: true });

    // This month's statistics
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const monthAttendance = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalHoursThisMonth = monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    const totalOvertimeThisMonth = monthAttendance.reduce((sum, a) => sum + (a.overtime || 0), 0);

    // Department-wise statistics
    const departmentStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $group: {
          _id: '$userInfo.department',
          totalHours: { $sum: '$totalHours' },
          totalOvertime: { $sum: '$overtime' },
          presentDays: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        today: {
          present: presentToday,
          absent: absentToday,
          late: lateToday,
          total: totalUsers
        },
        thisMonth: {
          totalHours: Math.round(totalHoursThisMonth * 100) / 100,
          totalOvertime: Math.round(totalOvertimeThisMonth * 100) / 100,
          averageHoursPerDay: Math.round((totalHoursThisMonth / moment().date()) * 100) / 100
        },
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get attendance report by date range
// @route   GET /api/reports/attendance
// @access  Private (Admin/Manager)
router.get('/attendance', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate, department, userId } = req.query;

    const start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
    const end = endDate ? new Date(endDate) : new Date();

    const query = {
      date: { $gte: start, $lte: end }
    };

    if (department) {
      query['user.department'] = department;
    }

    if (userId) {
      query.user = userId;
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'firstName lastName employeeId department position')
      .sort({ date: -1 });

    // Calculate summary
    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      totalHours: Math.round(attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) * 100) / 100,
      totalOvertime: Math.round(attendance.reduce((sum, a) => sum + (a.overtime || 0), 0) * 100) / 100
    };

    res.json({
      success: true,
      data: {
        attendance,
        summary,
        dateRange: {
          start: start,
          end: end
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get user attendance report
// @route   GET /api/reports/user/:userId
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Check if user can access this report
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this report'
      });
    }

    const start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
    const end = endDate ? new Date(endDate) : new Date();

    const attendance = await Attendance.find({
      user: req.params.userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate summary
    const summary = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      totalHours: Math.round(attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) * 100) / 100,
      totalOvertime: Math.round(attendance.reduce((sum, a) => sum + (a.overtime || 0), 0) * 100) / 100,
      averageHoursPerDay: attendance.length > 0 ? 
        Math.round((attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length) * 100) / 100 : 0
    };

    res.json({
      success: true,
      data: {
        user,
        attendance,
        summary,
        dateRange: {
          start: start,
          end: end
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get department report
// @route   GET /api/reports/department/:department
// @access  Private (Admin/Manager)
router.get('/department/:department', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { department } = req.params;

    const start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
    const end = endDate ? new Date(endDate) : new Date();

    // Get users in department
    const users = await User.find({ department, isActive: true }).select('firstName lastName employeeId');

    // Get attendance for users in department
    const attendance = await Attendance.find({
      user: { $in: users.map(u => u._id) },
      date: { $gte: start, $lte: end }
    }).populate('user', 'firstName lastName employeeId');

    // Calculate department summary
    const summary = {
      totalUsers: users.length,
      totalRecords: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      totalHours: Math.round(attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) * 100) / 100,
      totalOvertime: Math.round(attendance.reduce((sum, a) => sum + (a.overtime || 0), 0) * 100) / 100
    };

    res.json({
      success: true,
      data: {
        department,
        users,
        attendance,
        summary,
        dateRange: {
          start: start,
          end: end
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 