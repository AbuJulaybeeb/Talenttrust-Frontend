'use client';

import { useEffect, useRef, useState } from 'react';
import type { StatusType } from './StatusBadge';

export interface ContractStatusAnnouncerProps {
  status: StatusType;
}

/**
 * Announces contract status transitions without repeating the initial status.
 */
const ContractStatusAnnouncer = ({ status }: ContractStatusAnnouncerProps) => {
  const previousStatusRef = useRef(status);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (previousStatusRef.current === status) return;

    previousStatusRef.current = status;
    setAnnouncement(`Contract status changed to ${status}.`);
  }, [status]);

  return (
    <span
      role="status"
      aria-label="Contract status updates"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </span>
  );
};

export default ContractStatusAnnouncer;
