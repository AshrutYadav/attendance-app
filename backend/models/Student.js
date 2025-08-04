const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [50, 'Student name cannot exceed 50 characters']
  },
  uid: {
    type: String,
    required: [true, 'UID is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Format: 1CSE2410 (Year + Branch + Year + RollNo)
        return /^[1-4][A-Z]{2,3}\d{2}\d{2,3}$/.test(v);
      },
      message: 'UID must be in format: YearBranchYearRollNo (e.g., 1CSE2410)'
    }
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'AI', 'DS'],
    uppercase: true
  },
  rollNo: {
    type: Number,
    required: [true, 'Roll number is required'],
    min: [1, 'Roll number must be at least 1']
  },
  studentPhone: {
    type: String,
    required: [true, 'Student phone number is required'],
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  parentPhone: {
    type: String,
    required: [true, 'Parent phone number is required'],
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    enum: [1, 2, 3, 4],
    default: 1
  },
  admissionYear: {
    type: Number,
    required: [true, 'Admission year is required'],
    min: [2020, 'Admission year must be 2020 or later'],
    max: [new Date().getFullYear(), 'Admission year cannot be in the future']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate UID if not provided
studentSchema.pre('save', function(next) {
  if (!this.uid) {
    const yearCode = this.year;
    const branchCode = this.branch;
    const admissionYearCode = this.admissionYear.toString().slice(-2); // Last 2 digits
    const rollNoStr = this.rollNo.toString().padStart(2, '0');
    this.uid = `${yearCode}${branchCode}${admissionYearCode}${rollNoStr}`;
  }
  next();
});

// Static method to generate UID
studentSchema.statics.generateUID = function(year, branch, admissionYear, rollNo) {
  const yearCode = year;
  const branchCode = branch;
  const admissionYearCode = admissionYear.toString().slice(-2);
  const rollNoStr = rollNo.toString().padStart(2, '0');
  return `${yearCode}${branchCode}${admissionYearCode}${rollNoStr}`;
};

// Index for faster queries
studentSchema.index({ uid: 1 });
studentSchema.index({ branch: 1 });
studentSchema.index({ year: 1 });

module.exports = mongoose.model('Student', studentSchema); 