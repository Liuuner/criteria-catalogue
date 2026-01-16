import {useState, useEffect, useCallback} from 'react';

export function useStorage<T>(
    key: string,
    defaultValue: T,
    storage: Storage,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {

    const readValue = useCallback((): T => {
        try {
            const item = storage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            try {
                return JSON.parse(item) as T;
            } catch {
                // If JSON.parse fails, return the raw string value (for plain strings/numbers stored directly)
                return item as T;
            }
        } catch (error) {
            console.warn(`Error reading key "${key}":`, error);
            return defaultValue;
        }
    }, [key, defaultValue, storage]);

    const [storedValue, setStoredValue] = useState<T>(readValue);

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                const serialized = typeof valueToStore === 'string' || typeof valueToStore === 'number'
                    ? String(valueToStore)
                    : JSON.stringify(valueToStore);
                storage.setItem(key, serialized);
                window.dispatchEvent(new StorageEvent('storage', {key}));
            } catch (error) {
                console.warn(`Error setting key "${key}":`, error);
            }
        },
        [key, storedValue, storage]
    );

    const removeValue = useCallback(() => {
        try {
            storage.removeItem(key);
            setStoredValue(defaultValue);
            window.dispatchEvent(new StorageEvent('storage', {key}));
        } catch (error) {
            console.warn(`Error removing key "${key}":`, error);
        }
    }, [key, defaultValue, storage]);

    useEffect(() => {
        setStoredValue(readValue());
    }, [readValue]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
                setStoredValue(readValue());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, readValue]);

    return [storedValue, setValue, removeValue];
}

export function useLocalStorage<T>(
    key: string,
    defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    return useStorage(key, defaultValue, window.localStorage);
}

export function useSessionStorage<T>(
    key: string,
    defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    return useStorage(key, defaultValue, window.sessionStorage);
}

export default useStorage;

