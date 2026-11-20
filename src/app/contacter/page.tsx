import ContactForm from "@/components/ContactForm";
import Navbar from "@/components/Navbar";
import { getSiteContactDetails } from "@/lib/site-config";

export default function ContactPage() {
  const { email, phone, address, whatsappUrl } = getSiteContactDetails();

  return (
    <main className="min-h-screen bg-[#FFFEFA] text-[#101D35]">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#8A6A39]">
            Nos coordonnées
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold">
            Parlons ensemble
          </h2>
          <p className="mt-5 leading-8 text-gray-600">
            Pour toute demande concernant les ouvrages, les commandes ou le
            fonctionnement de KËR KHADIM, vous pouvez nous écrire ou nous
            appeler.
          </p>

          <div className="mt-10 space-y-6">
            {email && (
              <div className="flex gap-4">
                <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5E6C8] text-xl">
                  ✉
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a href={`mailto:${email}`} className="mt-1 block text-sm text-[#8A6A39] hover:underline">
                    {email}
                  </a>
                </div>
              </div>
            )}

            {phone && (
              <div className="flex gap-4">
                <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5E6C8] text-xl">
                  ☎
                </div>
                <div>
                  <h3 className="font-semibold">Téléphone</h3>
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mt-1 block text-sm text-[#8A6A39] hover:underline">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {address && (
              <div className="flex gap-4">
                <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5E6C8] text-[#8A6A39]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Adresse</h3>
                  <p className="mt-1 text-sm text-gray-600">{address}</p>
                </div>
              </div>
            )}

            {whatsappUrl && (
              <div className="flex gap-4">
                <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5E6C8] text-xl">
                  ◉
                </div>
                <div>
                  <h3 className="font-semibold">WhatsApp</h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex rounded-full bg-[#15803D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D]"
                  >
                    Ouvrir WhatsApp
                  </a>
                </div>
              </div>
            )}

            {!email && !phone && !address && !whatsappUrl && (
              <p className="rounded-xl border border-[#EAE2D5] bg-white p-4 text-sm leading-6 text-gray-600">
                Nos coordonnées directes ne sont pas encore configurées. Vous
                pouvez nous envoyer un message avec le formulaire.
              </p>
            )}

            <div className="flex gap-4">
              <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5E6C8] text-xl">
                ◈
              </div>
              <div>
                <h3 className="font-semibold">Disponibilité</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Écrivez-nous à tout moment ; nous vous répondrons dès que
                  possible.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-serif text-2xl font-bold">
            Envoyez-nous un message
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Nous vous répondrons à l&apos;adresse e-mail indiquée.
          </p>
          <ContactForm />
        </div>
      </section>

    </main>
  );
}
