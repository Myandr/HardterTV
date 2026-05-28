import GalerieClient from "./galerie-client";

export default function GaleriePage() {
  const images = Array.from({ length: 17 }, (_, i) => ({
    src: `/images/R%C3%BCckblick%202024/R%C3%BCckblick%202024_${i + 1}.jpg`,
    alt: `Rückblick 2024 – Bild ${i + 1}`,
    index: i,
  }));

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122023] px-6 py-24 md:px-12 lg:px-20 lg:py-36">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#e1fcad]" />
          <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#e1fcad]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-white/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Galerie</span>
          </div>

          <h1 className="font-kanturmuy max-w-3xl text-4xl font-normal tracking-tighter text-white sm:text-5xl md:text-7xl">
            Unsere{" "}
            <span className="relative inline-block">
              Tennismomente
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light text-white/60 md:text-lg">
            Entdecke die schönsten Momente aus unserem Vereinsleben — von Turnieren
            über Mannschaftsabende bis zum Saisonabschluss.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <span className="rounded-full bg-[#e1fcad]/20 px-4 py-2 text-sm font-light text-[#e1fcad]">
              Rückblick 2024
            </span>
            <span className="text-sm text-white/40">{images.length} Bilder</span>
          </div>
        </div>
      </section>

      <GalerieClient images={images} />
    </main>
  );
}
