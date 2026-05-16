import { SiteLink } from "@/components/SiteLink";
import { siteConfig, standardDisclaimer } from "@/lib/constants";
import { TrackedLink } from "@/components/TrackedLink";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer-wrap">
      <div className="site-footer">
        <div className="container footer-grid">
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-row">
              <span className="footer-mark" aria-hidden="true">HFYA</span>
              <p className="footer-brand">Healing From Your Addiction</p>
            </div>
            <p className="footer-tagline">
              {siteConfig.owner} provides confidential hypnotherapy, EFT and pattern-focused addiction support in South Africa.
            </p>
            <p className="footer-resource-link">
              <SiteLink href="/blog/">Recovery blog &amp; articles</SiteLink>
            </p>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">Programmes</h2>
            <ul className="footer-links">
              <li><SiteLink href="/gambling-addiction-help/">Gambling Addiction</SiteLink></li>
              <li><SiteLink href="/food-addiction-binge-eating-help/">Food Addiction / Binge Eating</SiteLink></li>
              <li><SiteLink href="/addiction-healing-programmes/">All Programmes</SiteLink></li>
            </ul>
          </div>

          <div className="footer-col footer-col-contact">
            <h2 className="footer-heading">Contact</h2>
            <div className="footer-chips">
              <TrackedLink
                href="/contact/"
                className="footer-chip"
                tracking={{ ctaName: "need_help", linkLocation: "footer" }}
              >
                Need help?
              </TrackedLink>
              <SiteLink className="footer-chip" href="/contact/">
                Confidential enquiry form
              </SiteLink>
            </div>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">Approach</h2>
            <ul className="footer-bullets">
              <li>Confidential, judgement-free sessions</li>
              <li>Hypnotherapy &amp; EFT-based support</li>
              <li>Online or in-person, South Africa</li>
            </ul>
          </div>
        </div>

        <div className="container footer-disclaimer">
          <p>{standardDisclaimer}</p>
          <p className="footer-meta">&copy; {currentYear} {siteConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
