import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  isMaintenanceModeEnabled,
  loadMaintenanceModeFromSupabase,
  config,
} from "@/lib/config";
import MaintenancePage from "./MaintenancePage";
import AppLayout from "./AppLayout";

export default function AppWrapper() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState(
    isMaintenanceModeEnabled()
  );
  const [configLoaded, setConfigLoaded] = useState(false);

  // React Router no resetea el scroll al navegar entre rutas (a diferencia
  // de una navegación normal del navegador) — sin esto, un link como "Ver
  // Todos Los Productos" al fondo de la home te deja en /productos con el
  // scroll heredado de la página anterior en vez de arriba del todo.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Load maintenance mode config on mount
  useEffect(() => {
    const loadConfig = async () => {
      // Try to load from Supabase (if table exists)
      await loadMaintenanceModeFromSupabase();
      setMaintenanceMode(isMaintenanceModeEnabled());
      setConfigLoaded(true);
    };

    loadConfig();
  }, []);

  // Recheck maintenance mode periodically (useful if loading from Supabase or config changes)
  useEffect(() => {
    if (!configLoaded) return;

    const checkMaintenanceMode = async () => {
      await loadMaintenanceModeFromSupabase();
      setMaintenanceMode(isMaintenanceModeEnabled());
    };

    // Check every 5 seconds to respond quickly to admin changes
    const interval = setInterval(checkMaintenanceMode, 5000);
    return () => clearInterval(interval);
  }, [configLoaded]);

  // Show loading state while checking authentication or loading config
  if (loading || !configLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary/50 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70 italic">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show maintenance page if maintenance mode is enabled and user is not authenticated
  // EXCEPT for /admin route - admin panel is always accessible for login
  if (maintenanceMode && !user && location.pathname !== "/admin") {
    return <MaintenancePage />;
  }

  // Show normal app for authenticated users, /admin route, or if maintenance mode is disabled
  return <AppLayout />;
}
