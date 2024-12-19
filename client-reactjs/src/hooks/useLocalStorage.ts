import { useCallback } from "react";

const useLocalStorage = () => {
  const getLocalStorage = useCallback(
    (key: string) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : undefined;
    },
    []
  );

  const setLocalStorage = useCallback(
    ({ value, key }: { value: any, key: string }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    []
  );

  const removeLocalStorage = useCallback(
    (key: string) => {
      localStorage.removeItem(key);
    },
    []
  );

  return {
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
  };
};

export default useLocalStorage;
