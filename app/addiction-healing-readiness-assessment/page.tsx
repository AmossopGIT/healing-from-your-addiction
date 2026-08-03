import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { ReadinessAssessmentWizard } from "@/components/assessment/ReadinessAssessmentWizard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import type { FAQ } from "@/content/types";
import type { ReadinessResponses } from "@/content/readinessAssessment";
import { seoPages } from "@/content/seo";
import { getClientReadinessAssessment, getClientReadinessAssessmentHistory } from "@/lib/dashboard/queries";
import { ensureMinimalClientProfileAction } from "@/lib/dashboard/readinessAssessmentActions";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { breadcrumbSchema, faqSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const pageSeo = seoPages.readinessAssessment;
const heroArt = artGalleryById.get("process-understand");
const commitmentArt = artGalleryById.get("process-integration");
const awarenessArt = artGalleryById.get("approach-subconscious");
const emotionArt = artGalleryById.get("approach-emotional");

export const metadata = createPageMetadata(pageSeo);

const readinessFaqs: FAQ[] = [
  {
    question: "What is the Addiction Healing Readiness Assessment?",
    answer:
      "It is a reflective conversation tool about Commitment, Self-Awareness, and Emotional Capacity — not an admission test, diagnosis, or crisis service.",
  },
  {
    question: "Where can I take the assessment?",
    answer:
      "You can take it on this public page or inside your client portal under Readiness. If you are already signed in, results save straight to your profile.",
  },
  {
    question: "Do I need an account to see my results?",
    answer:
      "If you are not signed in yet, you can complete the questions first, then create a free private portal account or sign in. If you are already logged in as a client, results save and show immediately.",
  },
  {
    question: "Does a lower score mean I have failed?",
    answer:
      "No. A lower score simply suggests that area may need support first before intensive addiction pattern work.",
  },
];

export default async function ReadinessAssessmentPage() {
  const profile = await getAuthProfile();
  const isAuthenticatedClient = profile?.role === "client";

  if (isAuthenticatedClient) {
    await ensureMinimalClientProfileAction();
  }

  const clientProfile = isAuthenticatedClient && profile ? await getClientProfileForUser(profile.id) : null;
  const assessment = clientProfile ? await getClientReadinessAssessment(clientProfile.id) : null;
  const history = clientProfile ? await getClientReadinessAssessmentHistory(clientProfile.id) : [];
  const initialResponses = (assessment?.responses ?? {}) as ReadinessResponses;
  const hasCompleted = Boolean(assessment?.completed_at);
  const hasInProgress = Boolean(assessment && !assessment.completed_at && Object.keys(initialResponses).length > 0);

  return (
    <>
      <SchemaMarkup
        data={[
          professionalServiceSchema(),
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Programs", path: "/programs/" },
            { name: "Readiness assessment", path: pageSeo.path },
          ]),
          faqSchema(readinessFaqs),
        ]}
      />

      <section className="need-help-hero page-hero-flush section-band">
        <div className="container need-help-hero-grid">
          {heroArt ? (
            <WatercolorArtwork
              item={heroArt}
              className="need-help-hero-art hero-visual"
              priority
              sizes="(min-width: 900px) 28vw, 92vw"
            />
          ) : null}
          <div className="need-help-hero-copy">
            <p className="eyebrow">Gerald Crawford · Stellenbosch</p>
            <h1>Am I ready to heal from my addiction?</h1>
            <p className="lead">
              Before intensive support, reflect on Commitment, Self-Awareness, and Emotional Capacity — not only the
              addiction itself.
            </p>
            <div className="readiness-hero-actions">
              <a href="#readiness-assessment" className="button button-primary">
                {hasCompleted
                  ? "View or retake assessment"
                  : hasInProgress
                    ? "Continue assessment"
                    : "Start free assessment"}
              </a>
              {isAuthenticatedClient ? (
                <Link href="/portal/readiness/" className="button button-secondary">
                  Open in client portal
                </Link>
              ) : (
                <TrackedLink
                  href="/need-help/"
                  className="button button-secondary"
                  tracking={{ eventName: "cta_click", ctaName: "readiness_hero_enquiry", linkLocation: "readiness_hero" }}
                >
                  Prefer a conversation
                </TrackedLink>
              )}
            </div>
            <p className="need-help-hero-note">
              {isAuthenticatedClient
                ? "You are signed in — take it here or in your portal; results save to your profile."
                : "About 8–12 minutes · free · take as a guest, then sign in to save and see results"}
            </p>
          </div>
        </div>
      </section>

      <section className="section readiness-foundations-strip" aria-label="Three foundations">
        <div className="container">
          <p className="readiness-formula-line">
            Readiness ≈ <strong>Commitment × Awareness × Emotional Capacity</strong>
          </p>
          <div className="readiness-foundation-pills">
            <p>
              <strong>Commitment</strong>
              <span>Choosing recovery because you want it</span>
            </p>
            <p>
              <strong>Self-Awareness</strong>
              <span>Naming triggers, emotions, and purpose</span>
            </p>
            <p>
              <strong>Emotional Capacity</strong>
              <span>Willing to feel discomfort without escaping</span>
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="readiness-wizard-heading">
        <div className="container narrow">
          <h2 id="readiness-wizard-heading" className="visually-hidden">
            Free Addiction Healing Readiness Assessment
          </h2>
          <ReadinessAssessmentWizard
            isAuthenticatedClient={isAuthenticatedClient}
            mode="public"
            initialResponses={initialResponses}
            initialCompleted={hasCompleted}
            history={history.map((item) => ({
              id: item.id,
              completed_at: item.completed_at,
              readiness_index: item.readiness_index,
              readiness_band: item.readiness_band,
              attempt_number: item.attempt_number,
            }))}
          />
        </div>
      </section>

      <section className="section section-band">
        <div className="container card-grid readiness-foundation-cards">
          <article className="info-card">
            {commitmentArt ? <WatercolorArtwork item={commitmentArt} sizes="(min-width: 900px) 30vw, 92vw" /> : null}
            <h3>Commitment</h3>
            <p>
              Commitment means choosing recovery because you genuinely want it, and staying with the work even when
              cravings and lifestyle change feel difficult.
            </p>
          </article>
          <article className="info-card">
            {awarenessArt ? <WatercolorArtwork item={awarenessArt} sizes="(min-width: 900px) 30vw, 92vw" /> : null}
            <h3>Self-Awareness</h3>
            <p>Self-awareness helps name triggers, avoided emotions, and the purpose an addiction has been serving.</p>
          </article>
          <article className="info-card">
            {emotionArt ? <WatercolorArtwork item={emotionArt} sizes="(min-width: 900px) 30vw, 92vw" /> : null}
            <h3>Emotional Capacity</h3>
            <p>Emotional capacity is the willingness to experience discomfort without escaping into the addiction.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container narrow prose-block">
          <h2>When do these foundations feel stronger?</h2>
          <p>Support often has a clearer starting point when someone can honestly say:</p>
          <ul>
            <li>I have chosen recovery because I truly want it.</li>
            <li>I understand the emotional and psychological reasons behind my addiction.</li>
            <li>I am willing to feel uncomfortable emotions instead of escaping from them.</li>
          </ul>
          <p>
            When these conditions are developing, treatment may have a stronger foundation. The work ahead can still be
            challenging, and this assessment remains reflective guidance rather than a guarantee.
          </p>
          <p>
            Already have a portal account? <Link href="/portal/readiness/">Open your saved assessment in the portal</Link>{" "}
            or <Link href="/programs/">explore healing programmes</Link>.
          </p>
        </div>
      </section>

      <Disclaimer />
    </>
  );
}
