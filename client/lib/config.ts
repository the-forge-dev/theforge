import { supabase } from "./supabase";

// Global configuration
export const config = {
  maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === "true",
};

export function setMaintenanceMode(enabled: boolean) {
  config.maintenanceMode = enabled;
}

export function isMaintenanceModeEnabled(): boolean {
  return config.maintenanceMode;
}

// Load maintenance mode from Supabase
// This is optional and can be called from AppWrapper to load dynamically
export async function loadMaintenanceModeFromSupabase(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();

    if (!error && data) {
      setMaintenanceMode(data.maintenance_mode);
    }
  } catch (err) {
    // Table might not exist or other error - that's ok, use default config
    console.debug("Maintenance mode config table not found or other error");
  }
}
