export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#FFFEFA]">
      <header className="flex h-[72px] items-center bg-[#101D35] px-5 sm:px-8">
        <div className="h-7 w-40 rounded bg-[#D5BD91]/30" />
      </header>
      <section className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D5BD91]/50 bg-[#F5E6C8]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D5BD91] border-t-[#101D35]" />
        </div>
        <p className="mt-6 font-serif text-2xl text-[#101D35]">KËR KHADIM</p>
        <p className="mt-2 text-sm text-[#64748B]">
          Chargement de votre espace...
        </p>
      </section>
    </main>
  );
}
