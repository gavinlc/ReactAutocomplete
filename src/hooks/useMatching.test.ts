import { renderHook, act } from '@testing-library/react';
import { useMatching } from './useMatching';

describe('useMatching', () => {
    const testPossibleValues: string[] = ['Apple', 'Apricot', 'Banana', 'Mango'];

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('returns initial state', () => {
        const { result } = renderHook(() => useMatching({
            possibleValues: testPossibleValues,
            debounceDelay: 0 // Disable debounce for testing
        }));

        expect(result.current.matchedValues).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(typeof result.current.filterValues).toBe('function');
        expect(typeof result.current.cleanup).toBe('function');
    });

    test('filters values with exact match', () => {
        const { result } = renderHook(() => useMatching({
            possibleValues: testPossibleValues,
            debounceDelay: 0 // Disable debounce for testing
        }));

        act(() => {
            result.current.filterValues('Ap');
        });

        // Advance timers to execute the debounced function
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.matchedValues).toContain('Apple');
        expect(result.current.matchedValues).toContain('Apricot');
    });

    test('filters values with one error tolerance', () => {
        const { result } = renderHook(() => useMatching({
            possibleValues: testPossibleValues,
            debounceDelay: 0 // Disable debounce for testing
        }));

        act(() => {
            result.current.filterValues('Ao');
        });

        // Advance timers to execute the debounced function
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.matchedValues).toContain('Apple');
    });

    test('handles empty input', () => {
        const { result } = renderHook(() => useMatching({
            possibleValues: testPossibleValues,
            debounceDelay: 0 // Disable debounce for testing
        }));

        act(() => {
            result.current.filterValues('');
        });

        // Advance timers to execute the debounced function
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.matchedValues).toEqual([]);
    });

    test('handles cleanup', () => {
        const { result } = renderHook(() => useMatching({
            possibleValues: testPossibleValues,
            debounceDelay: 0 // Disable debounce for testing
        }));

        act(() => {
            result.current.filterValues('Ap');
        });

        // Advance timers to execute the debounced function
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.matchedValues.length).toBeGreaterThan(0);

        act(() => {
            result.current.cleanup();
        });

        expect(result.current.matchedValues).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    test('respects maxErrors option', () => {
        const { result } = renderHook(() =>
            useMatching({
                possibleValues: testPossibleValues,
                maxErrors: 0,
                debounceDelay: 0 // Disable debounce for testing
            })
        );

        act(() => {
            result.current.filterValues('Ao');
        });

        // Advance timers to execute the debounced function
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.matchedValues).not.toContain('Apple');
    });

    test('handles invalid input gracefully', () => {
        const { result } = renderHook(() => useMatching({
            possibleValues: testPossibleValues,
            debounceDelay: 0 // Disable debounce for testing
        }));

        act(() => {
            result.current.filterValues(null as unknown as string);
        });

        // Advance timers to execute the debounced function
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.matchedValues).toEqual([]);
        expect(result.current.error).toBe(null);
    });
}); 