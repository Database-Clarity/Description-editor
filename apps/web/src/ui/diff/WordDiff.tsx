import { diffWords } from './diffWords';
import styles from './WordDiff.module.scss';

export function WordDiff({ before, after }: { before: string; after: string }) {
  return (
    <div
      className={styles.diff}
      aria-label="Word diff: removed text struck through, added text underlined"
    >
      {diffWords(before, after).map((part, index) =>
        part.kind === 'delete' ? (
          <del key={index}>{part.text}</del>
        ) : part.kind === 'insert' ? (
          <ins key={index}>{part.text}</ins>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
      {!before && !after && <span>No text</span>}
    </div>
  );
}
