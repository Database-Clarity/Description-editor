import type { HistoryCommit } from '../../services/history';
import styles from './History.module.scss';

export function CommitAuthor({ entry }: { entry: HistoryCommit }) {
  return (
    <span className={styles.author}>
      {entry.avatar && <img src={entry.avatar} alt="" referrerPolicy="no-referrer" />}
      {entry.login ? (
        <a href={`https://github.com/${encodeURIComponent(entry.login)}`}>{entry.login}</a>
      ) : (
        (entry.author ?? 'Unknown author')
      )}
      {' · '}
      {entry.date ? (
        <time dateTime={entry.date}>{new Date(entry.date).toLocaleString()}</time>
      ) : (
        'Unknown date'
      )}
    </span>
  );
}
