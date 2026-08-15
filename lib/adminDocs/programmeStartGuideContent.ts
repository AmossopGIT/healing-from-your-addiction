import { siteConfig } from "@/lib/constants";

const siteRoot = siteConfig.siteUrl.replace(/\/$/, "");

export const programmeStartGuideContent = {
  title: "After invite: start the course",
  description:
    "Week 1 launch steps after a client is invited — assign the interactive programme, release receipts and guides, and confirm the live slot.",
  category: "Operations" as const,
  intro:
    "Invite creates portal access. It does not start the 8-week course. Use this guide once intake and consultation are ready, so the client sees one clear “This week” loop instead of a waiting room.",
  docPath: "/admin/docs/after-invite-start-the-course/",
  docUrl: `${siteRoot}/admin/docs/after-invite-start-the-course/`,
  clientProgrammePath: "/admin/clients/[id]/programme/",
  clientProgrammeUrl: `${siteRoot}/admin/clients/example/programme/`,
  portalProgrammeUrl: `${siteRoot}/portal/programme/`,
  relatedOnboardingPath: "/admin/docs/lead-to-client-onboarding-flow/",
  facts: [
    {
      label: "Invite ≠ programme",
      value:
        "Accept & invite sets addiction focus and portal login only. You still assign the interactive programme on the client Programme page.",
    },
    {
      label: "Prefer interactive assign",
      value:
        "Interactive assign snapshots journey content, unlocks sessions 1–2, and creates session receipts so the client next-step can fire. Legacy assign is for repairs only.",
    },
    {
      label: "Same sentence both sides",
      value:
        "The Week 1 checklist shows the next-step sentence the client sees on portal home and programme (“This week”).",
    },
    {
      label: "Guides are gambling-first",
      value:
        "Week guides exist for the gambling pack today. Other slugs still run journey + live sessions without released guides.",
    },
  ],
  steps: [
    {
      id: "open-programme",
      title: "Open the client Programme page",
      body: "From the client profile, use Assign programme (or Programme). Confirm intake and consultation are complete before you assign. The Week 1 launch checklist sits at the top of the Programme page.",
      callout: "Do not leave “Programme assigned” outstanding on the operational checklist after you agree they are ready for week 1.",
      screenCaption: "Client programme page with Week 1 launch checklist and client next-step preview.",
    },
    {
      id: "assign",
      title: "Assign the interactive programme",
      body: "Choose the template that matches the client’s addiction focus (preselected when focus is set). Submit Assign interactive programme. This unlocks journey activity 1 and live sessions 1–2 with receipts.",
      callout: "Avoid Legacy assign unless you are repairing an older enrollment — it creates a different course start.",
      screenCaption: "Assign interactive programme form with focus-matched template preselected.",
    },
    {
      id: "release",
      title: "Release week 1 materials",
      body: "Confirm sessions 1–2 show as available. For gambling clients, release the week 1 guide so programme docs are not empty. Check that the client next-step preview mentions journey or a new session.",
      callout: "If receipts are missing, the client may not see “New session ready” even though sessions look unlocked to you.",
      screenCaption: "Doc release and session unlock controls on the admin programme console.",
    },
    {
      id: "schedule",
      title: "Confirm the live session slot",
      body: "The client can pick Tuesday/Friday 11:00 or 16:00, or you can set the slot for them. Journey work can start without a slot; live session dates need the schedule.",
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
  ],
};
