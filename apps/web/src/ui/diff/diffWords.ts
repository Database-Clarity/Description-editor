export interface WordChange {
  kind: 'equal' | 'insert' | 'delete';
  text: string;
}

export function diffWords(before: string, after: string): WordChange[] {
  const left = before.match(/\s+|[^\s]+/g) ?? [];
  const right = after.match(/\s+|[^\s]+/g) ?? [];
  const changes: WordChange[] = [];
  function add(kind: WordChange['kind'], text: string) {
    if (!text) return;
    const last = changes.at(-1);
    if (last?.kind === kind) last.text += text;
    else changes.push({ kind, text });
  }
  let start = 0;
  while (start < left.length && start < right.length && left[start] === right[start]) start++;
  let endLeft = left.length;
  let endRight = right.length;
  while (endLeft > start && endRight > start && left[endLeft - 1] === right[endRight - 1]) {
    endLeft--;
    endRight--;
  }
  add('equal', left.slice(0, start).join(''));
  const rows = endLeft - start;
  const cols = endRight - start;
  // Bound memory for unusually large descriptions; still preserve exact word/whitespace text.
  if ((rows + 1) * (cols + 1) > 1_000_000) {
    add('delete', left.slice(start, endLeft).join(''));
    add('insert', right.slice(start, endRight).join(''));
  } else {
    const width = cols + 1;
    const table = new Uint32Array((rows + 1) * width);
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = cols - 1; j >= 0; j--) {
        table[i * width + j] =
          left[start + i] === right[start + j]
            ? 1 + table[(i + 1) * width + j + 1]
            : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < rows || j < cols) {
      if (i < rows && j < cols && left[start + i] === right[start + j]) {
        add('equal', left[start + i++]);
        j++;
      } else if (
        i < rows &&
        (j === cols || table[(i + 1) * width + j] >= table[i * width + j + 1])
      ) {
        add('delete', left[start + i++]);
      } else add('insert', right[start + j++]);
    }
  }
  add('equal', left.slice(endLeft).join(''));
  return changes;
}
