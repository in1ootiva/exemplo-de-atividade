import { useState, useCallback } from 'react';

const STORAGE_KEY = 'crm-kanban-board-state';

export function useLocalStorage<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Estado para armazenar nosso valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Tentar obter do localStorage
      const item = window.localStorage.getItem(STORAGE_KEY);
      // Parse do JSON armazenado ou retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return initialValue;
    }
  });

  // Função para salvar no localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Permitir que value seja uma função para ter a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salvar no estado
      setStoredValue(valueToStore);
      
      // Salvar no localStorage
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }, [storedValue]);

  return [storedValue, setValue];
}

