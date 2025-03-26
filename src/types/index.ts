import { DebouncedFunction } from './debounce';

export interface AppProps {
    initialValue?: string;
    initialMatchedValues?: string[];
}

export interface MatchingOptions {
    possibleValues?: string[];
    debounceDelay?: number;
    maxErrors?: number;
}

export interface MatchingResult {
    matchedValues: string[];
    isLoading: boolean;
    error: Error | null;
    filterValues: DebouncedFunction<(value: string) => void>;
    cleanup: () => void;
}
