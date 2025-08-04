const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS']
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent'],
    default: 'absent'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to ensure unique attendance per student per date
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Index for efficient queries
attendanceSchema.index({ year: 1, branch: 1, date: 1 });
attendanceSchema.index({ student: 1, date: -1 });

// Static method to get attendance statistics
attendanceSchema.statics.getStatistics = async function(year, branch, startDate, endDate) {
  const matchStage = {
    year: parseInt(year),
    branch: branch.toUpperCase()
  };

  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    { $match: matchStage },
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
};

// Static method to get student attendance history
attendanceSchema.statics.getStudentHistory = async function(studentId, startDate, endDate) {
  const matchStage = { student: mongoose.Types.ObjectId(studentId) };

  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.find(matchStage)
    .populate('student', 'studentName uid rollNo branch year')
    .sort({ date: -1 });
};

// Static method to get today's attendance
attendanceSchema.statics.getTodayAttendance = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await this.find({ date: today })
    .populate('student', 'studentName uid rollNo branch year')
    .sort({ 'student.branch': 1, 'student.year': 1, 'student.rollNo': 1 });
};

// Static method to mark attendance for multiple students
attendanceSchema.statics.markAttendance = async function(year, branch, date, attendanceData, markedBy) {
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  // Check if attendance for this date already exists
  const existingAttendance = await this.findOne({
    year: parseInt(year),
    branch: branch.toUpperCase(),
    date: attendanceDate
  });

  if (existingAttendance) {
    throw new Error('Attendance for this date already exists');
  }

  // Create attendance records
  const attendanceRecords = attendanceData.map(record => ({
    student: record.studentId,
    year: parseInt(year),
    branch: branch.toUpperCase(),
    date: attendanceDate,
    status: record.status,
    markedBy: markedBy
  }));

  return await this.insertMany(attendanceRecords);
};

// Static method to update attendance for multiple students
attendanceSchema.statics.updateAttendance = async function(year, branch, date, attendanceData, updatedBy) {
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const updatePromises = attendanceData.map(record => 
    this.updateOne(
      {
        student: record.studentId,
        year: parseInt(year),
        branch: branch.toUpperCase(),
        date: attendanceDate
      },
      {
        status: record.status,
        updatedBy: updatedBy,
        updatedAt: new Date()
      }
    )
  );

  const results = await Promise.all(updatePromises);
  return results.reduce((total, result) => total + result.modifiedCount, 0);
};

// Pre-save middleware to validate data
attendanceSchema.pre('save', function(next) {
  // Ensure date is set to start of day
  if (this.date) {
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema); 