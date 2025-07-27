/**
 * Spark KV Hooks - Provides persistent key-value storage for React components
 * These hooks integrate with the Spark runtime's persistent storage system
 */

import { useState, useEffect, useCallback } from 'react';

// Mock implementation for development environment
// In production, this would integrate with the actual Spark KV system
const mockKV = {
  data: new Map<string, any>(),
  
  async get<T>(key: string): Promise<T | undefined> {
    const stored = localStorage.getItem(`spark-kv-${key}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return undefined;
      }
    }
    return undefined;
  },
  
  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(`spark-kv-${key}`, JSON.stringify(value));
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1));
  },
  
  async delete(key: string): Promise<void> {
    localStorage.removeItem(`spark-kv-${key}`);
    await new Promise(resolve => setTimeout(resolve, 1));
  },
  
  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('spark-kv-')) {
        keys.push(key.replace('spark-kv-', ''));
      }
    }
    return keys;
  }
};

/**
 * React hook for persistent key-value storage
 * @param key - Unique key for the stored value
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue, deleteValue] tuple
 */
export function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, () => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize value from storage
  useEffect(() => {
    const initValue = async () => {
      try {
        const stored = await mockKV.get<T>(key);
        if (stored !== undefined) {
          setValue(stored);
        }
      } catch (error) {
        console.warn(`Failed to load KV value for key "${key}":`, error);
      } finally {
        setIsInitialized(true);
      }
    };

    initValue();
  }, [key]);

  const updateValue = useCallback(async (newValue: T | ((prev: T) => T)) => {
    try {
      const resolvedValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(value) : newValue;
      await mockKV.set(key, resolvedValue);
      setValue(resolvedValue);
    } catch (error) {
      console.error(`Failed to save KV value for key "${key}":`, error);
      throw error;
    }
  }, [key, value]);

  const deleteValue = useCallback(async () => {
    try {
      await mockKV.delete(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Failed to delete KV value for key "${key}":`, error);
      throw error;
    }
  }, [key, defaultValue]);

  // Return default value until initialized
  return [isInitialized ? value : defaultValue, updateValue, deleteValue];
}