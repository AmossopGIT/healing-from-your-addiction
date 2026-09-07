import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import {
  healingPackages,
  healingPackagesPhilosophy,
  type HealingPackage,
} from "@/content/healingPackages";
import { seoPages } from "@/content/seo";
import { breadcrumbSchema, serviceSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.healingPackages;

function PackageSection({ pkg, index }: { pkg: HealingPackage; index: number }) {
  const artwork = artGalleryById.get(pkg.artId);

  return (
    <RevealArticle
      className={`healing-package healing-package-${pkg.tone}`}
      id={pkg.id}
      delay={Math.min(index * 0.04, 0.16)}
    >
      <div className="healing-package-header">
        <p className="eyebrow">Package {pkg.letter}</p>
        <h3>{pkg.name}</h3>
        <p className="healing-package-step">{pkg.stepVerb}</p>
      </div>

      {artwork ? (
        <WatercolorArtwork item={artwork} className="healing-package-art" sizes="(min-width: 900px) 28vw, 88vw" />
      ) : null}

      <p className="healing-package-ideal">
        <strong>Ideal for:</strong> {pkg.idealFor}
      </p>
      <p className="healing-package-diff">
        <strong>What makes this different:</strong> {pkg.differentiation}
      </p>

      <div className="healing-package-includes">
        <h4>Includes</h4>
        <ul>
          {pkg.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {pkg.extrasBeyondPrevious?.length ? (
        <div className="healing-package-extras">
          <h4>{pkg.extrasBeyondLabel ?? "Beyond the previous step"}</h4>
          <ul>
            {pkg.extrasBeyondPrevious.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className="healing-package-meta">
        <div>
          <dt>Duration</dt>
          <dd>{pkg.duration}</dd>
        </div>
        <div>
          <dt>Hypnotherapy</dt>
          <dd>{pkg.sessions}</dd>
        </div>
        <div>
          <dt>Investment</dt>
          <dd>
            {pkg.investment}
            {pkg.investmentNote ? <span className="healing-package-note">{pkg.investmentNote}</span> : null}
          </dd>
        </div>
      </dl>

      <TrackedLink
        href={pkg.ctaHref}
        className="button button-primary"
        tracking={{
          ctaName: pkg.ctaLabel,
          payload: {
            cta_location: "package_section",
            package_id: pkg.id,
            package_letter: pkg.letter,
            package_name: pkg.name,
          },
        }}
      >
        {pkg.ctaLabel}
      </TrackedLink>
    </RevealArticle>
  );
}

export function HealingPackagesPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          webPageSchema(pageSeo),
          serviceSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Programs", path: seoPages.programmes.path },
            { name: "Healing packages", path: pageSeo.path },
          ]),
        ]}
      />

      <Hero
        heroArtId="programme-overview"
        eyebrow="Healing From Your Addiction"
        title="A Progressive Path to Healing"
        description={healingPackagesPhilosophy}
        primaryCta="Start with an enquiry"
        primaryHref="#enquiry"
        secondaryCta="See the path"
        secondaryHref="#healing-path"
      />

      <section className="section" id="healing-path" aria-labelledby="healing-path-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">The path</p>
            <h2 id="healing-path-heading">Choose the level of support that fits</h2>
            <p>Begin where you are. Move deeper when you are ready. There is no single doorway into healing.</p>
          </div>

          <nav className="healing-path-nav" aria-label="Healing package path">
            <ol className="healing-path-list">
              {healingPackages.map((pkg, index) => (
                <li key={pkg.id}>
                  <RevealDiv delay={index * 0.05}>
                    <a href={`#${pkg.id}`} className={`healing-path-step healing-path-step-${pkg.tone}`}>
                      <span className="healing-path-letter">{pkg.letter}</span>
                      <span className="healing-path-verb">{pkg.stepVerb}</span>
                    </a>
                  </RevealDiv>
                  {index < healingPackages.length - 1 ? (
                    <span className="healing-path-arrow" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="healing-compare-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">At a glance</p>
            <h2 id="healing-compare-heading">Compare the five levels</h2>
            <p>Support level is the clearest way to tell Package C and Package D apart when session counts match.</p>
          </div>

          <div className="healing-compare-scroll">
            <table className="healing-compare-table">
              <caption>Healing package comparison: duration, hypnotherapy, support level and investment</caption>
              <thead>
                <tr>
                  <th scope="col">Path</th>
                  <th scope="col">Name</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Hypnotherapy</th>
                  <th scope="col">Support level</th>
                  <th scope="col">Investment</th>
                </tr>
              </thead>
              <tbody>
                {healingPackages.map((pkg) => (
                  <tr key={pkg.id} className={`healing-compare-row-${pkg.tone}`}>
                    <th scope="row">
                      <a href={`#${pkg.id}`}>
                        {pkg.letter} · {pkg.stepVerb}
                      </a>
                    </th>
                    <td>{pkg.name}</td>
                    <td>{pkg.duration}</td>
                    <td>{pkg.sessions}</td>
                    <td>
                      <strong>{pkg.supportLevel}</strong>
                    </td>
                    <td>
                      {pkg.investment}
                      {pkg.investmentNote ? <span className="healing-package-note">{pkg.investmentNote}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="healing-compare-stack" aria-hidden="false">
            {healingPackages.map((pkg) => (
              <article key={pkg.id} className={`healing-compare-card healing-package-${pkg.tone}`}>
                <p className="eyebrow">
                  Package {pkg.letter} · {pkg.stepVerb}
                </p>
                <h3>{pkg.name}</h3>
                <dl>
                  <div>
                    <dt>Duration</dt>
                    <dd>{pkg.duration}</dd>
                  </div>
                  <div>
                    <dt>Hypnotherapy</dt>
                    <dd>{pkg.sessions}</dd>
                  </div>
                  <div>
                    <dt>Support level</dt>
                    <dd>
                      <strong>{pkg.supportLevel}</strong>
                    </dd>
                  </div>
                  <div>
                    <dt>Investment</dt>
                    <dd>{pkg.investment}</dd>
                  </div>
                </dl>
                <a href={`#${pkg.id}`} className="text-link">
                  View package details
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="healing-packages-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Package details</p>
            <h2 id="healing-packages-heading">What each level includes</h2>
            <p>Every package uses the same structure so differences stay easy to scan.</p>
          </div>

          <div className="healing-packages-list">
            {healingPackages.map((pkg, index) => (
              <PackageSection key={pkg.id} pkg={pkg} index={index} />
            ))}
          </div>

          <p className="healing-packages-gentle">
            You can begin at the level you can afford. The enquiry is confidential and helps clarify which path fits —
            without pressure to start at the highest investment.
          </p>
        </div>
      </section>

      <CTASection
        title="Start where you are"
        body="Tell us what you are facing. We will help you understand which package — free tools, monthly support, comprehensive healing, or fast-track — may fit your situation."
        button="Start a confidential enquiry"
        href="#enquiry"
      />

      <section className="section" id="enquiry" aria-labelledby="packages-enquiry-heading">
        <div className="container split-grid">
          <div>
            <p className="eyebrow">Confidential enquiry</p>
            <h2 id="packages-enquiry-heading">Ask about the package that fits</h2>
            <p className="section-intro">
              Mention Foundation, Transformation, Complete Healing, Master Plan, or free resources if you already know
              which step you want. If you are unsure, start the enquiry and we will help you choose.
            </p>
          </div>
          <LeadForm
            formTitle="Enquire about a healing package"
            submitLabel="Send enquiry"
            compact
          />
        </div>
      </section>

      <Disclaimer />
    </>
  );
}
