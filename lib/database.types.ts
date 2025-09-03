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
      polls: {
        Row: {
          id: string;
          question: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          total_votes: number;
        };
        Insert: {
          id?: string;
          question: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          total_votes?: number;
        };
        Update: {
          id?: string;
          question?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          total_votes?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'polls_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          votes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
          votes_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          text?: string;
          votes_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'poll_options_poll_id_fkey';
            columns: ['poll_id'];
            referencedRelation: 'polls';
            referencedColumns: ['id'];
          }
        ];
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_option_id_fkey';
            columns: ['option_id'];
            referencedRelation: 'poll_options';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_poll_id_fkey';
            columns: ['poll_id'];
            referencedRelation: 'polls';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
