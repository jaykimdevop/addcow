import { createServiceClient } from "@/lib/supabase/server";

export type SiteMode = "faked_door" | "mvp";

export async function getSiteMode(): Promise<SiteMode> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "site_mode")
    .single();

  if (error || !data) {
    // Default to faked_door if not set
    return "faked_door";
  }

  const mode = data.value as string;
  return (mode === "mvp" ? "mvp" : "faked_door") as SiteMode;
}

export async function setSiteMode(
  mode: SiteMode,
  updatedBy?: string
): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        key: "site_mode",
        value: mode,
        updated_by: updatedBy || null,
      },
      {
        onConflict: "key",
      }
    );

  if (error) {
    throw new Error(`Failed to update site mode: ${error.message}`);
  }
}

export async function getSiteSetting<T = unknown>(
  key: string
): Promise<T | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    return null;
  }

  return data.value as T;
}

export async function setSiteSetting<T = unknown>(
  key: string,
  value: T,
  updatedBy?: string
): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        key,
        value: value as unknown,
        updated_by: updatedBy || null,
      },
      {
        onConflict: "key",
      }
    );

  if (error) {
    throw new Error(`Failed to update site setting: ${error.message}`);
  }
}

