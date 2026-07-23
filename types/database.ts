import type {
  CmsBlogPostRow,
  CmsCaseStudyRow,
  CmsWorkflowEventRow,
  CmsWorkflowStatus,
} from "@/types/cms";

export type UserRole = "admin" | "client";

export type LeadStatus = "new" | "triage_review" | "outreach_started" | "care_pathway_defined" | "qualified" | "enrolled" | "closed";

export type EnrollmentStatus = "active" | "paused" | "completed";

export type SessionProgressStatus = "locked" | "available" | "in_progress" | "completed";

export type ProgrammeContentType = "hypno" | "eft" | "affirmations" | "questions" | "overview";

export type PortalContentKind = "document" | "session";

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
  urgency_level: "low" | "medium" | "high" | null;
  withdrawal_risk: "none" | "mild" | "moderate" | "severe" | "unsure" | null;
  medical_support_involved: "yes" | "no" | "planning" | null;
  callback_window: "early_morning" | "late_morning" | "afternoon" | "evening" | "flexible" | null;
  support_goals: string | null;
  follow_up_consent_whatsapp: boolean;
  follow_up_consent_email: boolean;
  follow_up_consent_phone: boolean;
  readiness_stage: "exploring" | "ready_now" | "currently_in_support" | null;
  risk_flag: "standard" | "priority" | "urgent_review" | null;
  triage_priority: "routine" | "priority" | "urgent" | null;
  triage_sla_hours: number | null;
  first_response_template_id: string | null;
  first_response_sent_at: string | null;
  assigned_admin_notes: string | null;
  follow_up_due_at: string | null;
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
  onboarding_completed_at: string | null;
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

export type ClientContentReceipt = {
  id: string;
  client_profile_id: string;
  content_kind: PortalContentKind;
  content_id: string;
  released_at: string;
  read_at: string | null;
  created_at: string;
};

