/**
 * Drag-to-match, scored all-or-nothing (§7.4). Built on the Pointer Events
 * API (pointerdown/move/up + setPointerCapture) rather than HTML5
 * drag-and-drop, which CLAUDE.md calls out as unreliable on mobile — a
 * single set of handlers covers mouse, touch, and pen uniformly.
 *
 * Right-hand labels start in a shuffled tray; dragging one onto a left slot
 * assigns the pair. Tapping a filled slot clears it back to the tray.
 *
 * IMPORTANT: right-hand values are NOT always unique — match-state (§7.2)
 * has two pairs both worth "6 days" (Sick Leave, Casual Leave). Tracking
 * chips by their text alone would mean placing one "6 days" chip removes
 * BOTH from the tray, making the second slot impossible to fill. Each right
 * value gets a stable synthetic instance id (`${question.id}-r${i}`) that
 * drag/tray logic keys on internally; only the plain text is exported via
 * onChange, since that's what scoring.ts (and the MatchAnswer type) expects.
 */
import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import type { MatchQuestion, MatchAnswer } from '../../types';

interface MatchQuestionViewProps {
  question: MatchQuestion;
  value?: MatchAnswer;
  onChange: (answer: MatchAnswer) => void;
}

interface RightInstance {
  id: string;
  text: string;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface DragState {
  instanceId: string;
  text: string;
  pointerId: number;
  x: number;
  y: number;
  offsetX: number; // pointer position relative to the chip's own top-left, so it doesn't jump on grab
  offsetY: number;
  width: number;
  height: number;
}

export default function MatchQuestionView({ question, value, onChange }: MatchQuestionViewProps) {
  const instances = useMemo<RightInstance[]>(
    () => shuffle(question.pairs.map((p, i) => ({ id: `${question.id}-r${i}`, text: p.right }))),
    [question.id]
  );
  const textOf = useMemo(() => Object.fromEntries(instances.map((r) => [r.id, r.text])), [instances]);

  // left label -> instance id. Initialized (once) from any incoming `value`
  // by greedily matching texts to unused instances — duplicates are
  // interchangeable, so which physical instance lands where doesn't matter.
  const [placedIds, setPlacedIds] = useState<Record<string, string>>(() => {
    if (!value) return {};
    const used = new Set<string>();
    const initial: Record<string, string> = {};
    for (const pair of question.pairs) {
      const wantedText = value.selected[pair.left];
      if (!wantedText) continue;
      const match = instances.find((inst) => inst.text === wantedText && !used.has(inst.id));
      if (match) {
        initial[pair.left] = match.id;
        used.add(match.id);
      }
    }
    return initial;
  });

  const [drag, setDrag] = useState<DragState | null>(null);
  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function commit(next: Record<string, string>) {
    setPlacedIds(next);
    onChange({
      type: 'match',
      selected: Object.fromEntries(Object.entries(next).map(([left, id]) => [left, textOf[id]])),
    });
  }

  function startDrag(e: ReactPointerEvent<HTMLDivElement>, instance: RightInstance) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({
      instanceId: instance.id,
      text: instance.text,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  function moveDrag(e: ReactPointerEvent<HTMLDivElement>) {
    setDrag((d) => (d && d.pointerId === e.pointerId ? { ...d, x: e.clientX, y: e.clientY } : d));
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    setDrag((d) => {
      if (!d || d.pointerId !== e.pointerId) return d;
      let target: string | null = null;
      for (const [left, el] of Object.entries(leftRefs.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          target = left;
          break;
        }
      }
      if (target) {
        const next: Record<string, string> = {};
        for (const [left, id] of Object.entries(placedIds)) {
          if (id !== d.instanceId) next[left] = id; // drop this instance's old slot, if any
        }
        next[target] = d.instanceId;
        commit(next);
      }
      return null;
    });
  }

  function clearSlot(left: string) {
    const next = { ...placedIds };
    delete next[left];
    commit(next);
  }

  const placedInstanceIds = new Set(Object.values(placedIds));
  const trayInstances = instances.filter((inst) => !placedInstanceIds.has(inst.id));
  const allPlaced = question.pairs.every((p) => placedIds[p.left]);

  return (
    <div className="w-full max-w-md select-none">
      <p className="font-display text-xl font-bold text-cg-navy sm:text-2xl">{question.prompt}</p>
      <p className="mt-1 text-xs text-cg-navy/60">Drag each item on the right to its match on the left.</p>

      <div className="mt-6 flex flex-col gap-3">
        {question.pairs.map((pair) => {
          const filledId = placedIds[pair.left];
          const filledText = filledId ? textOf[filledId] : undefined;
          return (
            <div key={pair.left} className="flex items-center gap-3">
              <div className="w-2/5 text-right text-sm font-semibold text-cg-navy sm:text-base">
                {pair.left}
              </div>
              {/* Slots aren't draggable themselves (only tray chips are) —
                  tapping a filled slot clears it back to the tray instead. */}
              <div
                ref={(el) => {
                  leftRefs.current[pair.left] = el;
                }}
                data-slot={pair.left}
                onClick={() => filledText && clearSlot(pair.left)}
                className={`flex min-h-tap flex-1 items-center justify-center rounded-2xl border-2 border-dashed px-4 py-3 text-center text-sm sm:text-base ${
                  filledText
                    ? 'cursor-pointer border-cg-teal bg-cg-teal/10 text-cg-navy'
                    : 'border-cg-lilac bg-cg-white text-cg-navy/40'
                }`}
              >
                {filledText ?? 'Drop here'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tray of unplaced chips */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {trayInstances.map((inst) => (
          <div
            key={inst.id}
            data-chip={inst.text}
            onPointerDown={(e) => startDrag(e, inst)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={() => setDrag(null)}
            style={{ touchAction: 'none', visibility: drag?.instanceId === inst.id ? 'hidden' : 'visible' }}
            className="min-h-tap cursor-grab rounded-2xl bg-cg-indigo px-4 py-3 text-sm font-semibold text-cg-white shadow-cg active:cursor-grabbing sm:text-base"
          >
            {inst.text}
          </div>
        ))}
      </div>

      {/* Dragged chip ghost, follows the pointer */}
      {drag && (
        <motion.div
          className="pointer-events-none fixed z-50 flex items-center justify-center rounded-2xl bg-cg-indigo px-4 py-3 text-sm font-semibold text-cg-white shadow-cg-lg sm:text-base"
          style={{
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            width: drag.width,
            height: drag.height,
          }}
        >
          {drag.text}
        </motion.div>
      )}

      {allPlaced && (
        <p className="mt-4 text-center text-sm text-cg-teal">
          All matched — tap a filled slot to change it, or continue below.
        </p>
      )}
    </div>
  );
}
