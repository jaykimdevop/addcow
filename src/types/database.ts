export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          metadata: Json | null;
          notified: boolean | null;
          account_created: boolean | null;
          notified_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          metadata?: Json | null;
          notified?: boolean | null;
          account_created?: boolean | null;
          notified_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          metadata?: Json | null;
          notified?: boolean | null;
          account_created?: boolean | null;
          notified_at?: string | null;
        };
      };
      admin_users: {
        Row: {
          id: string;
          clerk_user_id: string;
          role: "admin" | "viewer";
          created_at: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          username: string | null;
          image_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          role: "admin" | "viewer";
          created_at?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          username?: string | null;
          image_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          role?: "admin" | "viewer";
          created_at?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          username?: string | null;
          image_url?: string | null;
          updated_at?: string | null;
        };
      };
      webhook_events: {
        Row: {
          id: string;
          event_type: string;
          event_data: Json;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          event_data: Json;
          processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          event_data?: Json;
          processed?: boolean;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      google_drive_tokens: {
        Row: {
          id: string;
          clerk_user_id: string;
          access_token: string;
          refresh_token: string;
          token_expiry: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          access_token: string;
          refresh_token: string;
          token_expiry: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          access_token?: string;
          refresh_token?: string;
          token_expiry?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Submission type alias
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];

