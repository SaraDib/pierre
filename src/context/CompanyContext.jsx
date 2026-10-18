import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCompanyInfo, DEFAULT_COMPANY } from '../api/company';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [loading, setLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    try {
      const data = await getCompanyInfo();
      if (data) {
        setCompany((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn('Erreur lors du chargement des infos entreprise:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const updateCompanyState = useCallback((newData) => {
    setCompany((prev) => ({ ...prev, ...newData }));
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        company,
        loading,
        reloadCompany: fetchCompany,
        updateCompanyState,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    return {
      company: DEFAULT_COMPANY,
      loading: false,
      reloadCompany: () => {},
      updateCompanyState: () => {},
    };
  }
  return context;
}
