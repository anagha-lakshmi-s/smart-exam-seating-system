import { slotKeyOf, slotLabel } from '../hooks/useArrangement'

export default function SlotPicker({ slots, activeKey, onChange }) {
  if (slots.length === 0) return null
  return (
    <div className="slot-bar">
      <select className="input" value={activeKey} onChange={(e) => onChange(e.target.value)}>
        {slots.map((s) => (
          <option key={slotKeyOf(s)} value={slotKeyOf(s)}>{slotLabel(s)}</option>
        ))}
      </select>
    </div>
  )
}