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
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          role: "admin" | "viewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          role?: "admin" | "viewer";
          created_at?: string;
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
    };
  };
}

// Extend submissions type
export interface Submission extends Database["public"]["Tables"]["submissions"]["Row"] {
  notified?: boolean;
  account_created?: boolean;
  notified_at?: string | null;
}

