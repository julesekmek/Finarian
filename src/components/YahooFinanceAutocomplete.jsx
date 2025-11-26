/**
 * YahooFinanceAutocomplete component
 * Autocomplete input for searching Yahoo Finance symbols
 * Features: debounced search, keyboard navigation, loading states
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, TrendingUp, X } from "lucide-react";
import { symbolSearchService } from "../services/symbolSearchService";

export default function YahooFinanceAutocomplete({
  value,
  onChange,
  onSymbolSelect,
  disabled = false,
  placeholder = "ex: AAPL, MSFT, BTC-USD",
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Update local query when value prop changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close dropdown when clicking outside
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

  // Debounced search
  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const searchResults = await symbolSearchService.searchSymbols(
        searchQuery
      );
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error("Search error:", err);
      setError("Erreur de recherche");
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      performSearch(newValue);
    }, 300);

    setDebounceTimer(timer);
  };

  const handleSelectResult = (result) => {
    setQuery(result.symbol);
    onChange(result.symbol);
    setIsOpen(false);
    setResults([]);

    if (onSymbolSelect) {
      onSymbolSelect(result);
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setResults([]);
    setIsOpen(false);
    setError("");
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field w-full pl-10 pr-10"
        />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-accent-red mt-1">{error}</p>}

      {/* Dropdown results */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-dark-card border border-border-subtle rounded-xl shadow-card overflow-hidden max-h-80 overflow-y-auto"
          >
            {results.map((result, index) => (
              <button
                key={result.symbol}
                type="button"
                onClick={() => handleSelectResult(result)}
                className={`w-full px-4 py-3 text-left transition-colors border-b border-border-subtle last:border-b-0 ${
                  index === selectedIndex
                    ? "bg-dark-hover"
                    : "hover:bg-dark-hover/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent-beige flex-shrink-0" />
                      <span className="font-semibold text-text-primary">
                        {result.symbol}
                      </span>
                      {result.exchange && (
                        <span className="text-xs text-text-muted">
                          {result.exchange}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1 truncate">
                      {result.longName || result.shortName}
                    </p>
                  </div>
                  {result.type && (
                    <span className="text-xs px-2 py-1 bg-dark-hover rounded-lg text-text-muted flex-shrink-0">
                      {result.type}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
