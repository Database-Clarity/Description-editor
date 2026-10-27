// Temporary fallback until the save-pipeline worker's shared WordDiff is integrated.
export function WordDiff({ before, after }: { before: string; after: string }) {
  const left = before.match(/\s+|\S+/g) ?? [];
  const right = after.match(/\s+|\S+/g) ?? [];
  let start = 0;
  while (start < left.length && start < right.length && left[start] === right[start]) start++;
  let end = 0;
  while (
    end < left.length - start &&
    end < right.length - start &&
    left[left.length - end - 1] === right[right.length - end - 1]
  )
    end++;
  return (
    <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
      {left.slice(0, start).join('')}
      <del style={{ background: '#612c36' }}>{left.slice(start, left.length - end).join('')}</del>
      <ins style={{ background: '#194f37' }}>{right.slice(start, right.length - end).join('')}</ins>
      {end > 0 && left.slice(left.length - end).join('')}
    </div>
  );
}
