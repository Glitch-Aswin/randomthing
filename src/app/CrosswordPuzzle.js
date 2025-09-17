"use client";
import { useEffect, useMemo, useState } from "react";

// Strict 10 rows x 12 cols matrix (rows: 0..9, cols: 0..11)
const MATRIX_ROWS = 10;
const MATRIX_COLS = 12;

// Entries defined by matrix ranges. Orientation is derived from coordinates.
// We'll place letters starting at start coordinate and proceed toward end coordinate,
// but we clamp to the answer length and bounds of the 10x12 matrix.
const ENTRIES = [
  // id, answer, startRow, startCol, endRow, endCol
  { id: 1, answer: "LEVERAGE", start: [5, 0], end: [5, 7] }, // across (row const)
  { id: 2, answer: "STRATEGY", start: [0, 3], end: [7, 3] }, // down (col const)
  { id: 3, answer: "BUFFETT", start: [8, 4], end: [8, 10] }, // across
  // 4 provided as m[3][5]..m[10][5] (vertical 8 cells) for STARTUP (7 letters)
  // We'll place STARTUP starting at [3,5] downward but clamp to MATRIX_ROWS (rows 3..9 => 7 cells)
  { id: 4, answer: "STARTUP", start: [3, 5], end: [10, 5] },
  { id: 5, answer: "STOCKX", start: [2, 6], end: [2, 11] }, // across
  { id: 6, answer: "META", start: [0, 7], end: [3, 7] }, // down
  { id: 7, answer: "JOBS", start: [6, 8], end: [6, 11] }, // across
  { id: 8, answer: "MICROSOFT", start: [0, 9], end: [8, 9] }, // down (vertical)
];

// Clue texts as requested (grouping/numbering independent of physical orientation)
const CLUE_TEXTS = {
  down: {
    2: "War: Logistics, Business: ?",
    4: "A new business venture created to solve a problem with innovation and growth potential",
    6: 'Once mocked as "The facebook" , now it owns multiple worlds',
    8: "Which company owns and produces xbox gaming consoles?",
  },
  across: {
    1: "Which financial ratio indicates the extent to which a company uses debt to finance assets?",
    3: 'The "Oracle of Omaha"',
    5: "This entrepreneur's Sneaker resale empire made Wall Street sweat",
    7: "His garage startup redefined personal computing",
  },
};

function deriveDirection([r1, c1], [r2, c2]) {
  if (r1 === r2) return { dr: 0, dc: c2 >= c1 ? 1 : -1 };
  if (c1 === c2) return { dr: r2 >= r1 ? 1 : -1, dc: 0 };
  // fallback -> across to the right
  return { dr: 0, dc: 1 };
}

function expandEntries(entries) {
  const out = [];
  for (const e of entries) {
    const { id, answer, start, end } = e;
    const [sr, sc] = start;
    const [er, ec] = end;
    const { dr, dc } = deriveDirection(start, end);
    const cells = [];
    for (let i = 0; i < answer.length; i++) {
      const r = sr + dr * i;
      const c = sc + dc * i;
      if (r < 0 || r >= MATRIX_ROWS || c < 0 || c >= MATRIX_COLS) break;
      cells.push([r, c]);
    }
    out.push({ id, answer, cells, start: [sr, sc] });
  }
  return out;
}

