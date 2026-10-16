import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { seatingApi } from '../services/api'
import { useFetch } from './useFetch'

export function slotKeyOf(slot) {
  return `${slot.date}_${slot.startTime}`
}

export function slotLabel(slot) {
  const exams = `${slot.examCount} exam${slot.examCount === 1 ? '' : 's'}`
  const state = slot.generated ? 'generated' : 'not generated'
  return `${slot.date}, ${slot.startTime} - ${slot.endTime} (${exams}, ${state})`
}

// Loads the exam slots and the saved arrangement of the selected slot
export function useArrangement() {
  const [params] = useSearchParams()
  const [chosen, setChosen] = useState(params.get('slot') || '')
  const slotsState = useFetch(seatingApi.slots)
  const slots = slotsState.data || []

  const fallback = slots.find((s) => s.generated) || slots[0]
  const activeSlot = slots.find((s) => slotKeyOf(s) === chosen) || fallback
  const activeKey = activeSlot ? slotKeyOf(activeSlot) : ''

  const arrangementState = useFetch(
    () => (activeSlot ? seatingApi.get(activeSlot.date, activeSlot.startTime) : Promise.resolve(null)),
    [activeKey]
  )

  return { slots, activeSlot, activeKey, setChosen, slotsState, arrangementState }
}