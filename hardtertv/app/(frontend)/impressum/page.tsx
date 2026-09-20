import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getLegalPage } from "@/lib/get-legal-page";
import LegalSections from "@/components/ui/legal-sections";

export const revalidate = 3600;

export const metadata = {
  title: "Impressum",
};

export default async function ImpressumPage() {
  const page = await getLegalPage("impressum");

  return (
    <main className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-black/40 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Zurück zur Startseite
        </Link>

        <h1 className="font-kanturmuy text-4xl font-normal tracking-tighter text-black sm:text-5xl">
          {page.titel}
        </h1>

        <LegalSections abschnitte={page.abschnitte ?? []} />

        {page.stand && <p className="mt-10 text-xs text-black/30">{page.stand}</p>}
      </div>
    </main>
  );
}
