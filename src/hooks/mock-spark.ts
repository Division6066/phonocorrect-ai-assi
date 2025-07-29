// Mock implementation of spark hooks for development
import { useState } from 'react';

export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue);
  
  const updateValue = (newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  };
  
  const deleteValue = () => {
    setValue(defaultValue);
  };
  
  return [value, updateValue, deleteValue];
}