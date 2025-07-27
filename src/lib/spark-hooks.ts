// Mock implementation of @github/spark/hooks for local development
import { useState, useCallback } from 'react';

export const useKV = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`spark-kv-${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((current: T) => T)) => {
    setValue(current => {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (current: T) => T)(current)
        : newValue;
      
      try {
        localStorage.setItem(`spark-kv-${key}`, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn('Failed to store value in localStorage:', error);
      }
      
      return valueToStore;
    });
  }, [key]);

  const deleteValue = useCallback(() => {
    try {
      localStorage.removeItem(`spark-kv-${key}`);
      setValue(defaultValue);
    } catch (error) {
      console.warn('Failed to remove value from localStorage:', error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, deleteValue] as const;
};