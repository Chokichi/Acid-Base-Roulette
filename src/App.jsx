import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import confetti from 'canvas-confetti'
import { generateReaction, formulaSegments } from './reactions.js'

const ROLE_LABELS = {
  acid:           { text: 'Acid',            short: 'Acid',    color: '#ef4444' },
  base:           { text: 'Base',            short: 'Base',    color: '#3b82f6' },
  conjugateAcid:  { text: 'Conjugate Acid',  short: 'C. Acid', color: '#f59e0b' },
  conjugateBase:  { text: 'Conjugate Base',  short: 'C. Base', color: '#10b981' },
}

function LabelText({ role }) {
  const meta = ROLE_LABELS[role]
  return (
    <>
      <span className="label-full">{meta.text}</span>
      <span className="label-short">{meta.short}</span>
    </>
  )
}
const ROLE_KEYS = ['acid', 'base', 'conjugateAcid', 'conjugateBase']

function Formula({ formula, charge, coef }) {
  const segments = formulaSegments(formula, charge)
  return (
    <span className="formula">
      {coef && coef > 1 ? <span className="coef">{coef}</span> : null}
      {segments.map((s, i) => {
        if (s.kind === 'sub') return <sub key={i}>{s.text}</sub>
        if (s.kind === 'sup') return <sup key={i}>{s.text}</sup>
        return <span key={i}>{s.text}</span>
      })}
    </span>
  )
}

function DraggableLabel({ id, role, disabled }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { role },
    disabled,
  })
  const meta = ROLE_LABELS[role]
  const style = {
    backgroundColor: meta.color,
    // hide the source while dragging — the DragOverlay clone follows the cursor.
    visibility: isDragging ? 'hidden' : 'visible',
    cursor: disabled ? 'default' : 'grab',
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="label"
      {...listeners}
      {...attributes}
    >
      <LabelText role={role} />
    </div>
  )
}

function LabelChip({ role }) {
  const meta = ROLE_LABELS[role]
  return (
    <div
      className="label dragging"
      style={{ backgroundColor: meta.color, cursor: 'grabbing' }}
    >
      <LabelText role={role} />
    </div>
  )
}

