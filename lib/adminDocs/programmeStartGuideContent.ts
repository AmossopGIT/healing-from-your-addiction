import { siteConfig } from "@/lib/constants";

const siteRoot = siteConfig.siteUrl.replace(/\/$/, "");

export const programmeStartGuideContent = {
  title: "After invite: start the course",
  description:
    "Week 1 launch steps after a client is invited — assign the interactive programme, release receipts and guides, and confirm the live slot.",
  category: "Operations" as const,
  intro:
    "Invite creates portal login — it does not start the 8-week course. Use this guide once intake and consultation are ready, so the client sees one clear “This week” loop on portal home instead of a waiting room.",
  docPath: "/admin/docs/after-invite-start-the-course/",
  docUrl: `${siteRoot}/admin/docs/after-invite-start-the-course/`,
  clientProgrammePath: "/admin/clients/[id]/programme/",
  clientProgrammeUrl: `${siteRoot}/admin/clients/example/programme/`,
  portalProgrammeUrl: `${siteRoot}/portal/programme/`,
  relatedOnboardingPath: "/admin/docs/lead-to-client-onboarding-flow/",
  relatedTriagePath: "/admin/docs/lead-triage-playbook/",
  journeyMap: [
    { stage: "Lead triage", detail: "Respond within SLA, move status, invite when qualified", doc: "/admin/docs/lead-triage-playbook/" },
    { stage: "Invite + intake", detail: "Portal access, addiction focus, pre-programme questions", doc: "/admin/docs/lead-to-client-onboarding-flow/" },
    { stage: "Consultation", detail: "Clinical conversation before structured course work", doc: null },
    { stage: "Week 1 launch (this guide)", detail: "Assign programme, release materials, confirm live slot", doc: "/admin/docs/after-invite-start-the-course/" },
    { stage: "Client sees This week", detail: "One next step on portal home and programme", doc: null },
  ],
  facts: [
    {
      label: "Invite ≠ programme",
      value:
        "Accept & invite sets addiction focus and portal login only. You still assign the interactive programme on Admin → Clients → [client] → Programme.",
    },
    {
      label: "Prerequisites",
      value: "Intake submitted and consultation complete before assign. The Week 1 checklist on the Programme page tracks this.",
    },
    {
      label: "Prefer interactive assign",
      value:
        "Interactive assign snapshots journey content, unlocks sessions 1–2, and creates session receipts so the client next-step can fire. Legacy assign is for repairs only.",
    },
    {
      label: "Same sentence both sides",
      value:
        "The “What the client sees next” panel on the Programme page should match portal home and programme — one clear CTA for the week.",
    },
  ],
  steps: [
    {
      id: "open-programme",
      title: "Open the client Programme page",
      body: "From Admin → Clients, open the client profile, then Programme (or Assign programme). The Week 1 launch checklist sits at the top — work it in order. Confirm intake and consultation show Done before you assign.",
      callout: "Do not leave “Programme assigned” outstanding on the checklist once you agree they are ready for week 1.",
      screenCaption: "Programme page with Week 1 checklist and client next-step preview.",
    },
    {
      id: "assign",
      title: "Assign the interactive programme",
      body: "Choose the template that matches the client’s addiction focus (preselected when focus is set). Submit Assign interactive programme. This unlocks journey activity 1 and live sessions 1–2 with receipts the client needs for “New session ready”.",
      callout: "Avoid Legacy assign unless repairing an older enrollment — it creates a different course start.",
      screenCaption: "Assign interactive programme form with focus-matched template preselected.",
    },
    {
      id: "release",
      title: "Release week 1 materials",
      body: "Confirm sessions 1–2 show Available with receipts sent. For gambling clients, release the week 1 guide so programme docs are not empty. Check that the client next-step preview mentions journey or a new session — not “programme coming soon”.",
      callout: "If receipts are missing, the client may not see “New session ready” even though sessions look unlocked to you.",
      screenCaption: "Session unlock status and guide release controls.",
    },
    {
      id: "schedule",
      title: "Confirm the live session slot",
      body: "The client can pick Tuesday/Friday 11:00 or 16:00, or you can set the slot for them on the Programme page. Journey work can start without a slot; live session dates need the schedule confirmed.",
      callout: "Tick the schedule item on the Week 1 checklist before you treat week 1 as fully launched.",
      screenCaption: "Schedule panel with Tuesday/Friday slot options.",
    },
  ],
  checklist: [
    "Intake submitted and reviewed",
    "Consultation complete",
    "Interactive programme assigned (not legacy-only)",
    "Sessions 1–2 available with client receipts",
    "Week 1 guide released when gambling pack applies",
    "Live slot confirmed",
    "Client next-step sentence matches what they should do today",
  ],
  troubleshooting: [
    {
      title: "Client still sees “programme coming soon”",
      body: "Enrollment is missing. Assign the interactive programme from the client Programme page.",
    },
    {
      title: "Home only pushes check-in after paperwork",
      body: "Confirm current_activity_id is set and the journey activity is not completed/skipped. Interactive assign should set the first activity.",
    },
    {
      title: "You skipped an activity and the journey stalled",
      body: "Admin skip now unlocks the next activity. If an older skip stalled the journey, unlock the next activity manually.",
    },
    {
      title: "Journey finished but live sessions remain",
      body: "Enrollment stays active until live sessions are also complete. Portal “This week” should still show remaining live sessions.",
    },
    {
      title: "Week 1 checklist stuck on one item",
      body: "Open the linked section from the checklist row (Assign, Sessions, Schedule, Guides). Refresh the page after saving.",
    },
  ],
  quickRoutes: [
    { label: "Clients list", path: "/admin/clients/" },
    { label: "Onboarding flow", path: "/admin/docs/lead-to-client-onboarding-flow/" },
    { label: "Lead triage playbook", path: "/admin/docs/lead-triage-playbook/" },
    { label: "Programme library", path: "/admin/programmes/" },
  ],
} as const;