export type ClientIntakeSubmission = {
  id: string;
  client_profile_id: string;
  question_set_slug: string;
  responses: Record<string, string>;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ConsultationStatus =
  | "not_sent"
  | "sent"
  | "delivered"
  | "opened"
  | "started"
  | "in_progress"
  | "completed"
  | "uploaded";

export type ConsultationCompletionMode = "online" | "upload";

export type ClientConsultation = {
  id: string;
  client_profile_id: string;
  status: ConsultationStatus;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  current_step: string;
  percent_complete: number;
  responses: Record<string, unknown>;
  signature_name: string | null;
  signed_at: string | null;
  upload_storage_path: string | null;
  upload_file_name: string | null;
  upload_mime_type: string | null;
  completion_mode: ConsultationCompletionMode | null;
  resend_email_id: string | null;
  practitioner_notes: string | null;
  practitioner_reviewed_at: string | null;
  practitioner_reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CheckInMood = "calm" | "steady" | "low" | "anxious" | "irritable";

export type ClientDailyCheckIn = {
  id: string;
  client_profile_id: string;
  check_in_date: string;
  mood: CheckInMood;
  craving_level: number;
  pause_taken: boolean;
  note: string | null;
  created_at: string;
};

export type ClientRecoveryGoal = {
  client_profile_id: string;
  show_abstinence_counter: boolean;
  abstinence_start_date: string | null;
  goal_note: string | null;
  updated_at: string;
};

export type WebPushConsentState = "subscribed" | "dismissed" | "denied" | "unsubscribed";

export type WebPushSubscriptionStatus = "active" | "inactive" | "failed" | "expired";

export type WebPushCategory = "site_updates" | "new_resources" | "gentle_reminders";

export type WebPushSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  subscription_json: Record<string, unknown>;
  categories: WebPushCategory[];
  consent_state: WebPushConsentState;
  status: WebPushSubscriptionStatus;
  user_id: string | null;
  visitor_id: string | null;
  source_path: string | null;
  user_agent: string | null;
  last_seen_at: string;
  last_sent_at: string | null;
  unsubscribed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type WebPushDeliveryLog = {
  id: string;
  subscription_id: string;
  category: WebPushCategory;
  title: string;
  body: string;
  target_url: string;
  status: "sent" | "failed";
  response_status: number | null;
  response_body: string | null;
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

export type ConsentTier = "essential" | "analytics";

export type AnalyticsEvent = {
  id: string;
  occurred_at: string;
  event_name: string;
  page_path: string;
  session_id: string | null;
  visitor_id: string | null;
  consent_tier: ConsentTier;
  page_type: string | null;
  primary_keyword: string | null;
  conversion_goal: string | null;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  properties: Record<string, unknown>;
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
          urgency_level?: "low" | "medium" | "high" | null;
          withdrawal_risk?: "none" | "mild" | "moderate" | "severe" | "unsure" | null;
          medical_support_involved?: "yes" | "no" | "planning" | null;
          callback_window?: "early_morning" | "late_morning" | "afternoon" | "evening" | "flexible" | null;
          support_goals?: string | null;
          follow_up_consent_whatsapp?: boolean;
          follow_up_consent_email?: boolean;
          follow_up_consent_phone?: boolean;
          readiness_stage?: "exploring" | "ready_now" | "currently_in_support" | null;
          risk_flag?: "standard" | "priority" | "urgent_review" | null;
          triage_priority?: "routine" | "priority" | "urgent" | null;
          triage_sla_hours?: number | null;
          first_response_template_id?: string | null;
          first_response_sent_at?: string | null;
          assigned_admin_notes?: string | null;
          follow_up_due_at?: string | null;
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
          onboarding_completed_at?: string | null;
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
      client_content_receipts: TableDef<
        ClientContentReceipt,
        {
          client_profile_id: string;
          content_kind: PortalContentKind;
          content_id: string;
          released_at?: string;
          read_at?: string | null;
        },
        Partial<ClientContentReceipt>
      >;
      client_intake_submissions: TableDef<
        ClientIntakeSubmission,
        {
          client_profile_id: string;
          question_set_slug: string;
          responses?: Record<string, string>;
          completed_at?: string | null;
        },
        Partial<ClientIntakeSubmission>
      >;
      client_consultations: TableDef<
        ClientConsultation,
        {
          client_profile_id: string;
          status?: ConsultationStatus;
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          current_step?: string;
          percent_complete?: number;
          responses?: Record<string, unknown>;
          signature_name?: string | null;
          signed_at?: string | null;
          upload_storage_path?: string | null;
          upload_file_name?: string | null;
          upload_mime_type?: string | null;
          completion_mode?: ConsultationCompletionMode | null;
          resend_email_id?: string | null;
          practitioner_notes?: string | null;
          practitioner_reviewed_at?: string | null;
          practitioner_reviewed_by?: string | null;
        },
        Partial<ClientConsultation>
      >;
      client_daily_check_ins: TableDef<
        ClientDailyCheckIn,
        {
          client_profile_id: string;
          check_in_date: string;
          mood: CheckInMood;
          craving_level: number;
          pause_taken?: boolean;
          note?: string | null;
        },
        Partial<ClientDailyCheckIn>
      >;
      client_recovery_goals: TableDef<
        ClientRecoveryGoal,
        {
          client_profile_id: string;
          show_abstinence_counter?: boolean;
          abstinence_start_date?: string | null;
          goal_note?: string | null;
        },
        Partial<ClientRecoveryGoal>
      >;
      web_push_subscriptions: TableDef<
        WebPushSubscription,
        {
          endpoint: string;
          p256dh: string;
          auth: string;
          subscription_json?: Record<string, unknown>;
          categories?: WebPushCategory[];
          consent_state?: WebPushConsentState;
          status?: WebPushSubscriptionStatus;
          user_id?: string | null;
          visitor_id?: string | null;
          source_path?: string | null;
          user_agent?: string | null;
          last_seen_at?: string;
          last_sent_at?: string | null;
          unsubscribed_at?: string | null;
          last_error?: string | null;
        },
        Partial<WebPushSubscription>
      >;
      web_push_delivery_logs: TableDef<
        WebPushDeliveryLog,
        {
          subscription_id: string;
          category: WebPushCategory;
          title: string;
          body: string;
          target_url: string;
          status: "sent" | "failed";
          response_status?: number | null;
          response_body?: string | null;
        },
        Partial<WebPushDeliveryLog>
      >;
      audit_log: TableDef<
        AuditLog,
        { user_id?: string | null; action: string; resource_type: string; resource_id?: string | null; metadata?: Record<string, unknown> | null },
        Partial<AuditLog>
      >;
      analytics_events: TableDef<
        AnalyticsEvent,
        {
          occurred_at?: string;
          event_name: string;
          page_path: string;
          session_id?: string | null;
          visitor_id?: string | null;
          consent_tier: ConsentTier;
          page_type?: string | null;
          primary_keyword?: string | null;
          conversion_goal?: string | null;
          landing_page?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          gclid?: string | null;
          properties?: Record<string, unknown>;
        },
        Partial<AnalyticsEvent>
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
