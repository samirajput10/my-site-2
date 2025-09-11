
"use client";

import React, { createContext, useContext, ReactNode, useMemo } from 'react';

type Currency = 'PKR';

interface CurrencyContextType {
  currency: Currency;
  formatPrice: (priceInPkr: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const currency: Currency = 'PKR';

  const formatPrice = useMemo(() => (priceInPkr: number) => {
    // Assuming prices are now stored directly in PKR
    return `PKR ${priceInPkr.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }, []);
  
  const setCurrency = (newCurrency: Currency) => {
    // No-op, currency is fixed to PKR
  };

  const value = {
    currency,
    setCurrency,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
