import "./styles.css";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { possibleValues } from "./data/possibleValues";
import { matchWithError } from "./utils/matching";
import debounce from "lodash/debounce";

// Ao / Apple -> 1 error -> Matches Apple
// Ap / Apple -> 0 errors -> Matches Apple
// Aii / Apple -> 2 errors -> No match
// Appk / Apple -> 1 error -> Matches Apple
// Mabg / Mango -> 1 error -> Matches Mango

export default function App({ initialValue = "", initialMatchedValues = [] }) {
  const [value, setValue] = useState(initialValue);
  const [matchedValues, setMatchedValues] = useState(initialMatchedValues);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  const filterValues = useCallback((searchValue) => {
    try {
      setIsLoading(true);
      const matched = possibleValues.filter((possibleValue) =>
        matchWithError(searchValue, possibleValue)
      );
      setMatchedValues(matched);
    } catch (error) {
      console.error("Error filtering values:", error);
      setMatchedValues([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFilter = useMemo(
    () => debounce(filterValues, 300),
    [filterValues]
  );

  const handleOnChange = useCallback((e) => {
    const { value } = e.target;
    setValue(value);
    setSelectedIndex(-1);
    debouncedFilter(value);
  }, [debouncedFilter]);

  const handlePossibleSelect = useCallback((e, value) => {
    setValue(value);
    setMatchedValues([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown" && selectedIndex < matchedValues.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (e.key === "ArrowUp" && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handlePossibleSelect(null, matchedValues[selectedIndex]);
    } else if (e.key === "Escape") {
      setMatchedValues([]);
      setSelectedIndex(-1);
    }
  }, [selectedIndex, matchedValues, handlePossibleSelect]);

  const handleClear = useCallback(() => {
    setValue("");
    setMatchedValues([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter]);

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
