import { useState } from 'react';

export function useCookie<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof document === 'undefined') {
                return initialValue;
            }
            // More robust cookie parsing
            const cookies = document.cookie.split(';');
            const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));

            if (cookie) {
                const cookieValue = cookie.split('=')[1];
                return JSON.parse(decodeURIComponent(cookieValue));
            }

            return initialValue;
        } catch (error) {
            console.error('Error reading cookie:', error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof document !== 'undefined') {
                // Set cookie with secure defaults
                const serializedValue = encodeURIComponent(JSON.stringify(valueToStore));
                document.cookie = `${key}=${serializedValue}; path=/; max-age=31536000; SameSite=Lax`;
            }
        } catch (error) {
            console.error('Error setting cookie:', error);
        }
    };

    return [storedValue, setValue];
}
