import { BRANCHES, initialHalls } from '../services/mockData'

export const BRANCH_SUBJECT = {
  CSE: 'CS301 - Database Management Systems',
  ECE: 'EC301 - Digital Signal Processing',
  MECH: 'MA201 - Engineering Mathematics',
  CIVIL: 'CE301 - Structural Analysis',
  EEE: 'EE301 - Circuit Theory',
}

const PREFIX = { CSE: 'CS', ECE: 'EC', MECH: 'ME', CIVIL: 'CE', EEE: 'EE' }

// Hall C is only partly filled so it shows empty seats (60 + 60 + 58 = 178 assigned)
const FILL_LIMIT = { 1: Infinity, 2: Infinity, 3: 58 }

export function buildMockSeating() {
  const counters = {}
  BRANCHES.forEach((b) => (counters[b] = 0))

  const halls = initialHalls.map((hall) => {
    const seats = []
    let assigned = 0

    for (let r = 0; r < hall.rows; r++) {
      for (let b = 0; b < hall.benches; b++) {
        for (let s = 0; s < hall.seatsPerBench; s++) {
          const col = b * hall.seatsPerBench + s
          let student = null

          if (assigned < FILL_LIMIT[hall.id]) {
            const branch = BRANCHES[(r + col) % BRANCHES.length]
            counters[branch] += 1
            const rollNo = `${PREFIX[branch]}${200 + counters[branch]}`
            student = { rollNo, name: `Student ${rollNo}`, branch }
            assigned += 1
          }
          seats.push({ row: r + 1, bench: b + 1, seat: s + 1, student })
        }
      }
    }
    return { hall, seats, assigned }
  })

  const unplaced = [
    {
      rollNo: 'CS299',
      name: 'Student CS299',
      branch: 'CSE',
      reason:
        'This student could not be assigned because all remaining available seats would violate the selected seating constraints.',
    },
    {
      rollNo: 'ME299',
      name: 'Student ME299',
      branch: 'MECH',
      reason:
        'This student could not be assigned because all remaining available seats would violate the selected seating constraints.',
    },
  ]

  return { halls, unplaced }
}
export const EXAM_SLOT = { date: '20 Oct 2026', time: '10:00 - 13:00' }

// Built once so every page (Seating, Find My Seat, Reports, Dashboard) sees the same data
export const mockSeating = buildMockSeating()