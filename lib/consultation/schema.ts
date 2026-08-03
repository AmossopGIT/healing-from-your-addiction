export const CONSULTATION_STEP_KEYS = [
  "personal",
  "contact",
  "reasons",
  "medical",
  "medication",
  "therapy_safety",
  "consent_logistics",
  "signature",
] as const;

export type ConsultationStepKey = (typeof CONSULTATION_STEP_KEYS)[number];

export type ConsultationFieldType = "text" | "textarea" | "date" | "select" | "checkbox-group" | "radio" | "boolean-checkboxes";

export type ConsultationFieldOption = {
  value: string;
  label: string;
};

export type ConsultationField = {
  key: string;
  label: string;
  type: ConsultationFieldType;
  required?: boolean;
  placeholder?: string;
  options?: ConsultationFieldOption[];
  allowOther?: boolean;
  otherKey?: string;
  hint?: string;
};

export type ConsultationStep = {
  key: ConsultationStepKey;
  title: string;
  description: string;
  fields: ConsultationField[];
};

export const CONSULTATION_BLANK_PDF_PATH = "/api/portal/consultation/blank/";

export const CONSULTATION_STEPS: ConsultationStep[] = [
  {
    key: "personal",
    title: "Personal information",
    description: "Basic details so Gerald can prepare for your consultation.",
    fields: [
      { key: "todays_date", label: "Today's date", type: "date", required: true },
      { key: "full_name", label: "Full name", type: "text", required: true },
      { key: "id_passport", label: "ID / Passport number", type: "text", required: true },
      { key: "date_of_birth", label: "Date of birth", type: "date", required: true },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        required: true,
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
        allowOther: true,
        otherKey: "gender_other",
      },
      {
        key: "marital_status",
        label: "Marital status",
        type: "select",
        required: true,
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "divorced", label: "Divorced" },
          { value: "widowed", label: "Widowed" },
          { value: "partnered", label: "Partnered" },
        ],
      },
      { key: "occupation", label: "Occupation", type: "text", required: true },
      { key: "employer", label: "Employer (if applicable)", type: "text" },
    ],
  },
  {
    key: "contact",
    title: "Contact & emergency",
    description: "How Gerald can reach you, and who to contact in an emergency.",
    fields: [
      { key: "physical_address", label: "Physical address", type: "textarea", required: true },
      { key: "postal_code", label: "Postal code", type: "text", required: true },
      { key: "mobile_number", label: "Mobile number", type: "text", required: true },
      { key: "email", label: "Email address", type: "text", required: true },
      {
        key: "preferred_contact",
        label: "Preferred method of contact",
        type: "select",
        required: true,
        options: [
          { value: "phone", label: "Phone" },
          { value: "whatsapp", label: "WhatsApp" },
          { value: "email", label: "Email" },
        ],
      },
      { key: "emergency_name", label: "Emergency contact name", type: "text", required: true },
      { key: "emergency_relationship", label: "Relationship", type: "text", required: true },
      { key: "emergency_phone", label: "Emergency contact number", type: "text", required: true },
    ],
  },
  {
    key: "reasons",
    title: "Reason for consultation",
    description: "What brings you to hypnotherapy at this time.",
    fields: [
      {
        key: "reasons",
        label: "Reason for consultation (select all that apply)",
        type: "checkbox-group",
        required: true,
        allowOther: true,
        otherKey: "reasons_other",
        options: [
          { value: "anxiety_stress", label: "Anxiety / Stress" },
          { value: "depression_low_mood", label: "Depression / Low Mood" },
          { value: "trauma_ptsd", label: "Trauma / PTSD" },
          { value: "relationship", label: "Relationship Difficulties" },
          { value: "grief_loss", label: "Grief / Loss" },
          { value: "self_esteem", label: "Self-Esteem / Confidence" },
          { value: "habits", label: "Habits (e.g. smoking, nail-biting)" },
          { value: "addictive_behaviours", label: "Addictive Behaviours" },
          { value: "weight_eating", label: "Weight / Eating Issues" },
          { value: "sleep", label: "Sleep Problems / Insomnia" },
          { value: "chronic_pain", label: "Chronic Pain / Psychosomatic Symptoms" },
          { value: "phobias", label: "Phobias / Fears" },
          { value: "spiritual", label: "Spiritual / Existential Concerns" },
          { value: "personal_development", label: "Personal Development / Performance" },
        ],
      },
      {
        key: "presenting_issue",
        label: "Please describe the main concern that brings you to hypnotherapy",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    key: "medical",
    title: "Medical & mental health history",
    description: "This helps Gerald work safely and appropriately with you.",
    fields: [
      {
        key: "diagnoses",
        label: "Have you ever been diagnosed with any of the following?",
        type: "checkbox-group",
        required: true,
        options: [
          { value: "anxiety_disorder", label: "Anxiety Disorder" },
          { value: "depression", label: "Depression" },
          { value: "bipolar", label: "Bipolar Disorder" },
          { value: "schizophrenia_psychosis", label: "Schizophrenia / Psychosis" },
          { value: "epilepsy_seizures", label: "Epilepsy / Seizures" },
          { value: "heart_condition", label: "Heart Condition" },
          { value: "diabetes", label: "Diabetes" },
          { value: "chronic_illness", label: "Chronic Illness" },
          { value: "none", label: "None of the above" },
        ],
      },
      { key: "diagnosis_details", label: "If yes, please provide details", type: "textarea" },
    ],
  },
  {
    key: "medication",
    title: "Medication & substance use",
    description: "Share anything that may affect session safety or focus.",
    fields: [
      {
        key: "taking_medication",
        label: "Are you currently taking any medication?",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        key: "medication_list",
        label: "If yes, please list (including psychiatric medication)",
        type: "textarea",
      },
      {
        key: "alcohol_use",
        label: "Alcohol use",
        type: "radio",
        required: true,
        options: [
          { value: "none", label: "None" },
          { value: "occasional", label: "Occasional" },
          { value: "moderate", label: "Moderate" },
          { value: "heavy", label: "Heavy" },
        ],
      },
      {
        key: "recreational_drug_use",
        label: "Recreational drug use",
        type: "radio",
        required: true,
        options: [
          { value: "none", label: "None" },
          { value: "past", label: "Past" },
          { value: "current", label: "Current" },
        ],
      },
      { key: "substance_details", label: "Details (if applicable)", type: "textarea" },
    ],
  },
  {
    key: "therapy_safety",
    title: "Therapy history & safety",
    description: "Previous support experience and a brief safety screen.",
    fields: [
      {
        key: "therapy_before",
        label: "Have you received therapy or counselling before?",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        key: "hypnotherapy_before",
        label: "Have you experienced hypnotherapy before?",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        key: "therapy_experience",
        label: "If yes, please describe your experience",
        type: "textarea",
      },
      {
        key: "safety_screen",
        label: "Trauma & safety screening (select all that apply)",
        type: "checkbox-group",
        required: true,
        hint: "If you select any of the first three, this will be discussed sensitively and professionally.",
        options: [
          { value: "trauma_relevant", label: "I have experienced trauma that may be relevant to this work" },
          { value: "self_harm_past", label: "I have had thoughts of self-harm in the past" },
          { value: "suicidal_thoughts_current", label: "I am currently experiencing suicidal thoughts" },
          { value: "none", label: "None of the above" },
        ],
      },
      {
        key: "suitability",
        label: "Suitability & contraindications (tick all that apply)",
        type: "checkbox-group",
        required: true,
        options: [
          {
            value: "not_medical_substitute",
            label: "I understand that hypnotherapy is not a substitute for medical care",
          },
          {
            value: "not_under_influence",
            label: "I am not under the influence of drugs or alcohol during sessions",
          },
          {
            value: "no_active_psychosis",
            label: "I do not suffer from active psychosis unless cleared by a medical professional",
          },
        ],
      },
    ],
  },
  {
    key: "consent_logistics",
    title: "Consent & session logistics",
    description: "Confirm understanding, POPIA consent, and practical preferences.",
    fields: [
      {
        key: "informed_consent",
        label: "Informed consent (tick each box to confirm)",
        type: "checkbox-group",
        required: true,
        options: [
          { value: "understand_process", label: "I understand hypnotherapy and the nature of the process" },
          { value: "no_guarantee", label: "I understand that results cannot be guaranteed" },
          { value: "may_stop", label: "I understand I may stop a session at any time" },
          { value: "voluntary", label: "I consent to participate voluntarily in hypnotherapy" },
          {
            value: "confidentiality_limits",
            label: "I understand confidentiality and its legal limits (risk of harm, legal obligation)",
          },
        ],
      },
      {
        key: "popia_consent",
        label: "Confidentiality & POPIA compliance",
        type: "checkbox-group",
        required: true,
        options: [
          {
            value: "popia_collection",
            label:
              "I consent to the collection, storage, and protection of my personal information in accordance with the Protection of Personal Information Act (POPIA)",
          },
          {
            value: "not_shared",
            label:
              "I understand my information will not be shared without my written consent, except where legally required",
          },
        ],
      },
      {
        key: "session_type",
        label: "Preferred session type",
        type: "checkbox-group",
        required: true,
        options: [
          { value: "in_person", label: "In-person" },
          { value: "online", label: "Online" },
        ],
      },
      {
        key: "availability",
        label: "Availability",
        type: "checkbox-group",
        required: true,
        options: [
          { value: "weekdays", label: "Weekdays" },
          { value: "evenings", label: "Evenings" },
          { value: "weekends", label: "Weekends" },
        ],
      },
      {
        key: "payment_method",
        label: "Payment method",
        type: "select",
        required: true,
        options: [
          { value: "cash", label: "Cash" },
          { value: "eft", label: "EFT" },
          { value: "other", label: "Other" },
        ],
        allowOther: true,
        otherKey: "payment_method_other",
      },
    ],
  },
  {
    key: "signature",
    title: "Declaration & signature",
    description: "Confirm the information is accurate and sign electronically.",
    fields: [
      {
        key: "declaration_confirmed",
        label: "I confirm that the information provided above is true and accurate to the best of my knowledge.",
        type: "radio",
        required: true,
        options: [{ value: "yes", label: "I confirm" }],
      },
      { key: "signature_name", label: "Full name (electronic signature)", type: "text", required: true },
      { key: "signature_date", label: "Date", type: "date", required: true },
    ],
  },
];

export function getConsultationStep(key: string): ConsultationStep | undefined {
  return CONSULTATION_STEPS.find((step) => step.key === key);
}

export function getConsultationStepIndex(key: string) {
  return CONSULTATION_STEP_KEYS.indexOf(key as ConsultationStepKey);
}

export function isConsultationCompleteStatus(status: string) {
  return status === "completed" || status === "uploaded";
}

export function consultationHasSafetyFlags(responses: Record<string, unknown>) {
  const safety = responses.safety_screen;
  if (!Array.isArray(safety)) return false;
  return safety.some(
    (value) => value === "trauma_relevant" || value === "self_harm_past" || value === "suicidal_thoughts_current",
  );
}

export function consultationHasUrgentSafetyFlag(responses: Record<string, unknown>) {
  const safety = responses.safety_screen;
  if (!Array.isArray(safety)) return false;
  return safety.includes("suicidal_thoughts_current");
}

function isFieldFilled(field: ConsultationField, responses: Record<string, unknown>) {
  const value = responses[field.key];

  if (field.type === "checkbox-group") {
    if (!Array.isArray(value) || value.length === 0) return false;
    if (field.allowOther && field.otherKey && value.includes("other")) {
      return Boolean(String(responses[field.otherKey] ?? "").trim());
    }
    return true;
  }

  if (field.allowOther && field.otherKey && value === "other") {
    return Boolean(String(responses[field.otherKey] ?? "").trim());
  }

  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  return value != null && String(value).trim().length > 0;
}

export function getRequiredFieldsForStep(step: ConsultationStep) {
  return step.fields.filter((field) => field.required);
}

export function isStepComplete(step: ConsultationStep, responses: Record<string, unknown>) {
  return getRequiredFieldsForStep(step).every((field) => isFieldFilled(field, responses));
}

export function computeConsultationPercent(responses: Record<string, unknown>) {
  const requiredFields = CONSULTATION_STEPS.flatMap((step) => getRequiredFieldsForStep(step));
  if (!requiredFields.length) return 0;
  const filled = requiredFields.filter((field) => isFieldFilled(field, responses)).length;
  return Math.round((filled / requiredFields.length) * 100);
}

export function validateStepResponses(step: ConsultationStep, responses: Record<string, unknown>) {
  const missing = getRequiredFieldsForStep(step).filter((field) => !isFieldFilled(field, responses));
  return missing.map((field) => field.key);
}

export const consultationStatusLabels: Record<string, string> = {
  not_sent: "Not sent",
  sent: "Sent",
  delivered: "Delivered",
  opened: "Opened",
  started: "Started",
  in_progress: "In progress",
  completed: "Completed",
  uploaded: "Uploaded",
};
