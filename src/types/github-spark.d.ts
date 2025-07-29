declare module '@github/spark/hooks' {
  export function useKV<T>(
    key: string, 
    defaultValue: T
  ): [T, (value: T | ((prev: T) => T)) => void, () => void];
}