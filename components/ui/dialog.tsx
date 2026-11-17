'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modal built on the native <dialog> element: focus trapping, Esc-to-close and
 * inert background come from the browser.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
      onMouseDown={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-xl border border-line bg-white p-0 text-soil shadow-soft backdrop:bg-soil/50',
        className,
      )}
    >
      {open && (
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id="dialog-title" className="text-2xl font-semibold">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-soil-muted">{description}</p>}
            </div>
            <button type="button" onClick={onClose} className="-m-1 p-1 text-soil-muted hover:text-soil" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
