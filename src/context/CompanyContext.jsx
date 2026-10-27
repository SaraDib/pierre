import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCompanyInfo, DEFAULT_COMPANY, formatCompanyMediaUrl } from '../api/company';

const CompanyContext = createContext(null);

const SITE_URL = 'https://sutravomar-pierre.ma';

/** Normalise un numéro marocain au format international E.164 (+212...) */
function toE164(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = '212' + digits.slice(1);
  if (!/^\d{9,15}$/.test(digits)) return null;
  // Ignore le numéro fictif par défaut
  if (/^2126?0{7,}$/.test(digits)) return null;
  return `+${digits}`;
}

/** Met à jour les données structurées Schema.org avec les infos de la BDD */
function syncStructuredData(company) {
  const el = document.getElementById('ld-business');
  if (!el) return;
  let ld;
  try {
    ld = JSON.parse(el.textContent);
  } catch {
    return;
  }

  const phones = [company.phone, company.phone_secondary].map(toE164).filter(Boolean);
  if (phones[0]) ld.telephone = phones[0];
  else delete ld.telephone;

  if (company.email) ld.email = company.email;
  if (company.description) ld.description = company.description;

  if (company.address || company.city) {
    ld.address = {
      ...ld.address,
      '@type': 'PostalAddress',
      ...(company.address ? { streetAddress: company.address } : {}),
      ...(company.city ? { addressLocality: company.city } : {}),
      addressCountry: 'MA',
    };
  }

  if (company.maps_url) ld.hasMap = company.maps_url;

  const sameAs = [company.facebook_url, company.instagram_url].filter(
    (u) => u && !/^https?:\/\/(www\.)?(facebook|instagram)\.com\/?$/i.test(u)
  );
  if (sameAs.length) ld.sameAs = sameAs;
  else delete ld.sameAs;

  if (company.logo_url) {
    const logo = formatCompanyMediaUrl(company.logo_url);
    ld.logo = logo.startsWith('http') ? logo : `${SITE_URL}${logo.startsWith('/') ? '' : '/'}${logo}`;
  }

  el.textContent = JSON.stringify(ld, null, 2);
}

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

  useEffect(() => {
    if (!loading) syncStructuredData(company);
  }, [company, loading]);

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
