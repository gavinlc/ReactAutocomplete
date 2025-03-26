/**
 * Type definition for a debounced function
 */
export interface DebouncedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T>;
    cancel: () => void;
}
