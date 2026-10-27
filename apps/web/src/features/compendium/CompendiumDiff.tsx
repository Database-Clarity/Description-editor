import { useId, useMemo, useState } from 'react';
import { diffCompendium, type CompendiumCell } from '@clarity/core';
import { RichCell } from './RichCell';
import styles from './Compendium.module.scss';

function changes(before: CompendiumCell, after: CompendiumCell): string[] {
  const values = (
    cell: CompendiumCell,
    key: 'color' | 'bold' | 'italic' | 'underline' | 'strike' | 'sizePt' | 'href',
  ) =>
    [
      ...new Set(
        cell.runs.map((run) =>
          String(run[key] ?? (key === 'sizePt' ? 'default' : key === 'color' ? 'default' : false)),
        ),
      ),
    ].join(', ');
  return (['color', 'bold', 'italic', 'underline', 'strike', 'sizePt', 'href'] as const).flatMap(
    (key) => {
      const old = values(before, key);
      const current = values(after, key);
      return old === current
        ? []
        : [`${key === 'color' ? 'colour' : key}: ${old} \u2192 ${current}`];
    },
  );
}
function StyleChange({ before, after }: { before: CompendiumCell; after: CompendiumCell }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const description = changes(before, after).join('; ') || 'Styling changed within this word';
  return (
    <span className={styles.styleChange} data-open={open}>
      <button
        type="button"
        className={styles.styleToggle}
        title={description}
        aria-label={`${after.plain}: ${description}`}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <RichCell cell={after} links={false} />
      </button>
      <span id={id} className={styles.stylePopover} role="tooltip">
        <span>{description}</span>
        <span className={styles.swatches}>
          {[before, after].map((cell, index) => (
            <span key={index}>
              {index ? 'Current' : 'Snapshot'}{' '}
              {[...new Set(cell.runs.map((run) => run.color).filter(Boolean))].map((color) => (
                <span
                  key={color}
                  className={styles.swatch}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </span>
          ))}
        </span>
        <span>
          Snapshot: <RichCell cell={before} />
        </span>
      </span>
    </span>
  );
}
export function CompendiumDiff({
  before,
  after,
}: {
  before: CompendiumCell;
  after: CompendiumCell;
}) {
  const [sideBySide, setSideBySide] = useState(false);
  const parts = useMemo(() => diffCompendium(before, after), [before, after]);
  return (
    <section aria-label="Styled Compendium diff">
      <button type="button" onClick={() => setSideBySide(!sideBySide)}>
        {sideBySide ? 'Show inline diff' : 'Show side-by-side'}
      </button>
      {sideBySide ? (
        <div className={styles.comparison}>
          <section>
            <h4>Snapshot</h4>
            <div className={styles.cell}>
              <RichCell cell={before} />
            </div>
          </section>
          <section>
            <h4>Current</h4>
            <div className={styles.cell}>
              <RichCell cell={after} />
            </div>
          </section>
        </div>
      ) : (
        <>
          <p className={styles.legend}>
            Removed: red strike-through. Added: green underline. Dotted: tap or hover for style
            changes.
          </p>
          <div className={styles.cell}>
            {parts.map((part, index) =>
              part.kind === 'style' ? (
                <StyleChange key={index} before={part.before!} after={part.after!} />
              ) : part.kind === 'removed' ? (
                <del key={index} className={styles.removed}>
                  <RichCell cell={part.before!} />
                </del>
              ) : part.kind === 'added' ? (
                <ins key={index} className={styles.added}>
                  <RichCell cell={part.after!} />
                </ins>
              ) : (
                <RichCell key={index} cell={part.after!} />
              ),
            )}
          </div>
        </>
      )}
    </section>
  );
}
