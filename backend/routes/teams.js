const express = require('express');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/teams/departments
// @access  Private (Admin/Manager)
router.get('/departments', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const departments = await User.distinct('department', { isActive: true });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const userCount = await User.countDocuments({ 
          department: dept, 
          isActive: true 
        });

        // Get today's attendance for department
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await Attendance.find({
          date: { $gte: today, $lt: tomorrow }
        }).populate({
          path: 'user',
          match: { department: dept, isActive: true }
        });

        const presentToday = todayAttendance.filter(a => a.user && a.status === 'present').length;

        return {
          name: dept,
          totalUsers: userCount,
          presentToday,
          attendanceRate: userCount > 0 ? Math.round((presentToday / userCount) * 100) : 0
        };
      })
    );

    res.json({
      success: true,
      data: departmentStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get team members by department
// @route   GET /api/teams/department/:department
// @access  Private (Admin/Manager)
router.get('/department/:department', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { department } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const users = await User.find({ 
      department, 
      isActive: true 
    })
    .select('-password')
    .sort({ firstName: 1, lastName: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({ 
      department, 
      isActive: true 
    });

    // Get today's attendance for team members
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      user: { $in: users.map(u => u._id) },
      date: { $gte: today, $lt: tomorrow }
    });

    // Add attendance status to users
    const usersWithAttendance = users.map(user => {
      const attendance = todayAttendance.find(a => a.user.toString() === user._id.toString());
      return {
        ...user.toObject(),
        todayStatus: attendance ? attendance.status : 'absent',
        checkInTime: attendance?.checkIn?.time || null,
        checkOutTime: attendance?.checkOut?.time || null
      };
    });

    res.json({
      success: true,
      data: {
        department,
        users: usersWithAttendance,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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

// @desc    Get team member details
// @route   GET /api/teams/member/:userId
// @access  Private
router.get('/member/:userId', protect, async (req, res) => {
  try {
    // Check if user can access this member
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this member'
      });
    }

    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent attendance (last 7 days)
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();
    const recentAttendance = await Attendance.find({
      user: req.params.userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    // Get this month's statistics
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const monthAttendance = await Attendance.find({
      user: req.params.userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthlyStats = {
      totalDays: monthAttendance.length,
      present: monthAttendance.filter(a => a.status === 'present').length,
      absent: monthAttendance.filter(a => a.status === 'absent').length,
      late: monthAttendance.filter(a => a.status === 'late').length,
      totalHours: Math.round(monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) * 100) / 100,
      totalOvertime: Math.round(monthAttendance.reduce((sum, a) => sum + (a.overtime || 0), 0) * 100) / 100
    };

    res.json({
      success: true,
      data: {
        user,
        recentAttendance,
        monthlyStats
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

// @desc    Get team overview
// @route   GET /api/teams/overview
// @access  Private (Admin/Manager)
router.get('/overview', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { department } = req.query;

    const query = { isActive: true };
    if (department) {
      query.department = department;
    }

    // Get total team members
    const totalMembers = await User.countDocuments(query);

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate({
      path: 'user',
      match: query
    });

    const presentToday = todayAttendance.filter(a => a.user && a.status === 'present').length;
    const absentToday = todayAttendance.filter(a => a.user && a.status === 'absent').length;
    const lateToday = todayAttendance.filter(a => a.user && a.status === 'late').length;

    // Get this week's attendance
    const startOfWeek = moment().startOf('week').toDate();
    const endOfWeek = moment().endOf('week').toDate();

    const weekAttendance = await Attendance.find({
      date: { $gte: startOfWeek, $lte: endOfWeek }
    }).populate({
      path: 'user',
      match: query
    });

    const weeklyStats = {
      totalHours: Math.round(weekAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) * 100) / 100,
      totalOvertime: Math.round(weekAttendance.reduce((sum, a) => sum + (a.overtime || 0), 0) * 100) / 100,
      averageHoursPerDay: weekAttendance.length > 0 ? 
        Math.round((weekAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / weekAttendance.length) * 100) / 100 : 0
    };

    res.json({
      success: true,
      data: {
        totalMembers,
        today: {
          present: presentToday,
          absent: absentToday,
          late: lateToday,
          attendanceRate: totalMembers > 0 ? Math.round((presentToday / totalMembers) * 100) : 0
        },
        thisWeek: weeklyStats
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