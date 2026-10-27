import { HttpError } from './http.js';

export function parseCsv(input: string): string[][] {
  const csv = input.replace(/^\uFEFF/, '');
  if (!csv) return [];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  let closed = false;
  let started = false;
  for (let index = 0; index < csv.length; index++) {
    const char = csv[index];
    if (quoted) {
      if (char === '"') {
        if (csv[index + 1] === '"') {
          cell += '"';
          index++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += char;
      continue;
    }
    if (char === ',') {
      row.push(cell);
      cell = '';
      closed = false;
      started = false;
    } else if (char === '\r' || char === '\n') {
      if (char === '\r' && csv[index + 1] === '\n') index++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      closed = false;
      started = false;
    } else if (char === '"' && !started && !closed) {
      quoted = true;
      started = true;
    } else {
      if (closed || char === '"') throw new HttpError(502, 'Malformed Compendium CSV');
      cell += char;
      started = true;
    }
  }
  if (quoted) throw new HttpError(502, 'Unterminated quoted Compendium CSV cell');
  if (row.length || started || closed) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
