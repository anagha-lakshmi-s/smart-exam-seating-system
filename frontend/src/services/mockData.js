export const BRANCHES = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE']

export const initialStudents = [
  { id: 1, rollNo: 'CS101', name: 'Aarav Sharma', branch: 'CSE', semester: 5 },
  { id: 2, rollNo: 'CS102', name: 'Diya Patel', branch: 'CSE', semester: 5 },
  { id: 3, rollNo: 'CS103', name: 'Rohan Gupta', branch: 'CSE', semester: 5 },
  { id: 4, rollNo: 'EC101', name: 'Ananya Reddy', branch: 'ECE', semester: 5 },
  { id: 5, rollNo: 'EC102', name: 'Karan Mehta', branch: 'ECE', semester: 5 },
  { id: 6, rollNo: 'EC103', name: 'Sneha Iyer', branch: 'ECE', semester: 5 },
  { id: 7, rollNo: 'ME101', name: 'Vikram Singh', branch: 'MECH', semester: 5 },
  { id: 8, rollNo: 'ME102', name: 'Priya Nair', branch: 'MECH', semester: 5 },
  { id: 9, rollNo: 'CE101', name: 'Arjun Das', branch: 'CIVIL', semester: 5 },
  { id: 10, rollNo: 'CE102', name: 'Meera Joshi', branch: 'CIVIL', semester: 5 },
  { id: 11, rollNo: 'EE101', name: 'Rahul Verma', branch: 'EEE', semester: 5 },
  { id: 12, rollNo: 'EE102', name: 'Kavya Menon', branch: 'EEE', semester: 5 },
]
export const initialHalls = [
  { id: 1, name: 'Hall A', rows: 5, benches: 6, seatsPerBench: 2, available: true },
  { id: 2, name: 'Hall B', rows: 5, benches: 6, seatsPerBench: 2, available: true },
  { id: 3, name: 'Hall C', rows: 5, benches: 8, seatsPerBench: 2, available: true },
]
export const initialSubjects = [
  { id: 1, code: 'MA201', name: 'Engineering Mathematics' },
  { id: 2, code: 'CS301', name: 'Database Management Systems' },
  { id: 3, code: 'EC301', name: 'Digital Signal Processing' },
  { id: 4, code: 'CE301', name: 'Structural Analysis' },
  { id: 5, code: 'EE301', name: 'Circuit Theory' },
]

export const initialExams = [
  { id: 1, subjectId: 1, date: '2026-10-20', startTime: '10:00', endTime: '13:00', branches: ['CSE', 'ECE', 'MECH'] },
  { id: 2, subjectId: 4, date: '2026-10-20', startTime: '10:00', endTime: '13:00', branches: ['CIVIL'] },
  { id: 3, subjectId: 5, date: '2026-10-20', startTime: '10:00', endTime: '13:00', branches: ['EEE'] },
  { id: 4, subjectId: 2, date: '2026-10-22', startTime: '10:00', endTime: '13:00', branches: ['CSE'] },
]