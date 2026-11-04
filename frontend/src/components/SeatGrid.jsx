
export default function SeatGrid({ hall, seats, selectedRoll, onSelect }) {
  const rows = []

  for (let r = 1; r <= hall.rows; r++) {
    rows.push(seats.filter((s) => s.row === r))
  }

  return (
    <div className="grid-scroll">
      <div className="grid-inner">
        <p className="front-label">Front of hall</p>

        {rows.map((rowSeats, i) => (
          <div className="seat-row" key={i}>
            <span className="row-label">R{i + 1}</span>

            {Array.from({ length: hall.benches }, (_, bi) => (
              <div className="bench" key={bi}>
                {rowSeats
                  .filter((s) => s.bench === bi + 1)
                  .map((s) => {
                    const st = s.student
                    const masked = Boolean(st) && !st.rollNo
                    const isSelected =
                      Boolean(st) && !masked && st.rollNo === selectedRoll

                    let cls = 'seat seat-empty'
                    let title = 'Empty seat'

                    if (masked) {
                      cls = 'seat seat-occupied'
                      title = 'Taken by another student'
                    } else if (st) {
                      cls = `seat branch-${st.branch}${
                        isSelected ? ' seat-selected' : ''
                      }`
                      title = `${st.name} (${st.branch})`
                    }

                    return (
                      <button
                        key={s.seat}
                        className={cls}
                        onClick={() => st && !masked && onSelect(s)}
                        title={title}
                      >
                        {masked ? (
                          <span className="seat-branch">Taken</span>
                        ) : st ? (
                          <>
                            <span className="seat-roll">{st.rollNo}</span>
                            <span className="seat-branch">{st.branch}</span>
                          </>
                        ) : (
                          <span className="seat-branch">Empty</span>
                        )}
                      </button>
                    )
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
