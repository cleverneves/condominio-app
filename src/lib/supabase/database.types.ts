/**
 * Tipos do schema Supabase usados pelo produto (ver /supabase/migrations).
 * Mantido a mao neste projeto (sem `supabase gen types`, pois nao ha
 * instancia Supabase provisionada neste ambiente). Se um projeto Supabase
 * real existir, prefira gerar este arquivo com o CLI e substituir aqui.
 */

export type Role = "administrativo" | "proprietario" | "inquilino";

export type OccurrenceStatus =
  "pendente" | "em_andamento" | "resolvida" | "cancelada";

export type OccurrenceCategory =
  "reclamacao" | "obra" | "importunacao" | "hidraulica" | "eletrica";

export type OccurrenceLocation =
  "apartamento" | "area_comum" | "praca" | "garagem" | "portaria";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          full_name: string;
          email: string;
          phone: string;
          bloco: string | null;
          apartamento: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: Role;
          full_name: string;
          email: string;
          phone: string;
          bloco?: string | null;
          apartamento?: string | null;
          is_active?: boolean;
        };
        Update: Partial<{
          role: Role;
          full_name: string;
          email: string;
          phone: string;
          bloco: string | null;
          apartamento: string | null;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      occurrences: {
        Row: {
          id: number;
          author_id: string;
          title: string;
          details: string;
          category: OccurrenceCategory;
          location: OccurrenceLocation;
          status: OccurrenceStatus;
          author_bloco: string;
          author_apartamento: string;
          opened_at: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          title: string;
          details: string;
          category: OccurrenceCategory;
          location: OccurrenceLocation;
          author_bloco: string;
          author_apartamento: string;
          status?: OccurrenceStatus;
        };
        Update: Partial<{
          title: string;
          details: string;
          category: OccurrenceCategory;
          location: OccurrenceLocation;
          status: OccurrenceStatus;
        }>;
        Relationships: [
          {
            foreignKeyName: "occurrences_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      occurrence_images: {
        Row: {
          id: number;
          occurrence_id: number;
          storage_path: string;
          position: number;
          created_at: string;
        };
        Insert: {
          occurrence_id: number;
          storage_path: string;
          position: number;
        };
        Update: Partial<{
          storage_path: string;
          position: number;
        }>;
        Relationships: [
          {
            foreignKeyName: "occurrence_images_occurrence_id_fkey";
            columns: ["occurrence_id"];
            referencedRelation: "occurrences";
            referencedColumns: ["id"];
          },
        ];
      };
      occurrence_comments: {
        Row: {
          id: number;
          occurrence_id: number;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          occurrence_id: number;
          author_id: string;
          body: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "occurrence_comments_occurrence_id_fkey";
            columns: ["occurrence_id"];
            referencedRelation: "occurrences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "occurrence_comments_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
