import { SiteLink } from "@/components/SiteLink";
import { siteConfig, standardDisclaimer } from "@/lib/constants";
import { TrackedLink } from "@/components/TrackedLink";
import { withBasePath } from "@/lib/basePath";
import { FaFacebook, FaInstagram } from "react-icons/fa6";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer-wrap">
      <div className="site-footer">
        <div className="container footer-grid">
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-row">
              <span className="footer-mark" aria-hidden="true">
                <img className="footer-mark-image" src={withBasePath("/icon.png")} alt="" width={38} height={38} />
              </span>
              <p className="footer-brand">Healing From Your Addiction</p>
            </div>
            <p className="footer-tagline">
              {siteConfig.owner} provides confidential hypnotherapy, EFT and pattern-focused addiction support in South Africa.
            </p>
            <p className="footer-resource-link">
              <TrackedLink
                href="/blog/"
                className="footer-chip footer-resource-cta"
                tracking={{ ctaName: "resources_footer", linkLocation: "footer_left" }}
              >
                Resources &amp; articles
              </TrackedLink>
            </p>
            <div className="footer-chips" aria-label="Social media links">
              <TrackedLink
                href="https://www.facebook.com/profile.php?id=61590084852348"
                className="footer-chip footer-chip-social"
                target="_blank"
                rel="noopener noreferrer"
                tracking={{ ctaName: "facebook_footer", linkLocation: "footer_left" }}
              >
                <FaFacebook className="button-icon" aria-hidden="true" />
                <span>Facebook</span>
              </TrackedLink>
              <TrackedLink
                href="https://www.instagram.com/healingfromyouraddiction/"
                className="footer-chip footer-chip-social"
                target="_blank"
                rel="noopener noreferrer"
                tracking={{ ctaName: "instagram_footer", linkLocation: "footer_left" }}
              >
                <FaInstagram className="button-icon" aria-hidden="true" />
                <span>Instagram</span>
              </TrackedLink>
            </div>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">Addictions</h2>
            <ul className="footer-links">
              <li><SiteLink href="/addictions/gambling-addiction-help/">Gambling Addiction</SiteLink></li>
              <li><SiteLink href="/addictions/food-addiction-binge-eating-help/">Food Addiction / Binge Eating</SiteLink></li>
              <li><SiteLink href="/addictions/">All Addiction Support</SiteLink></li>
              <li><SiteLink href="/programs/">Programs</SiteLink></li>
            </ul>
          </div>

          <div className="footer-col footer-col-contact">
            <h2 className="footer-heading">Contact</h2>
            <div className="footer-chips">
              <TrackedLink
                href="/need-help/"
                className="footer-chip"
                tracking={{ ctaName: "need_help", linkLocation: "footer" }}
              >
                Need help?
              </TrackedLink>
              <SiteLink className="footer-chip" href="/need-help/">
                Confidential enquiry wizard
              </SiteLink>
            </div>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">Approach</h2>
            <ul className="footer-bullets">
              <li>Confidential, judgement-free sessions</li>
              <li>Hypnotherapy &amp; EFT-based support</li>
              <li>Online or in-person, South Africa</li>
              <li><SiteLink href="/about-the-therapist/">About Gerald</SiteLink></li>
              <li><SiteLink href="/testimonies/">Testimonies</SiteLink></li>
              <li><SiteLink href="/other-books-written-by-gerald-crawford/">Other books</SiteLink></li>
              <li><SiteLink href="/terms-and-conditions-of-use/">Terms of use</SiteLink></li>
              <li><SiteLink href="/medical-disclaimer/">Medical disclaimer</SiteLink></li>
              <li><SiteLink href="/privacy-policy/">Privacy policy</SiteLink></li>
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
