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
                    const isSelected = st && st.rollNo === selectedRoll
                    const cls = st
                      ? `seat branch-${st.branch}${isSelected ? ' seat-selected' : ''}`
                      : 'seat seat-empty'
                    return (
                      <button
                        key={s.seat}
                        className={cls}
                        onClick={() => st && onSelect(s)}
                        title={st ? `${st.name} (${st.branch})` : 'Empty seat'}
                      >
                        {st ? (
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