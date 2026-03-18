import React, { createContext, useContext, useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

interface CajaContextType {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
  addTransaction: (type: 'income' | 'expense', amount: number, description: string) => void;
  clearHistory: () => void;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

export function CajaProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('micajita_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('micajita_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const addTransaction = (type: 'income' | 'expense', amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount,
      description,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const clearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar la caja fuerte?')) {
      setTransactions([]);
    }
  };

  return (
    <CajaContext.Provider value={{ 
      balance, 
      totalIncome, 
      totalExpenses, 
      transactions, 
      addTransaction,
      clearHistory
    }}>
      {children}
    </CajaContext.Provider>
  );
}

export function useCaja() {
  const context = useContext(CajaContext);
  if (context === undefined) {
    throw new Error('useCaja must be used within a CajaProvider');
  }
  return context;
}
