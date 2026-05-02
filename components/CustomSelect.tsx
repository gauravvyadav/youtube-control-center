import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string | number | null;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: any) => void;
  className?: string;
}

export function CustomSelect({ options, value, onChange, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-24 bg-surface-100 dark:bg-surface-900 text-[12px] font-bold px-3 py-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all text-zinc-900 dark:text-zinc-100"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-zinc-400`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-1 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-0.5">
            {options.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`text-left px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${
                  value === option.value
                    ? 'bg-brand text-white'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
