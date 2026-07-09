import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { HIDE_SCROLLBAR } from '../../utils/ui';

// ---------------------------------------------------------------------------
// Custom Dropdown (replaces native <select>)
//
// Why: a native <select>'s open option list is drawn by the browser/OS, so
// it can't be given rounded corners consistently across browsers - it always
// shows up with sharp edges even if the closed box is rounded. Building our
// own button + list lets every part of the dropdown (closed box AND the
// open list) share the same rounded-lg style as the rest of the form, and
// lets us hide its scrollbar too.
//
// Props:
//   value       - currently selected value
//   onChange    - called with the newly picked value
//   options     - array of { value, label }
//   placeholder - text shown when nothing is selected
//   fullWidth   - true (default) stretches to fill its container (used for
//                 main form fields); false lets the button size itself to
//                 its own text (used for small "+ Add Note" style pickers
//                 so their label never gets clipped by a sibling label)
//   compact     - smaller text/padding, used for those same small pickers
// ---------------------------------------------------------------------------
export default function Dropdown({ value, onChange, options, placeholder = 'Select...', fullWidth = true, compact = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close the list whenever the user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => String(o.value) === String(value));

  return (
    <div ref={wrapperRef} className={`relative ${fullWidth ? 'w-full' : 'shrink-0'}`}>
      {/* Closed box - looks just like a text input */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 bg-nature-bg border border-nature-border rounded-lg outline-none cursor-pointer text-left whitespace-nowrap
          ${fullWidth ? 'w-full justify-between px-3' : 'justify-center px-2.5'}
          ${compact ? 'py-1 text-xs' : 'py-2 text-sm'}`}
      >
        <span className={selected ? '' : 'text-nature-muted'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`text-nature-muted flex-shrink-0 transition-transform duration-150 ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Open list - same rounded-lg + border style as the closed box, scrollbar hidden */}
      {open && (
        <div
          className={`absolute z-20 mt-1 bg-nature-card border border-nature-border rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto ${HIDE_SCROLLBAR}
            ${fullWidth ? 'left-0 w-full' : 'right-0 min-w-[160px]'}`}
        >
          {options.length === 0 && (
            <p className="px-3 py-2 text-xs text-nature-muted italic">No options available</p>
          )}
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-nature-sage/20 transition-colors whitespace-nowrap
                ${String(o.value) === String(value) ? 'text-nature-olive font-medium' : 'text-nature-dark'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}