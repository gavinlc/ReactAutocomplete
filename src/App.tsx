import "./styles.css";
import { useState, useCallback, useRef, useEffect } from "react";
import { possibleValues } from "./data/possibleValues";
import { useMatching } from "./hooks/useMatching";
import { AppProps } from "./types";

export default function App({ initialValue = "", initialMatchedValues = [] }: AppProps) {
    const [value, setValue] = useState(initialValue);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setValue(value);
        setSelectedIndex(-1);
        filterValues(value);
    }, [filterValues]);

    const handlePossibleSelect = useCallback((e: React.MouseEvent | null, value: string) => {
        setValue(value);
        cleanup();
        setSelectedIndex(-1);
        inputRef.current?.focus();
    }, [cleanup]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
                {!isLoading && matchedValues.length === 0 && value && !selectedIndex && (
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
                            className={`suggestion-item ${index === selectedIndex ? "selected" : ""
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