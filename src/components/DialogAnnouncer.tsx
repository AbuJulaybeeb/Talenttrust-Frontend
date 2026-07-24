'use client';

import { useEffect, useRef, useState } from 'react';

export interface DialogAnnouncerProps {
  count?: number;
  label?: string;
  status?: string;
  debounceMs?: number;
}

const DialogAnnouncer = ({
  count,
  label = 'items',
  status,
  debounceMs = 300,
}: DialogAnnouncerProps) => {
  const [announcement, setAnnouncement] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCount = useRef(count);
  const prevStatus = useRef(status);

  useEffect(() => {
    const countChanged = count !== undefined && prevCount.current !== count;
    const statusChanged = status !== undefined && prevStatus.current !== status;

    if (!countChanged && !statusChanged) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (countChanged) {
        prevCount.current = count;
        setAnnouncement(`${count} ${label}`);
      } else if (statusChanged) {
        prevStatus.current = status;
        setAnnouncement(status ?? '');
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [count, status, label, debounceMs]);

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </span>
  );
};

export default DialogAnnouncer;