function PlacedLabel({ role, slotId, status, onRemove, locked }) {
  const meta = ROLE_LABELS[role]
  const bg = status === 'correct' ? '#10b981' : meta.color
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${slotId}`,
    data: { role, fromSlotId: slotId },
    disabled: locked,
  })
  return (
    <div
      ref={setNodeRef}
      className={`label placed ${status === 'correct' ? 'locked' : ''}`}
      style={{
        backgroundColor: bg,
        cursor: locked ? 'default' : 'grab',
        visibility: isDragging ? 'hidden' : 'visible',
      }}
      onClick={locked ? undefined : onRemove}
      title={locked ? 'Locked in' : 'Drag to move, click to remove'}
      {...listeners}
      {...attributes}
    >
      <LabelText role={role} />
    </div>
  )
}

function SpeciesSlot({ species, slotId, placedRole, status, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId })
  const locked = status === 'correct'
  return (
    <div className="species">
      <div
        ref={setNodeRef}
        className={`drop-zone ${isOver ? 'over' : ''} ${status ?? ''}`}
      >
        {placedRole ? (
          <PlacedLabel
            role={placedRole}
            slotId={slotId}
            status={status}
            onRemove={onRemove}
            locked={locked}
          />
        ) : (
          <span className="drop-hint">drop label</span>
        )}
      </div>
      <Formula formula={species.formula} charge={species.charge} coef={species.coef} />
    </div>
  )
}

function fireConfetti() {
  const end = Date.now() + 600
  const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981']
  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

export default function App() {
  const [reaction, setReaction] = useState(() => generateReaction())
  const [placements, setPlacements] = useState({}) // slotId -> role
  const [statuses, setStatuses] = useState({})     // slotId -> 'correct' | 'incorrect'
  const [submitted, setSubmitted] = useState(false)
  const [solved, setSolved] = useState(false)
  const [streak, setStreak] = useState(0)
  const [activeRole, setActiveRole] = useState(null) // role of currently-dragged label, for DragOverlay

  // Build slot list: 4 species in order [acid?, base?, cAcid, cBase] but their
  // role on the page is what we hide; we use stable slotIds tied to position.
  const slots = useMemo(() => {
    return [
      { id: 'r0', species: reaction.reactants[0] },
      { id: 'r1', species: reaction.reactants[1] },
      { id: 'p0', species: reaction.products[0]  },
      { id: 'p1', species: reaction.products[1]  },
    ]
  }, [reaction])

  const slotById = useMemo(
    () => Object.fromEntries(slots.map(s => [s.id, s])),
    [slots],
  )

  const placedRoles = useMemo(() => new Set(Object.values(placements)), [placements])
  const allFilled = ROLE_KEYS.every(r => placedRoles.has(r))

  const sensors = useSensors(
    // Mouse: small movement starts the drag immediately.
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // Touch: short hold-to-activate so a quick swipe still scrolls the page.
    // Without this, iOS Safari races the scroll vs. drag gesture and the drag
    // is intermittent in landscape where the page is taller than the viewport.
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 8 } }),
  )

  function handleDragStart(event) {
    setActiveRole(event.active.data.current?.role ?? null)
  }

  function handleDragCancel() {
    setActiveRole(null)
  }

  function handleDragEnd(event) {
    setActiveRole(null)
    if (solved) return
    const { active, over } = event
    if (!over) return
    const role = active.data.current?.role
    const slotId = over.id

    setPlacements(prev => {
      // If this slot is locked correct, ignore.
      if (statuses[slotId] === 'correct') return prev
      const next = { ...prev }
      // Remove this role from any other slot (unless that slot is locked correct).
      for (const [sid, r] of Object.entries(next)) {
        if (r === role && statuses[sid] !== 'correct') delete next[sid]
      }
      next[slotId] = role
      return next
    })
    // Reset that slot's status so user gets a fresh check next submit.
    setStatuses(prev => {
      if (prev[slotId] === 'correct') return prev
      const { [slotId]: _, ...rest } = prev
      return rest
    })
    setSubmitted(false)
  }

  function removePlacement(slotId) {
    if (statuses[slotId] === 'correct') return
    setPlacements(prev => {
      const { [slotId]: _, ...rest } = prev
      return rest
    })
    setStatuses(prev => {
      const { [slotId]: _, ...rest } = prev
      return rest
    })
    setSubmitted(false)
  }

  function handleSubmit() {
    const newStatuses = { ...statuses }
    let allCorrect = true
    for (const slot of slots) {
      const placed = placements[slot.id]
      if (!placed) { allCorrect = false; continue }
      if (placed === slot.species.role) {
        newStatuses[slot.id] = 'correct'
      } else {
        newStatuses[slot.id] = 'incorrect'
        allCorrect = false
      }
    }
    // Wipe incorrect placements so the user can try again.
    const newPlacements = { ...placements }
    for (const slot of slots) {
      if (newStatuses[slot.id] === 'incorrect') {
        delete newPlacements[slot.id]
        delete newStatuses[slot.id]
      }
    }
    setStatuses(newStatuses)
    setPlacements(newPlacements)
    setSubmitted(true)

    if (allCorrect) {
      setSolved(true)
      setStreak(s => s + 1)
      fireConfetti()
    } else {
      // streak does NOT break on wrong answers per requirements;
      // the user just retries. Comment out the next line to keep streak.
      // setStreak(0)
    }
  }

  function nextProblem() {
    setReaction(generateReaction())
    setPlacements({})
    setStatuses({})
    setSubmitted(false)
    setSolved(false)
  }

  // Roles still available in the bank (not yet placed anywhere).
  const availableRoles = ROLE_KEYS.filter(r => !placedRoles.has(r))

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="app">
        <header>
          <h1>Acid–Base Reaction Roulette</h1>
          <div className="streak">
            <span className="streak-flame">🔥</span>
            <span className="streak-count">{streak}</span>
            <span className="streak-text">streak</span>
          </div>
        </header>

        <p className="prompt">
          Drag each label onto the species that fills that role in the reaction.
        </p>

        <div className="equation">
          <SpeciesSlot
            species={slots[0].species}
            slotId={slots[0].id}
            placedRole={placements[slots[0].id]}
            status={statuses[slots[0].id]}
            onRemove={() => removePlacement(slots[0].id)}
          />
          <span className="op">+</span>
          <SpeciesSlot
            species={slots[1].species}
            slotId={slots[1].id}
            placedRole={placements[slots[1].id]}
            status={statuses[slots[1].id]}
            onRemove={() => removePlacement(slots[1].id)}
          />
          <span className="op arrow">⇌</span>
          <SpeciesSlot
            species={slots[2].species}
            slotId={slots[2].id}
            placedRole={placements[slots[2].id]}
            status={statuses[slots[2].id]}
            onRemove={() => removePlacement(slots[2].id)}
          />
          <span className="op">+</span>
          <SpeciesSlot
            species={slots[3].species}
            slotId={slots[3].id}
            placedRole={placements[slots[3].id]}
            status={statuses[slots[3].id]}
            onRemove={() => removePlacement(slots[3].id)}
          />
        </div>

        <div className="bank">
          {availableRoles.length === 0 ? (
            <span className="bank-empty">all labels placed</span>
          ) : (
            availableRoles.map(r => (
              <DraggableLabel key={r} id={r} role={r} disabled={solved} />
            ))
          )}
        </div>

        <div className="actions">
          {!solved ? (
            <button
              className="btn primary"
              disabled={!allFilled}
              onClick={handleSubmit}
            >
              Submit
            </button>
          ) : (
            <button className="btn primary" onClick={nextProblem}>
              Continue →
            </button>
          )}
        </div>

        {submitted && !solved && (
          <p className="hint">Nice try — incorrect labels were cleared. Adjust and resubmit.</p>
        )}
        {solved && (
          <p className="hint success">Correct! 🎉</p>
        )}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeRole ? <LabelChip role={activeRole} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
