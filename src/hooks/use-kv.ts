import { useState, useCallback } from 'react';

// Mock implementation of useKV hook for development
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`kv:${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setKVValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        localStorage.setItem(`kv:${key}`, JSON.stringify(nextValue));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
      return nextValue;
    });
  }, [key]);

  const deleteKVValue = useCallback(() => {
    try {
      localStorage.removeItem(`kv:${key}`);
      setValue(defaultValue);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  }, [key, defaultValue]);

  return [value, setKVValue, deleteKVValue];
}