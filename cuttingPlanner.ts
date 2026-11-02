import { CutCalculationResult, BarResult, CutGroup } from './types';

export function calculateCuttingPlan(
  stockLength: number,
  kerf: number,
  cuts: { length_mm: number; count: number }[]
): CutCalculationResult {
  const actualKerf = 0;

  // 1. Flatten the cuts into single pieces
  let pieces: number[] = [];
  for (const c of cuts) {
    for (let i = 0; i < c.count; i++) {
      pieces.push(c.length_mm);
    }
  }

  // 2. Sort pieces in descending order
  pieces.sort((a, b) => b - a);

  // 3. FFD packing
  let bars: { bar_index: number; pieces: number[]; remaining: number }[] = [];
  
  for (const p of pieces) {
    if (p > stockLength) {
      // Piece exceeds standard bar length! Cannot fit it.
      continue;
    }
    
    let placed = false;
    for (const b of bars) {
      // Required space in existing bar: piece length + kerf (if not first piece in bar)
      const cost = p + (b.pieces.length > 0 ? actualKerf : 0);
      if (b.remaining >= cost) {
        b.pieces.push(p);
        b.remaining -= cost;
        placed = true;
        break;
      }
    }

    if (!placed) {
      bars.push({
        bar_index: bars.length + 1,
        pieces: [p],
        remaining: stockLength - p
      });
    }
  }

  // 4. Translate to groups of identical lengths for each bar
  const barResults: BarResult[] = bars.map(b => {
    const counts: { [length: number]: number } = {};
    for (const p of b.pieces) {
      counts[p] = (counts[p] || 0) + 1;
    }
    const groups: CutGroup[] = Object.entries(counts).map(([lenStr, count]) => ({
      length_mm: Number(lenStr),
      count
    }));
    groups.sort((a, b) => b.length_mm - a.length_mm);

    return {
      bar_index: b.bar_index,
      groups,
      waste_mm: b.remaining
    };
  });

  const bars_needed = barResults.length;
  const payable_mm = bars_needed * stockLength;
  const requested_mm = pieces.reduce((sum, p) => sum + p, 0);
  const waste_mm = barResults.reduce((sum, b) => sum + b.waste_mm, 0);

  return {
    bars_needed,
    payable_mm,
    requested_mm,
    waste_mm,
    bars: barResults,
    stock_length_mm: stockLength,
    kerf_mm: 0
  };
}
