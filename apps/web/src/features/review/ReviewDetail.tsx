import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Tooltip } from '@clarity/core';
import { getPushedVersion } from '../../services/history';
import { errorMessage } from '../../services/http';
import { TooltipDiff } from '../history/TooltipDiff';
import type { PendingTooltip } from './model';

export function ReviewDetail({ entry }: { entry: PendingTooltip }) {
  const [live, setLive] = useState<{ tooltip: Tooltip | null; pushedHash: string | null }>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLive(undefined);
    setError(undefined);
    void getPushedVersion(entry.tooltip.hash, controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) setLive(result);
      },
      (reason: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(reason));
      },
    );
    return () => controller.abort();
  }, [entry.tooltip.hash, attempt]);
  return (
    <section aria-label="Selected change">
      <h2>{entry.name}</h2>
      <Link to={`/t/${entry.tooltip.hash}`}>Open tooltip editor and history</Link>
      {error && (
        <p role="alert">
          {error}{' '}
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Retry live comparison
          </button>
        </p>
      )}
      {!live && !error && <p role="status">Loading last pushed text...</p>}
      {live && (
        <>
          {!live.pushedHash && <p>No recorded live version. All saved text is new.</p>}
          <TooltipDiff before={live.tooltip} current={entry.tooltip} />
        </>
      )}
    </section>
  );
}
