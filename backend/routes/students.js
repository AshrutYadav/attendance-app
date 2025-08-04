const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const router = express.Router();

// Validation middleware
const validateStudent = [
  body('studentName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Student name must be between 2 and 50 characters'),
  body('branch')
    .isIn(['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'])
    .withMessage('Invalid branch'),
  body('rollNo')
    .isInt({ min: 1 })
    .withMessage('Roll number must be a positive integer'),
  body('studentPhone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit student phone number'),
  body('parentPhone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit parent phone number'),
  body('year')
    .isIn([1, 2, 3, 4])
    .withMessage('Year must be 1, 2, 3, or 4'),
  body('admissionYear')
    .isInt({ min: 2020, max: new Date().getFullYear() })
    .withMessage('Admission year must be between 2020 and current year')
];

// @route   POST /api/students
// @desc    Add new student
// @access  Private
router.post('/', validateStudent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { studentName, branch, rollNo, studentPhone, parentPhone, year, admissionYear } = req.body;

    // Check if student with same roll number in same branch and year already exists
    const existingStudent = await Student.findOne({
      branch,
      year,
      rollNo,
      admissionYear
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists in this branch and year'
      });
    }

    // Generate UID
    const uid = Student.generateUID(year, branch, admissionYear, rollNo);

    // Check if UID already exists
    const existingUID = await Student.findOne({ uid });
    if (existingUID) {
      return res.status(400).json({
        success: false,
        message: 'Student with this UID already exists'
      });
    }

    const student = new Student({
      studentName,
      uid,
      branch,
      rollNo,
      studentPhone,
      parentPhone,
      year,
      admissionYear
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student
    });

  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/statistics
// @desc    Get student statistics (branch-wise and year-wise)
// @access  Private
router.get('/statistics', async (req, res) => {
  try {
    // Branch-wise statistics
    const branchStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 },
          students: { $push: '$$ROOT' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Year-wise statistics
    const yearStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 },
          students: { $push: '$$ROOT' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Branch and Year combination statistics
    const branchYearStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { branch: '$branch', year: '$year' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.branch',
          years: {
            $push: {
              year: '$_id.year',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Total students
    const totalStudents = await Student.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalStudents,
        branchStats,
        yearStats,
        branchYearStats
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/branch/:branch
// @desc    Get all students by branch
// @access  Private
router.get('/branch/:branch', async (req, res) => {
  try {
    const { branch } = req.params;
    const { year } = req.query;

    let query = { 
      branch: branch.toUpperCase(),
      isActive: true 
    };

    if (year) {
      query.year = parseInt(year);
    }

    const students = await Student.find(query).sort({ year: 1, rollNo: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Get students by branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/year/:year
// @desc    Get all students by year
// @access  Private
router.get('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { branch } = req.query;

    let query = { 
      year: parseInt(year),
      isActive: true 
    };

    if (branch) {
      query.branch = branch.toUpperCase();
    }

    const students = await Student.find(query).sort({ branch: 1, rollNo: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Get students by year error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/attendance/:year/:branch
// @desc    Get students for attendance marking by year and branch
// @access  Private
router.get('/attendance/:year/:branch', async (req, res) => {
  try {
    const { year, branch } = req.params;

    const students = await Student.find({
      year: parseInt(year),
      branch: branch.toUpperCase(),
      isActive: true
    }).sort({ rollNo: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Get students for attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/students/branch/:branch
// @desc    Update students by branch
// @access  Private
router.put('/branch/:branch', async (req, res) => {
  try {
    const { branch } = req.params;
    const { year, updateData } = req.body;

    let query = { 
      branch: branch.toUpperCase(),
      isActive: true 
    };

    if (year) {
      query.year = parseInt(year);
    }

    const result = await Student.updateMany(query, updateData);

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} students`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Update students by branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/students/year/:year
// @desc    Update students by year
// @access  Private
router.put('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { branch, updateData } = req.body;

    let query = { 
      year: parseInt(year),
      isActive: true 
    };

    if (branch) {
      query.branch = branch.toUpperCase();
    }

    const result = await Student.updateMany(query, updateData);

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} students`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Update students by year error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/students/branch/:branch
// @desc    Delete students by branch
// @access  Private
router.delete('/branch/:branch', async (req, res) => {
  try {
    const { branch } = req.params;
    const { year } = req.query;

    let query = { 
      branch: branch.toUpperCase(),
      isActive: true 
    };

    if (year) {
      query.year = parseInt(year);
    }

    const result = await Student.updateMany(query, { isActive: false });

    res.json({
      success: true,
      message: `Deleted ${result.modifiedCount} students`,
      deletedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Delete students by branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/students/year/:year
// @desc    Delete students by year
// @access  Private
router.delete('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { branch } = req.query;

    let query = { 
      year: parseInt(year),
      isActive: true 
    };

    if (branch) {
      query.branch = branch.toUpperCase();
    }

    const result = await Student.updateMany(query, { isActive: false });

    res.json({
      success: true,
      message: `Deleted ${result.modifiedCount} students`,
      deletedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Delete students by year error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/students/:uid
// @desc    Update student details
// @access  Private
router.put('/:uid', validateStudent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { uid } = req.params;
    const { studentName, branch, rollNo, studentPhone, parentPhone, year, admissionYear } = req.body;

    // Find student by UID
    let student = await Student.findOne({ uid });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if new roll number conflicts with existing student (excluding current student)
    const existingStudent = await Student.findOne({
      branch,
      year,
      rollNo,
      admissionYear,
      uid: { $ne: uid }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists in this branch and year'
      });
    }

    // Generate new UID if year, branch, admissionYear, or rollNo changed
    const newUID = Student.generateUID(year, branch, admissionYear, rollNo);
    
    // Check if new UID conflicts with existing student (excluding current student)
    if (newUID !== uid) {
      const existingUID = await Student.findOne({ uid: newUID });
      if (existingUID) {
        return res.status(400).json({
          success: false,
          message: 'Student with this UID already exists'
        });
      }
    }

    // Update student
    student.studentName = studentName;
    student.uid = newUID;
    student.branch = branch;
    student.rollNo = rollNo;
    student.studentPhone = studentPhone;
    student.parentPhone = parentPhone;
    student.year = year;
    student.admissionYear = admissionYear;

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/students/:uid
// @desc    Delete student
// @access  Private
router.delete('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await Student.findOne({ uid });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await Student.findByIdAndDelete(student._id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/search/:uid
// @desc    Search student by UID
// @access  Private
router.get('/search/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await Student.findOne({ uid });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Search student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students
// @desc    Get all students with filters
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { branch, year, page = 1, limit = 10 } = req.query;

    let query = { isActive: true };
    
    if (branch) {
      query.branch = branch.toUpperCase();
    }
    
    if (year) {
      query.year = parseInt(year);
    }

    const students = await Student.find(query)
      .sort({ year: 1, branch: 1, rollNo: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: students
    });

  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/students/branches
// @desc    Get all available branches
// @access  Private
router.get('/branches', async (req, res) => {
  try {
    const branches = await Student.distinct('branch');
    
    res.json({
      success: true,
      data: branches.sort()
    });

  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 