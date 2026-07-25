import React from 'react';

export type CardProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

const Card = ({ children, header, footer, className = '' }: CardProps) => {
  const hasHeader = header !== undefined && header !== null;
  const hasFooter = footer !== undefined && footer !== null;

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`.trim()}>
      {hasHeader ? <div className="mb-6">{header}</div> : null}
      {children}
      {hasFooter ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
};

export default Card;
