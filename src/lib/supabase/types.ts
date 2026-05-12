// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      condominios: {
        Row: {
          id_condominio_externo: string
          id_condominio_interno: string
          nome_condominio: string
        }
        Insert: {
          id_condominio_externo: string
          id_condominio_interno: string
          nome_condominio: string
        }
        Update: {
          id_condominio_externo?: string
          id_condominio_interno?: string
          nome_condominio?: string
        }
        Relationships: []
      }
      convencoes_chunks: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      CRM_geral: {
        Row: {
          'Data da consulta': string | null
          'Follow UP 1': string | null
          'Follow UP 2': string | null
          'Follow UP 3': string | null
          id_conversa: number
          'IDConta ChatWoot': string | null
          'IDConversa ChatWoot': string | null
          'Identificador do usuario': string | null
          'IDLead ChatWoot': string | null
          'InboxID ChatWoot': string | null
          'Inicio do atendimento': string | null
          'Marcou no Grupo': string | null
          Nome: string | null
          Procedimento: string | null
          'Resumo da conversa': string | null
          'Timestamp ultima msg': string | null
          Unidade: string | null
          Whatsapp: string | null
        }
        Insert: {
          'Data da consulta'?: string | null
          'Follow UP 1'?: string | null
          'Follow UP 2'?: string | null
          'Follow UP 3'?: string | null
          id_conversa?: number
          'IDConta ChatWoot'?: string | null
          'IDConversa ChatWoot'?: string | null
          'Identificador do usuario'?: string | null
          'IDLead ChatWoot'?: string | null
          'InboxID ChatWoot'?: string | null
          'Inicio do atendimento'?: string | null
          'Marcou no Grupo'?: string | null
          Nome?: string | null
          Procedimento?: string | null
          'Resumo da conversa'?: string | null
          'Timestamp ultima msg'?: string | null
          Unidade?: string | null
          Whatsapp?: string | null
        }
        Update: {
          'Data da consulta'?: string | null
          'Follow UP 1'?: string | null
          'Follow UP 2'?: string | null
          'Follow UP 3'?: string | null
          id_conversa?: number
          'IDConta ChatWoot'?: string | null
          'IDConversa ChatWoot'?: string | null
          'Identificador do usuario'?: string | null
          'IDLead ChatWoot'?: string | null
          'InboxID ChatWoot'?: string | null
          'Inicio do atendimento'?: string | null
          'Marcou no Grupo'?: string | null
          Nome?: string | null
          Procedimento?: string | null
          'Resumo da conversa'?: string | null
          'Timestamp ultima msg'?: string | null
          Unidade?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      historico_infracoes: {
        Row: {
          artigo_violado: string | null
          data_infracao: string | null
          id: number
          nome_condominio: string | null
          nome_infrator: string | null
          relato: string | null
          status: string | null
          unidade: string | null
        }
        Insert: {
          artigo_violado?: string | null
          data_infracao?: string | null
          id?: number
          nome_condominio?: string | null
          nome_infrator?: string | null
          relato?: string | null
          status?: string | null
          unidade?: string | null
        }
        Update: {
          artigo_violado?: string | null
          data_infracao?: string | null
          id?: number
          nome_condominio?: string | null
          nome_infrator?: string | null
          relato?: string | null
          status?: string | null
          unidade?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      inventario_condominios: {
        Row: {
          nome_do_condominio: string | null
          total_de_artigos_fatiados: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: CRM_geral
//   Identificador do usuario: text (nullable)
//   Inicio do atendimento: text (nullable)
//   Nome: text (nullable)
//   Whatsapp: text (nullable)
//   Procedimento: text (nullable)
//   Unidade: text (nullable)
//   Resumo da conversa: text (nullable)
//   Data da consulta: text (nullable)
//   Marcou no Grupo: text (nullable)
//   Timestamp ultima msg: text (nullable)
//   Follow UP 1: text (nullable)
//   Follow UP 2: text (nullable)
//   Follow UP 3: text (nullable)
//   IDConta ChatWoot: text (nullable)
//   IDConversa ChatWoot: text (nullable)
//   IDLead ChatWoot: text (nullable)
//   InboxID ChatWoot: text (nullable)
//   id_conversa: bigint (not null)
// Table: condominios
//   id_condominio_interno: text (not null)
//   id_condominio_externo: text (not null)
//   nome_condominio: text (not null)
// Table: convencoes_chunks
//   id: bigint (not null, default: nextval('convencoes_chunks_id_seq'::regclass))
//   content: text (nullable)
//   metadata: jsonb (nullable)
//   embedding: vector (nullable)
// Table: historico_infracoes
//   id: integer (not null, default: nextval('historico_infracoes_id_seq'::regclass))
//   nome_condominio: text (nullable)
//   unidade: text (nullable)
//   nome_infrator: text (nullable)
//   relato: text (nullable)
//   artigo_violado: text (nullable)
//   data_infracao: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'Primeira Advertência'::text)
// Table: inventario_condominios
//   nome_do_condominio: text (nullable)
//   total_de_artigos_fatiados: bigint (nullable)
// Table: n8n_chat_histories
//   id: integer (not null, default: nextval('n8n_chat_histories_id_seq'::regclass))
//   session_id: character varying (not null)
//   message: jsonb (not null)

// --- CONSTRAINTS ---
// Table: CRM_geral
//   PRIMARY KEY CRM_geral_pkey: PRIMARY KEY (id_conversa)
// Table: condominios
//   PRIMARY KEY condominios_pkey: PRIMARY KEY (id_condominio_interno)
// Table: convencoes_chunks
//   PRIMARY KEY convencoes_chunks_pkey: PRIMARY KEY (id)
// Table: historico_infracoes
//   PRIMARY KEY historico_infracoes_pkey: PRIMARY KEY (id)
// Table: n8n_chat_histories
//   PRIMARY KEY n8n_chat_histories_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: CRM_geral
//   Policy "authenticated_delete_crm" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_crm" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_crm" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_crm" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: condominios
//   Policy "authenticated_delete_condominios" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_condominios" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_condominios" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_condominios" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: convencoes_chunks
//   Policy "authenticated_delete_chunks" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_chunks" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_chunks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_chunks" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: historico_infracoes
//   Policy "authenticated_delete_infracoes" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_infracoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_infracoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_infracoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: n8n_chat_histories
//   Policy "authenticated_delete_n8n" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_n8n" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_n8n" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_n8n" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION match_documents(vector, integer, jsonb)
//   CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
//    RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
//    LANGUAGE plpgsql
//   AS $function$
//   #variable_conflict use_column
//   begin
//     return query
//     select
//       id,
//       content,
//       metadata,
//       1 - (convencoes_chunks.embedding <=> query_embedding) as similarity
//     from convencoes_chunks
//     where metadata @> filter
//     order by convencoes_chunks.embedding <=> query_embedding
//     limit match_count;
//   end;
//   $function$
//
