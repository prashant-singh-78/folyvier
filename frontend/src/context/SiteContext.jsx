import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [conditions, setConditions] = useState([]);
  const [products, setProducts] = useState([]);
  const [technology, setTechnology] = useState(null);
  const [googleClientId, setGoogleClientId] = useState('');
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedConditionCode, setSelectedConditionCode] = useState('condition-1');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotIntent, setChatbotIntent] = useState(null);

  const refreshSiteData = useCallback(async () => {
    try {
      setError('');
      const data = await api.getBootstrap();
      setConditions(data.conditions || []);
      setProducts(data.products || []);
      setTechnology(data.technology_650nm || null);
      setGoogleClientId(data.google_client_id || '');
      setWhatsappConfigured(Boolean(data.whatsapp_cloud_configured));
    } catch (err) {
      setError(err.message || 'Unable to connect to FOLIBEIR server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSiteData();
  }, [refreshSiteData]);

  const openChatbot = useCallback((intent = null) => {
    if (intent) setChatbotIntent(intent);
    setChatbotOpen(true);
  }, []);

  return (
    <SiteContext.Provider
      value={{
        conditions,
        products,
        technology,
        googleClientId,
        whatsappConfigured,
        loading,
        error,
        refreshSiteData,
        selectedConditionCode,
        setSelectedConditionCode,
        chatbotOpen,
        setChatbotOpen,
        chatbotIntent,
        setChatbotIntent,
        openChatbot,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}
