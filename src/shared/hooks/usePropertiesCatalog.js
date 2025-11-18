import { useCallback, useEffect, useState } from 'react';
import { propertiesApiService } from '../services/propertiesApiService';

export function usePropertiesCatalog(autoLoad = true) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesApiService.getAll();
      setOptions(data);
    } catch (err) {
      setError(err.message || 'No fue posible cargar los inmuebles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      fetchOptions();
    }
  }, [autoLoad, fetchOptions]);

  return {
    properties: options,
    loading,
    error,
    refetch: fetchOptions
  };
}
