import "./styles.css";
import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { possibleValues } from "./data/possibleValues";
import { useMatching } from "./hooks/useMatching";

// Ao / Apple -> 1 error -> Matches Apple
// Ap / Apple -> 0 errors -> Matches Apple
// Aii / Apple -> 2 errors -> No match
// Appk / Apple -> 1 error -> Matches Apple
// Mabg / Mango -> 1 error -> Matches Mango

export default function App({ initialValue = "", initialMatchedValues = [] }) {
  const [value, setValue] = useState(initialValue);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  const {
    matchedValues,
    isLoading,
    error,
    filterValues,
    cleanup
  } = useMatching({
    possibleValues,
    debounceDelay: 300,
    maxErrors: 1
  });

  const handleOnChange = useCallback((e) => {
    const { value } = e.target;
    setValue(value);
    setSelectedIndex(-1);
    filterValues(value);
  }, [filterValues]);

  const handlePossibleSelect = useCallback((e, value) => {
    setValue(value);
    cleanup();
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, [cleanup]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown" && selectedIndex < matchedValues.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (e.key === "ArrowUp" && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handlePossibleSelect(null, matchedValues[selectedIndex]);
    } else if (e.key === "Escape") {
      cleanup();
      setSelectedIndex(-1);
    }
  }, [selectedIndex, matchedValues, handlePossibleSelect, cleanup]);

  const handleClear = useCallback(() => {
    setValue("");
    cleanup();
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  if (error) {
    console.error("Error in matching:", error);
  }

  return (
    <div className="App">
      <div className="container">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            onChange={handleOnChange}
            onKeyDown={handleKeyDown}
            value={value}
            aria-label="Search input"
            aria-controls="suggestions-list"
            aria-activedescendant={
              selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
            }
          />
          {value && (
            <button
              onClick={handleClear}
              className="clear-button"
              aria-label="Clear input"
              type="button"
            >
              ×
            </button>
          )}
        </div>
        {isLoading && <div className="loading">Loading...</div>}
        {!isLoading && matchedValues.length === 0 && value && (
          <div className="no-results">No matches found</div>
        )}
        <div
          id="suggestions-list"
          className="suggestions"
          role="listbox"
          aria-label="Suggestions"
        >
          {matchedValues.map((match, index) => (
            <div
              key={`match-${match}`}
              role="option"
              aria-selected={index === selectedIndex}
              id={`suggestion-${index}`}
              className={`suggestion-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={(e) => handlePossibleSelect(e, match)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {match}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

App.propTypes = {
  initialValue: PropTypes.string,
  initialMatchedValues: PropTypes.arrayOf(PropTypes.string)
};
