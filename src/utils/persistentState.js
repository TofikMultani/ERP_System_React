import { useEffect, useState } from "react";

export const PERSISTENT_STATE_UPDATED_EVENT = "erp-persistent-state-updated";

export function getStoredPersistentState(storageKey, initialValue) {
  try {
    const storedValue = localStorage.getItem(storageKey);
    if (storedValue !== null) {
      return JSON.parse(storedValue);
    }
  } catch {
    // Fall back to the provided initial value.
  }

  return typeof initialValue === "function" ? initialValue() : initialValue;
}

export function usePersistentState(storageKey, initialValue) {
  const [state, setState] = useState(() =>
    getStoredPersistentState(storageKey, initialValue),
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent(PERSISTENT_STATE_UPDATED_EVENT, {
          detail: { storageKey },
        }),
      );
    } catch {
      // Ignore storage errors and keep the in-memory state working.
    }
  }, [state, storageKey]);

  return [state, setState];
}

export function usePersistentSnapshot(storageKey, initialValue) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    function handleUpdate(event) {
      if (!event.detail || event.detail.storageKey === storageKey) {
        setVersion((value) => value + 1);
      }
    }

    window.addEventListener(PERSISTENT_STATE_UPDATED_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(PERSISTENT_STATE_UPDATED_EVENT, handleUpdate);
  }, [storageKey]);

  return getStoredPersistentState(storageKey, initialValue);
}
