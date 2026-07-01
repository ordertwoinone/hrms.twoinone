export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          after: Json | null;
          before: Json | null;
          created_at: string;
          entity: string;
          entity_id: string | null;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          after?: Json | null;
          before?: Json | null;
          created_at?: string;
          entity: string;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          after?: Json | null;
          before?: Json | null;
          created_at?: string;
          entity?: string;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      branches: {
        Row: {
          address_line: string | null;
          city: string | null;
          code: string;
          company_id: string;
          country: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          email: string | null;
          id: string;
          manager_id: string | null;
          name: string;
          phone: string | null;
          status: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          address_line?: string | null;
          city?: string | null;
          code: string;
          company_id: string;
          country?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          manager_id?: string | null;
          name: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          address_line?: string | null;
          city?: string | null;
          code?: string;
          company_id?: string;
          country?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          manager_id?: string | null;
          name?: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branches_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          address_line: string | null;
          city: string | null;
          country: string;
          created_at: string;
          created_by: string | null;
          currency: string;
          deleted_at: string | null;
          email: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          office_end_time: string | null;
          office_start_time: string | null;
          phone: string | null;
          tax_registration_number: string | null;
          timezone: string;
          trade_license_number: string | null;
          updated_at: string;
          updated_by: string | null;
          website: string | null;
          working_days: number[];
        };
        Insert: {
          address_line?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          office_end_time?: string | null;
          office_start_time?: string | null;
          phone?: string | null;
          tax_registration_number?: string | null;
          timezone?: string;
          trade_license_number?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          website?: string | null;
          working_days?: number[];
        };
        Update: {
          address_line?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          office_end_time?: string | null;
          office_start_time?: string | null;
          phone?: string | null;
          tax_registration_number?: string | null;
          timezone?: string;
          trade_license_number?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          website?: string | null;
          working_days?: number[];
        };
        Relationships: [];
      };
      company_holidays: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          holiday_date: string;
          id: string;
          is_recurring: boolean;
          name: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          holiday_date: string;
          id?: string;
          is_recurring?: boolean;
          name: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          holiday_date?: string;
          id?: string;
          is_recurring?: boolean;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_holidays_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          branch_id: string | null;
          code: string;
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          head_id: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          status: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          branch_id?: string | null;
          code: string;
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          head_id?: string | null;
          id?: string;
          name: string;
          parent_id?: string | null;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          branch_id?: string | null;
          code?: string;
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          head_id?: string | null;
          id?: string;
          name?: string;
          parent_id?: string | null;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "departments_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "departments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "departments_head_id_fkey";
            columns: ["head_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "departments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      designations: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          department_id: string | null;
          description: string | null;
          grade: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          department_id?: string | null;
          description?: string | null;
          grade?: string | null;
          id?: string;
          name: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          department_id?: string | null;
          description?: string | null;
          grade?: string | null;
          id?: string;
          name?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "designations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "designations_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      employment_types: {
        Row: {
          company_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          is_system: boolean;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employment_types_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          action: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          key: string;
          resource: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          key: string;
          resource: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          key?: string;
          resource?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          email: string;
          full_name: string;
          id: string;
          last_sign_in_at: string | null;
          phone: string | null;
          role_id: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email: string;
          full_name: string;
          id: string;
          last_sign_in_at?: string | null;
          phone?: string | null;
          role_id: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          last_sign_in_at?: string | null;
          phone?: string | null;
          role_id?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          permission_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          is_system: boolean;
          key: string;
          name: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          key: string;
          name: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          key?: string;
          name?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      user_permissions: {
        Row: {
          created_at: string;
          created_by: string | null;
          granted: boolean;
          id: string;
          permission_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          granted?: boolean;
          id?: string;
          permission_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          granted?: boolean;
          id?: string;
          permission_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_permissions: {
        Args: never;
        Returns: {
          key: string;
        }[];
      };
      current_user_role_key: { Args: never; Returns: string };
      has_permission: { Args: { perm: string }; Returns: boolean };
      is_super_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
