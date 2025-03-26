import { useState, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { MatchingOptions, MatchingResult } from '../types';

/**
 * Custom hook for matching values with error tolerance
 * @param options - Configuration options
 * @returns Matching state and handlers
 */
export const useMatching = ({
    possibleValues = [],
    debounceDelay = 300,
    maxErrors = 1
}: MatchingOptions): MatchingResult => {
    const [matchedValues, setMatchedValues] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Helper function to count differences between strings
    const countErrors = useCallback((value: string, possible: string): number => {
        if (typeof value !== 'string' || typeof possible !== 'string') {
            throw new TypeError('Both value and possible must be strings');
        }

        const valueLower = value.toLowerCase();
        const possibleLower = possible.toLowerCase();

        // Early return if it's a prefix match
        if (possibleLower.startsWith(valueLower)) return 0;

        const valueLetters = valueLower.split("");
        const possibleLetters = possibleLower.split("");

        let numberOfMatchingLetters = 0;
        valueLetters.forEach((letter, idx) => {
            if (letter === possibleLetters[idx]) {
                numberOfMatchingLetters++;
            }
        });

        return valueLetters.length - numberOfMatchingLetters;
    }, []);

    // Filter function that handles the matching logic
    const filterValues = useCallback((searchValue: string): void => {
        try {
            setError(null);
            setIsLoading(true);

            if (!searchValue) {
                setMatchedValues([]);
                return;
            }

            const matched = possibleValues.filter((possibleValue) => {
                try {
                    const errors = countErrors(searchValue, possibleValue);
                    return errors <= maxErrors;
                } catch (err) {
                    return false;
                }
            });

            setMatchedValues(matched);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            setMatchedValues([]);
        } finally {
            setIsLoading(false);
        }
    }, [possibleValues, maxErrors, countErrors]);

    // Debounced version of the filter function
    const debouncedFilter = useMemo(
        () => debounce(filterValues, debounceDelay),
        [filterValues, debounceDelay]
    );

    // Cleanup function
    const cleanup = useCallback(() => {
        debouncedFilter.cancel();
        setMatchedValues([]);
        setIsLoading(false);
        setError(null);
    }, [debouncedFilter]);

    return {
        matchedValues,
        isLoading,
        error,
        filterValues: debouncedFilter,
        cleanup
    };
};
