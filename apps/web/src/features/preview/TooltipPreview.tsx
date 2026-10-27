import { useId, useMemo, useState } from 'react';
import {
  markupLanguage,
  parseMarkup,
  markupWeaponTypes,
  type Lang,
  type MarkupGlobals,
  type MarkupLine,
  type MarkupSpan,
} from '@clarity/core';
import styles from './TooltipPreview.module.scss';

export interface TooltipPreviewProps {
  text: string;
  lang: Lang;
  name: string;
  icon?: string;
  categoryLabel?: string;
  globals: MarkupGlobals;
}

function classNames(names?: (string | undefined)[]) {
  return names?.flatMap((name) => (name && styles[name] ? [styles[name]] : [])).join(' ');
}

function linkUrl(url: string): string | undefined {
  return /^(https?:\/\/|mailto:)/i.test(url.trim()) ? url.trim() : undefined;
}

function Content({ part, weapon }: { part: MarkupSpan; weapon: string }) {
  const id = useId();
  const link = part.link ? linkUrl(part.link) : undefined;
  return (
    <span className={classNames(part.classNames)}>
      {part.title ? (
        <span className={styles.titleAnchor} tabIndex={0} aria-describedby={id}>
          {part.text}
          <span className={styles.titleContainer} role="tooltip" id={id}>
            <Lines lines={part.title} weapon={weapon} />
          </span>
        </span>
      ) : link ? (
        <a href={link} target="_blank" rel="noreferrer">
          {part.text}
        </a>
      ) : (
        <span title={part.link ? 'Unsafe link omitted' : undefined}>{part.text}</span>
      )}
    </span>
  );
}

function Lines({ lines, weapon }: { lines: MarkupLine[]; weapon: string }) {
  return (
    <>
      {lines.map((line, index) => {
        if (line.weaponTypes && !line.weaponTypes.includes(weapon)) return null;
        return line.table ? (
          <table className={classNames(line.classNames)} key={index}>
            <tbody>
              {line.table.map((row, rowIndex) => (
                <tr key={rowIndex} className={classNames(row.classNames)}>
                  {row.rowContent?.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      className={classNames(cell.classNames)}
                    >
                      {cell.cellContent.map((part, partIndex) => (
                        <Content key={partIndex} part={part} weapon={weapon} />
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div key={index} className={classNames(line.classNames)}>
            {line.linesContent?.map((part, partIndex) => (
              <Content key={partIndex} part={part} weapon={weapon} />
            ))}
          </div>
        );
      })}
    </>
  );
}

export function TooltipPreview({
  text,
  lang,
  name,
  icon,
  categoryLabel,
  globals,
}: TooltipPreviewProps) {
  const parsed = useMemo(() => parseMarkup(text, globals), [text, globals]);
  const [weapon, setWeapon] = useState(markupWeaponTypes[0]);
  const iconUrl = icon?.startsWith('/common/') ? `https://www.bungie.net${icon}` : icon;
  return (
    <section className={styles.preview} lang={markupLanguage(lang)} aria-label={`${name} preview`}>
      <header className={styles.header}>
        {iconUrl && linkUrl(iconUrl) && <img className={styles.icon} src={iconUrl} alt="" />}
        <div>
          <div className={styles.name}>{name}</div>
          {categoryLabel && <div className={styles.category}>{categoryLabel}</div>}
        </div>
      </header>
      {parsed.lines.some((line) => line.weaponTypes) && (
        <label className={styles.weapon}>
          Weapon type{' '}
          <select
            aria-label="Preview weapon type"
            value={weapon}
            onChange={(event) => setWeapon(event.target.value)}
          >
            {markupWeaponTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      )}
      <div className={styles.description}>
        <Lines lines={parsed.lines} weapon={weapon} />
      </div>
      {parsed.diagnostics.length > 0 && (
        <details className={styles.diagnostics}>
          <summary>{parsed.diagnostics.length} markup issue(s)</summary>
          <ul>
            {parsed.diagnostics.map((issue, index) => (
              <li key={index}>
                {issue.severity}: {issue.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
