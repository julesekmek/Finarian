import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function AutocompleteInput({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const containerRef = useRef(null);

  // Filter options based on input value
  useEffect(() => {
    const query = value.toLowerCase();
    const filtered = options.filter(
      (option) =>
        option &&
        option.toLowerCase().includes(query) &&
        option.toLowerCase() !== query, // Don't show exact match
    );
    setFilteredOptions(filtered);
  }, [value, options]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field w-full pr-10"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-dark-card border border-border-subtle rounded-xl shadow-card max-h-48 overflow-y-auto"
          >
            {filteredOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-hover transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
