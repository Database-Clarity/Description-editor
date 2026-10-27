export type NavigateTo = (path: string, options: { replace: boolean }) => void;

export function shiftScrollDirection(
  event: Pick<WheelEvent, 'shiftKey' | 'ctrlKey' | 'metaKey' | 'deltaX' | 'deltaY'>,
): number {
  if (!event.shiftKey || event.ctrlKey || event.metaKey) return 0;
  return Math.sign(event.deltaY || event.deltaX);
}

// Keep the pre-gesture route in history, not every intermediate wheel tick.
export function createStepping(navigate: NavigateTo) {
  let origin: string | undefined;
  let destination: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() {
    clearTimeout(timer);
    origin = undefined;
    destination = undefined;
  }
  function commit() {
    if (origin && destination && origin !== destination) {
      navigate(origin, { replace: true });
      navigate(destination, { replace: false });
    }
    cancel();
  }
  return {
    step(from: string, to: string) {
      origin ??= from;
      destination = to;
      navigate(to, { replace: true });
      clearTimeout(timer);
      timer = setTimeout(commit, 1000);
    },
    commit,
    cancel,
  };
}
