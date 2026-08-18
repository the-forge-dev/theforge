import { supabase } from "@/lib/supabase";

export interface SiteConfig {
  id: number;
  maintenance_mode: boolean;
  updated_at: string;
}

// Get current maintenance mode status
export async function getMaintenanceMode(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned, return false as default
        return false;
      }
      throw error;
    }

    return data?.maintenance_mode ?? false;
  } catch (error) {
    console.error("Error getting maintenance mode:", error);
    throw error;
  }
}

// Update maintenance mode status
export async function setMaintenanceMode(enabled: boolean): Promise<SiteConfig> {
  try {
    // Try to update first
    const { data, error } = await supabase
      .from("site_config")
      .update({
        maintenance_mode: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found, try to insert
        const { data: insertData, error: insertError } = await supabase
          .from("site_config")
          .insert([
            {
              id: 1,
              maintenance_mode: enabled,
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        return insertData;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error setting maintenance mode:", error);
    throw error;
  }
}

// Check if site_config table exists
export async function checkTableExists(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("site_config")
      .select("id")
      .limit(1);

    // PGRST205 means table not found
    if (error?.code === "PGRST205") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
