'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CommandPaletteAction {
  id: string;
  label: string;
  keywords: string[];
  onSelect: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  
  const router = useRouter();
  const idPrefix = useId();
  
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const actions: CommandPaletteAction[] = [
    {
      id: 'nav-contracts',
      label: 'Contracts',
      keywords: ['contracts', 'agreements'],
      onSelect: () => router.push('/contracts'),
    },
    {
      id: 'nav-milestones',
      label: 'Milestones',
      keywords: ['milestones', 'deliverables', 'tasks'],
      onSelect: () => router.push('/milestones'),
    },
    {
      id: 'nav-reputation',
      label: 'Reputation',
      keywords: ['reputation', 'profile', 'reviews'],
      onSelect: () => router.push('/reputation'),
    },
  ];

  const filteredActions = actions.filter((action) => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return (
      action.label.toLowerCase().includes(lowerQuery) ||
      action.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    );
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) triggerRef.current = document.activeElement as HTMLElement;
          return true;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    
    if (filteredActions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredActions.length);
      scrollIntoView((activeIndex + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      scrollIntoView((activeIndex - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[activeIndex];
      if (action) {
        action.onSelect();
        setIsOpen(false);
        setQuery('');
      }
    }
  };

  const scrollIntoView = (index: number) => {
    if (!listboxRef.current) return;
    const listbox = listboxRef.current;
    const children = listbox.children;
    if (children[index]) {
      const element = children[index] as HTMLElement;
      if (element.offsetTop < listbox.scrollTop) {
        listbox.scrollTop = element.offsetTop;
      } else if (element.offsetTop + element.offsetHeight > listbox.scrollTop + listbox.offsetHeight) {
        listbox.scrollTop = element.offsetTop + element.offsetHeight - listbox.offsetHeight;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm ${prefersReducedMotion ? '' : 'transition-opacity'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className={`relative z-10 w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 ${prefersReducedMotion ? '' : 'transform transition-all'}`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center">
          <svg className="w-5 h-5 text-slate-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${idPrefix}-listbox`}
            aria-activedescendant={
              filteredActions.length > 0 
                ? `${idPrefix}-option-${filteredActions[activeIndex].id}`
                : undefined
            }
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-lg"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <ul
          id={`${idPrefix}-listbox`}
          ref={listboxRef}
          role="listbox"
          className="max-h-80 overflow-y-auto py-2"
        >
          {filteredActions.length === 0 ? (
            <li className="px-6 py-8 text-center text-slate-500">
              No results found.
            </li>
          ) : (
            filteredActions.map((action, index) => (
              <li
                key={action.id}
                id={`${idPrefix}-option-${action.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`px-4 mx-2 py-3 rounded-lg flex items-center cursor-default ${
                  index === activeIndex ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  action.onSelect();
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                {action.label}
              </li>
            ))
          )}
        </ul>
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-end space-x-4">
           <span><kbd className="bg-white border border-slate-200 rounded px-1 text-slate-600">↑↓</kbd> to navigate</span>
           <span><kbd className="bg-white border border-slate-200 rounded px-1 text-slate-600">Enter</kbd> to select</span>
           <span><kbd className="bg-white border border-slate-200 rounded px-1 text-slate-600">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