function CrosswordCell({ number, value, onChange, isActive, isCorrect, isHighlighted }) {
  return (
    <div
      className={`border-2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex flex-col text-xs relative ${
        isHighlighted
          ? "bg-yellow-100 border-yellow-400"
          : isActive
          ? "bg-white border-gray-400 shadow-sm"
          : "bg-gray-800 border-gray-600"
      }`}
    >
      {number && (
        <span className="absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold text-orange-600 bg-white rounded-sm px-0.5 z-10">
          {number}
        </span>
      )}
      {isActive ? (
        <input
          maxLength={1}
          className={`w-full h-full text-center uppercase bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-400 text-base sm:text-lg md:text-xl font-bold ${
            isCorrect === true
              ? "text-green-600"
              : isCorrect === false
              ? "text-red-600"
              : isHighlighted
              ? "text-black"
              : "text-gray-800"
          }`}
          value={value || ""}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

export default function CrosswordPuzzle({ onComplete }) {
  const [grid, setGrid] = useState({});

  const expanded = useMemo(() => expandEntries(ENTRIES), []);

  const { solution, activeSet, startNumbers } = useMemo(() => {
    const sol = {};
    const act = new Set();
    const starts = new Map();
    for (const e of expanded) {
      const [sr, sc] = e.start;
      starts.set(`${sr}-${sc}`, e.id);
      for (let i = 0; i < e.cells.length; i++) {
        const [r, c] = e.cells[i];
        const key = `${r}-${c}`;
        sol[key] = e.answer[i];
        act.add(key);
      }
    }
    return { solution: sol, activeSet: act, startNumbers: starts };
  }, [expanded]);

  const [solved, setSolved] = useState(false);
  const [highlightKeys, setHighlightKeys] = useState(new Set());
  const solutionRef = useMemo(() => ({ current: {} }), []);
  const activeSetRef = useMemo(() => ({ current: new Set() }), []);

  useEffect(() => {
    if (!onComplete) return;
    const keys = Array.from(activeSet);
    const allFilled = keys.every((k) => grid[k] && grid[k].length === 1);
    const allCorrect = keys.every((k) => grid[k] === solution[k]);
    if (allFilled && allCorrect) {
      onComplete && onComplete();
      setSolved(true);
    }
  }, [grid, activeSet, solution, onComplete]);

  // keep refs in sync so effects that only depend on `solved` can access latest values
  useEffect(() => {
    solutionRef.current = solution;
    activeSetRef.current = activeSet;
  }, [solution, activeSet, solutionRef, activeSetRef]);

  // After solved, explicitly highlight the requested letters so they appear reliably.
  // Requested: Y of STRATEGY, A of STARTUP, one F of BUFFETT, O of MICROSOFT, and L of LEVERAGE
  useEffect(() => {
    if (!solved) return;

    // Explicit coordinates (row-col) for the requested letters based on the current ENTRIES layout:
    const explicit = [`7-3`, `5-5`, `8-6`, `4-9`, `5-0`];

    const sol = solutionRef.current;
    const act = activeSetRef.current;
    const keys = new Set();
    for (const k of explicit) {
      if (sol[k] && act.has(k)) keys.add(k);
    }

    setHighlightKeys(keys);
  }, [solved, solutionRef, activeSetRef]);

  const handleChange = (row, col, e) => {
    const val = (e.target.value || "").toUpperCase().slice(0, 1);
    const key = `${row}-${col}`;
    if (!activeSet.has(key)) return;
    setGrid((p) => ({ ...p, [key]: val }));
  };

  const cells = Array.from({ length: MATRIX_ROWS }, (_, r) =>
    Array.from({ length: MATRIX_COLS }, (_, c) => {
      const key = `${r}-${c}`;
      const active = activeSet.has(key);
      const number = startNumbers.get(key) || null;
      const isCorrect = grid[key] ? (solution[key] ? grid[key] === solution[key] : false) : undefined;
      return { row: r, col: c, key, active, number, isCorrect };
    })
  );

  return (
    <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto">
      <div className="flex justify-center overflow-x-auto">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border min-w-fit">
          <div className="grid mx-auto" style={{ gridTemplateColumns: `repeat(${MATRIX_COLS}, clamp(2rem, 4vw, 3.5rem))` }}>
            {cells.flat().map(({ row, col, key, active, number, isCorrect }) => (
              <CrosswordCell
                key={key}
                number={number}
                value={grid[key] || ""}
                isActive={active}
                isCorrect={isCorrect}
                isHighlighted={highlightKeys.has(key)}
                onChange={(e) => handleChange(row, col, e)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-bold text-xl mb-4 text-orange-600 border-b-2 border-orange-200 pb-2">Across</h2>
            <div className="space-y-3">
              {Object.entries(CLUE_TEXTS.across).map(([num, text]) => (
                <div key={num} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-700 font-bold text-sm rounded-full flex items-center justify-center">{num}</span>
                  <p className="text-gray-700 leading-relaxed text-sm flex-1">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-xl mb-4 text-orange-600 border-b-2 border-orange-200 pb-2">Down</h2>
            <div className="space-y-3">
              {Object.entries(CLUE_TEXTS.down).map(([num, text]) => (
                <div key={num} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-700 font-bold text-sm rounded-full flex items-center justify-center">{num}</span>
                  <p className="text-gray-700 leading-relaxed text-sm flex-1">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
