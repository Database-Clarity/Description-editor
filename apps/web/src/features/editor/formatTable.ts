export function formatMarkupTables(text: string): string {
  return text.replace(/< table [^]+?\n<\$>/g, (table) => {
    const lines = table.split('\n');
    const rows = lines.slice(1, -1).map((line) => [...line.matchAll(/(\|[bchr\d-]*)([^|]*)/g)]);
    const prefixes: number[] = [];
    const widths: number[] = [];
    for (const row of rows) {
      row.forEach((cell, index) => {
        prefixes[index] = Math.max(prefixes[index] ?? 0, cell[1].length);
        widths[index] = Math.max(widths[index] ?? 0, cell[2].trim().length);
      });
    }
    return [
      lines[0],
      ...rows.map((row, index) =>
        row.length
          ? row
              .map(
                (cell, column) =>
                  `${cell[1].padEnd(prefixes[column])} ${cell[2].trim().padEnd(widths[column])} `,
              )
              .join('')
              .trimEnd()
          : lines[index + 1],
      ),
      lines[lines.length - 1],
    ].join('\n');
  });
}
