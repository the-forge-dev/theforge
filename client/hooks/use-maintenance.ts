import { useState, useCallback } from "react";
import {
  getMaintenanceMode,
  setMaintenanceMode as updateMaintenanceMode,
  checkTableExists,
} from "@/lib/services/maintenance";
import { setMaintenanceMode as setConfigMaintenanceMode } from "@/lib/config";

export function useMaintenanceMode() {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  const fetchMaintenanceMode = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if table exists
      const exists = await checkTableExists();
      setTableExists(exists);

      if (exists) {
        const mode = await getMaintenanceMode();
        setMaintenanceMode(mode);
        setConfigMaintenanceMode(mode);
      } else {
        setMaintenanceMode(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching maintenance mode";
      setError(message);
      setMaintenanceMode(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMaintenanceMode = useCallback(
    async (enabled: boolean) => {
      setLoading(true);
      setError(null);

      try {
        // Check if table exists first
        if (!tableExists) {
          const exists = await checkTableExists();
          setTableExists(exists);

          if (!exists) {
            throw new Error(
              "La tabla site_config no existe en Supabase. Contacta a soporte para crearla."
            );
          }
        }

        const result = await updateMaintenanceMode(enabled);
        setMaintenanceMode(result.maintenance_mode);
        setConfigMaintenanceMode(result.maintenance_mode);

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error updating maintenance mode";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tableExists]
  );

  return {
    maintenanceMode,
    loading,
    error,
    tableExists,
    fetchMaintenanceMode,
    toggleMaintenanceMode,
  };
}
