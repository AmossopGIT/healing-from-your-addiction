import type {
  CmsBlogPostRow,
  CmsCaseStudyRow,
  CmsWorkflowEventRow,
  CmsWorkflowStatus,
} from "@/types/cms";

export type UserRole = "admin" | "client";

export type LeadStatus = "new" | "contacted" | "qualified" | "enrolled" | "closed";

export type EnrollmentStatus = "active" | "paused" | "completed";

export type SessionProgressStatus = "locked" | "available" | "in_progress" | "completed";

export type ProgrammeContentType = "hypno" | "eft" | "affirmations" | "questions" | "overview";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  addiction_concern: string;
  preferred_contact_method: string;
  message: string | null;
  source_page: string | null;
  landing_page: string | null;
  referrer: string | null;
  page_type: string | null;
  primary_keyword: string | null;
  conversion_goal: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  status: LeadStatus;
  assigned_admin_id: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadNote = {
  id: string;
  lead_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type ClientProfile = {
  id: string;
  user_id: string;
  lead_id: string | null;
  addiction_slug: string | null;
  preferred_contact_method: string | null;
  emergency_contact: string | null;
  consent_signed_at: string | null;
  created_at: string;
};

export type ProgrammeTemplate = {
  id: string;
  addiction_slug: string;
  title: string;
  session_count: number;
  source_case_study_slug: string | null;
  created_at: string;
};

export type ProgrammeSession = {
  id: string;
  template_id: string;
  week_number: number;
  session_number: number;
  title: string;
  content_type: ProgrammeContentType;
  content_ref: string;
  sort_order: number;
  created_at: string;
};

export type Enrollment = {
  id: string;
  client_profile_id: string;
  template_id: string;
  status: EnrollmentStatus;
  start_date: string | null;
  current_session_number: number;
  admin_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SessionProgress = {
  id: string;
  enrollment_id: string;
  session_id: string;
  status: SessionProgressStatus;
  completed_at: string | null;
  client_notes: string | null;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientMessage = {
  id: string;
  client_profile_id: string;
  author_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ClientDocument = {
  id: string;
  client_profile_id: string;
  storage_path: string;
  label: string;
  uploaded_by: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type { CmsBlogPostRow, CmsCaseStudyRow, CmsWorkflowEventRow, CmsWorkflowStatus };

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, { id: string; role: UserRole; full_name?: string | null; phone?: string | null; created_at?: string }, Partial<Profile>>;
      leads: TableDef<
        Lead,
        {
          full_name: string;
          email: string;
          phone: string;
          addiction_concern: string;
          preferred_contact_method: string;
          message?: string | null;
          source_page?: string | null;
          landing_page?: string | null;
          referrer?: string | null;
          page_type?: string | null;
          primary_keyword?: string | null;
          conversion_goal?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          gclid?: string | null;
          status?: LeadStatus;
          assigned_admin_id?: string | null;
          client_id?: string | null;
        },
        Partial<Lead>
      >;
      lead_notes: TableDef<LeadNote, { lead_id: string; author_id: string; body: string }, Partial<LeadNote>>;
      client_profiles: TableDef<
        ClientProfile,
        {
          user_id: string;
          lead_id?: string | null;
          addiction_slug?: string | null;
          preferred_contact_method?: string | null;
          emergency_contact?: string | null;
          consent_signed_at?: string | null;
        },
        Partial<ClientProfile>
      >;
      programme_templates: TableDef<
        ProgrammeTemplate,
        { addiction_slug: string; title: string; session_count?: number; source_case_study_slug?: string | null },
        Partial<ProgrammeTemplate>
      >;
      programme_sessions: TableDef<
        ProgrammeSession,
        {
          template_id: string;
          week_number: number;
          session_number: number;
          title: string;
          content_type: ProgrammeContentType;
          content_ref: string;
          sort_order?: number;
        },
        Partial<ProgrammeSession>
      >;
      enrollments: TableDef<
        Enrollment,
        {
          client_profile_id: string;
          template_id: string;
          status?: EnrollmentStatus;
          start_date?: string | null;
          current_session_number?: number;
          admin_id?: string | null;
        },
        Partial<Enrollment>
      >;
      session_progress: TableDef<
        SessionProgress,
        {
          enrollment_id: string;
          session_id: string;
          status?: SessionProgressStatus;
          completed_at?: string | null;
          client_notes?: string | null;
          unlocked_at?: string | null;
        },
        Partial<SessionProgress>
      >;
      client_messages: TableDef<ClientMessage, { client_profile_id: string; author_id: string; body: string }, Partial<ClientMessage>>;
      client_documents: TableDef<ClientDocument, { client_profile_id: string; storage_path: string; label: string; uploaded_by: string }, Partial<ClientDocument>>;
      audit_log: TableDef<
        AuditLog,
        { user_id?: string | null; action: string; resource_type: string; resource_id?: string | null; metadata?: Record<string, unknown> | null },
        Partial<AuditLog>
      >;
      cms_blog_posts: TableDef<
        CmsBlogPostRow,
        {
          slug: string;
          title: string;
          description: string;
          excerpt: string;
          h1: string;
          primary_keyword: string;
          category_slug: string;
          hero_art_id: string;
          hero_art_src: string;
          hero_art_alt: string;
          meta_title?: string | null;
          meta_description?: string | null;
          secondary_keywords?: string[];
          search_intent?: string | null;
          conversion_goal?: string | null;
          canonical_path?: string | null;
          noindex?: boolean;
          og_image_alt?: string | null;
          tag_slugs?: string[];
          sections?: CmsBlogPostRow["sections"];
          hero_art_prompt?: string | null;
          hero_art_palette?: string[];
          workflow_status?: CmsWorkflowStatus;
          published_at?: string | null;
          scheduled_for?: string | null;
          review_notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          approved_by?: string | null;
        },
        Partial<CmsBlogPostRow>
      >;
      cms_case_studies: TableDef<
        CmsCaseStudyRow,
        {
          slug: string;
          title: string;
          description: string;
          excerpt: string;
          h1: string;
          primary_keyword: string;
          case_study_type: CmsCaseStudyRow["case_study_type"];
          addiction_slug: string;
          hero_art_id: string;
          hero_art_src: string;
          hero_art_alt: string;
          legacy_slug?: string;
          archive_page_id?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          secondary_keywords?: string[];
          search_intent?: string | null;
          conversion_goal?: string | null;
          canonical_path?: string | null;
          noindex?: boolean;
          og_image_alt?: string | null;
          tag_slugs?: string[];
          sections?: CmsCaseStudyRow["sections"];
          hero_art_prompt?: string | null;
          hero_art_palette?: string[];
          workflow_status?: CmsWorkflowStatus;
          published_at?: string | null;
          scheduled_for?: string | null;
          review_notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          approved_by?: string | null;
        },
        Partial<CmsCaseStudyRow>
      >;
      cms_workflow_events: TableDef<
        CmsWorkflowEventRow,
        {
          content_type: CmsWorkflowEventRow["content_type"];
          content_id: string;
          to_status: CmsWorkflowStatus;
          from_status?: CmsWorkflowStatus | null;
          notes?: string | null;
          actor_id?: string | null;
        },
        Partial<CmsWorkflowEventRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
