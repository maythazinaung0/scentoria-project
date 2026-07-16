import { useEffect, useState } from 'react';

// Returns `value`, but only updates after it's been stable for `delayMs`.
// Used to avoid firing an API call on every keystroke.
export function useDebouncedValue(value, delayMs = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}