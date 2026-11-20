import Link from "next/link";
import { getSiteContactDetails } from "@/lib/site-config";

const SLOGAN = "L’héritage des écrits, la transmission du savoir.";

const linkClassName =
  "site-footer-link w-fit text-sm text-[#D4DCE7] transition-colors duration-200 hover:text-[#E3C58E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E3C58E]";
const headingClassName =
  "site-footer-heading text-xs font-semibold uppercase tracking-[0.2em] text-[#E3C58E]";

export default function Footer() {
  const { email, phone, address, whatsappUrl, socialLinks } =
    getSiteContactDetails();

  return (
    <footer className="site-footer relative mt-auto overflow-hidden bg-[#0B172A] text-[#F5F1E8]">
      <div
        aria-hidden="true"
        className="site-footer-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(213,189,145,0.1),transparent_32%),radial-gradient(ellipse_at_88%_8%,rgba(43,77,116,0.28),transparent_34%)]"
      />
      <div className="relative h-px bg-gradient-to-r from-transparent via-[#D5BD91]/70 to-transparent" />

      <div className="site-footer-content relative mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16">
        <div className="grid gap-11 border-b border-white/10 pb-11 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr_0.8fr] lg:gap-12">
          <div>
            <Link
              href="/"
              aria-label="KËR KHADIM — Accueil"
              className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E3C58E]"
            >
              <span className="site-footer-brand-mark flex size-12 items-center justify-center rounded-full border border-[#D5BD91]/55 bg-[#D5BD91]/5 font-serif text-base font-semibold tracking-wide text-[#E3C58E] transition-colors group-hover:bg-[#D5BD91]/10">
                KK
              </span>
              <span>
                <span className="site-footer-brand-title block font-serif text-xl font-semibold tracking-[0.12em] text-[#F5F1E8] sm:text-2xl">
                  KËR KHADIM
                </span>
                <span className="site-footer-muted mt-1 block text-[9px] font-medium uppercase tracking-[0.18em] text-[#B7C1CE]">
                  Savoir &amp; transmission
                </span>
              </span>
            </Link>

            <p className="site-footer-description mt-6 max-w-sm text-sm leading-7 text-[#C5CED9]">
              Une bibliothèque dédiée aux écrits de Serigne Touba, à la lecture
              et au partage du savoir.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-6">
                <h2 className={headingClassName}>Suivez-nous</h2>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {socialLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={linkClassName}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <nav aria-label="Navigation de pied de page">
            <h2 className={headingClassName}>Explorer</h2>
            <ul className="mt-5 flex flex-col items-start gap-3.5">
              <li>
                <Link href="/" className={linkClassName}>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/xassidas" className={linkClassName}>
                  Xassidas
                </Link>
              </li>
              <li>
                <Link href="/accessoires" className={linkClassName}>
                  Accessoires
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className={linkClassName}>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contacter" className={linkClassName}>
                  Contacter
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className={headingClassName}>Nous contacter</h2>
            <address className="mt-5 space-y-4 not-italic">
              {address && (
                <div>
                  <span className="site-footer-label mb-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#91A0B2]">
                    Adresse
                  </span>
                  <span className="site-footer-contact-value text-sm text-[#D4DCE7]">{address}</span>
                </div>
              )}
              {email && (
                <div>
                  <span className="site-footer-label mb-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#91A0B2]">
                    E-mail
                  </span>
                  <a href={`mailto:${email}`} className={linkClassName}>
                    {email}
                  </a>
                </div>
              )}
              {phone && (
                <div>
                  <span className="site-footer-label mb-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#91A0B2]">
                    Téléphone
                  </span>
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className={linkClassName}
                  >
                    {phone}
                  </a>
                </div>
              )}
              {!email && !phone && !address && (
                <p className="site-footer-muted text-sm leading-6 text-[#AEB7C4]">
                  Nos coordonnées seront bientôt disponibles.
                </p>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="site-footer-whatsapp mt-1 inline-flex min-h-10 items-center rounded-full border border-[#D5BD91]/50 px-4 text-xs font-semibold text-[#F1D7A7] transition-colors hover:border-[#E3C58E] hover:bg-[#D5BD91]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E3C58E]"
                >
                  Écrire sur WhatsApp
                </a>
              )}
            </address>
          </div>

          <div>
            <h2 className={headingClassName}>Mon espace</h2>
            <ul className="mt-5 flex flex-col items-start gap-3.5">
              <li>
                <Link href="/compte" className={linkClassName}>
                  Mon compte
                </Link>
              </li>
              <li>
                <Link href="/panier" className={linkClassName}>
                  Mon panier
                </Link>
              </li>
              <li>
                <Link
                  href="/admin-login"
                  className="site-footer-muted w-fit text-sm text-[#AEB7C4] transition-colors duration-200 hover:text-[#E3C58E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E3C58E]"
                >
                  Administration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-legal flex flex-col gap-3 pt-5 text-xs leading-5 text-[#AEB7C4] sm:flex-row sm:items-center sm:justify-between">
          <p>© KËR KHADIM. Tous droits réservés.</p>
          <p className="site-footer-slogan text-[#C5CED9]">{SLOGAN}</p>
        </div>
      </div>
    </footer>
  );
}
