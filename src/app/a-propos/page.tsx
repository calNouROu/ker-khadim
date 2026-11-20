
import Navbar from "@/components/Navbar";

export const instant = false;

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-[#FFFEFA] text-[#101D35]">
      <Navbar />

      {/* PRESENTATION */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#8A6A39]">
            Qui sommes-nous ?
          </p>

          <h2 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-4xl">
            Bienvenue dans l&apos;univers de KËR KHADIM
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            KËR KHADIM est une bibliothèque en ligne consacrée aux écrits
            de Serigne Touba, Cheikh Ahmadou Bamba. Notre ambition est de
            faciliter l&apos;accès aux ouvrages et de contribuer à la
            préservation d&apos;un héritage littéraire et spirituel précieux.
          </p>

          <p className="mt-4 leading-8 text-gray-600">
            À travers notre plateforme, nous souhaitons permettre à chacun
            de découvrir des ouvrages, d&apos;approfondir ses connaissances et
            de participer à la transmission du savoir.
          </p>
        </div>

        <div className="flex min-h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-[#101D35] to-[#263D5B] p-8">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#D5BD91] text-4xl text-[#D5BD91]">
              ✦
            </div>

            <h3 className="mt-7 font-serif text-3xl font-bold text-white">
              KËR KHADIM
            </h3>

            <div className="mx-auto my-5 h-px w-20 bg-[#D5BD91]" />

            <p className="text-sm leading-7 text-[#E5E7EB]">
              L&apos;héritage des écrits, la transmission du savoir.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION ET VISION */}
      <section className="bg-[#F5E6C8]/60 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#8A6A39]">
              Notre engagement
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
              Notre mission et notre vision
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <article className="rounded-2xl border border-[#E5DCCB] bg-white p-8 shadow-sm">
              <div className="text-3xl text-[#8A6A39]">✦</div>

              <h3 className="mt-5 font-serif text-2xl font-bold">
                Notre mission
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                Faciliter la découverte et l&apos;accès aux écrits de Serigne
                Touba, en proposant un espace organisé, accessible et
                consacré aux ouvrages.
              </p>
            </article>

            <article className="rounded-2xl border border-[#E5DCCB] bg-white p-8 shadow-sm">
              <div className="text-3xl text-[#8A6A39]">◇</div>

              <h3 className="mt-5 font-serif text-2xl font-bold">
                Notre vision
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                Faire de KËR KHADIM un espace de référence pour la
                découverte, la valorisation et la transmission du
                patrimoine écrit.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#8A6A39]">
            Ce qui nous guide
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
            Nos valeurs
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Transmission",
              description:
                "Faire vivre le savoir et transmettre les écrits aux générations futures.",
              icon: "✦",
            },
            {
              title: "Connaissance",
              description:
                "Encourager la lecture, la découverte et l'apprentissage.",
              icon: "◈",
            },
            {
              title: "Préservation",
              description:
                "Contribuer à la valorisation d'un patrimoine littéraire précieux.",
              icon: "◇",
            },
          ].map((value) => (
            <article
              key={value.title}
              className="rounded-2xl border border-[#EAE2D5] bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-4xl text-[#8A6A39]">{value.icon}</div>

              <h3 className="mt-5 font-serif text-xl font-bold">
                {value.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>


    </main>
  );
}
