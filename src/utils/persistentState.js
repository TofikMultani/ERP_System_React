import { useEffect, useState } from "react";

export const PERSISTENT_STATE_UPDATED_EVENT = "erp-persistent-state-updated";
const USER_EMAIL_STORAGE_KEY = "erp_user_email";
const USER_ROLE_STORAGE_KEY = "erp_user_role";

function getScopedStorageKey(storageKey) {
  try {
    const email =
      (localStorage.getItem(USER_EMAIL_STORAGE_KEY) || "")
        .trim()
        .toLowerCase();
    const role = (localStorage.getItem(USER_ROLE_STORAGE_KEY) || "guest").trim();
    const identityScope = email || `role:${role || "guest"}`;

    return `erp_scope:${identityScope}:${storageKey}`;
  } catch {
    return `erp_scope:guest:${storageKey}`;
  }
}

function getUnseededInitialValue(initialValue) {
  const resolved =
    typeof initialValue === "function" ? initialValue() : initialValue;

  if (Array.isArray(resolved)) {
    return [];
  }

  if (resolved && typeof resolved === "object") {
    return {};
  }

  return resolved;
}

export function getStoredPersistentState(storageKey, initialValue) {
  const scopedStorageKey = getScopedStorageKey(storageKey);

  try {
    const storedValue = localStorage.getItem(scopedStorageKey);
    if (storedValue !== null) {
      return JSON.parse(storedValue);
    }
  } catch {
    // Fall back to the provided initial value.
  }

  return getUnseededInitialValue(initialValue);
}

export function usePersistentState(storageKey, initialValue) {
  const [state, setState] = useState(() =>
    getStoredPersistentState(storageKey, initialValue),
  );

  useEffect(() => {
    const scopedStorageKey = getScopedStorageKey(storageKey);

    try {
      localStorage.setItem(scopedStorageKey, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent(PERSISTENT_STATE_UPDATED_EVENT, {
          detail: { storageKey, scopedStorageKey },
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
