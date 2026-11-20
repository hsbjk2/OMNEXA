import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Camera, Info } from "lucide-react";
import creditsData from "@/public/images/credits.json";

export const metadata: Metadata = {
  title: "Photography credits",
  description:
    "Licensed photography used as stand-in imagery across the OMNEXA demonstration storefront.",
};

type Credit = {
  file: string;
  pexels_id: number;
  source: string;
  width: number;
  height: number;
};

const credits = creditsData as Credit[];

const groups = [
  {
    key: "editorial",
    label: "Editorial",
    description: "Hero, story and wholesale imagery.",
  },
  {
    key: "categories",
    label: "Categories",
    description: "Category cards on the homepage and category index.",
  },
  {
    key: "products",
    label: "Products",
    description: "Stand-in product photography in the demo catalogue.",
  },
];

function publicPath(file: string) {
  return file.replace(/^public/, "");
}

function filename(file: string) {
  return file.split("/").pop() ?? file;
}

export default function CreditsPage() {
  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-page py-12 sm:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest/45 transition hover:text-forest"
          >
            <ArrowLeft className="size-3.5" /> Back to the store
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="eyebrow text-forest/45">Credits</p>
              <h1 className="title-lg mt-4">
                Stand-in photography,
                <br />
                <span className="italic text-forest/60">properly credited.</span>
              </h1>
            </div>
            <div className="max-w-md text-[0.85rem] leading-relaxed text-muted">
              <p>
                OMNEXA&apos;s demo catalogue uses licensed Pexels photographs as
                stand-ins until the brand&apos;s own product and campaign imagery
                is available. Each image is stored locally and linked to its
                original source below.
              </p>
              <a
                href="https://www.pexels.com/license/"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest underline underline-offset-4"
              >
                Pexels license <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container-page">
          <div className="flex items-start gap-2.5 border border-line bg-white p-4 text-[0.76rem] leading-relaxed text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-forest/40" />
            <p>
              These photographs depict generic beauty and jewellery subjects.
              They are not photographs of the specific demo products described
              in the catalogue. Product names, prices, stock and descriptions
              are demonstration data and are labelled as such on product pages.
            </p>
          </div>

          <div className="mt-10 space-y-12">
            {groups.map((group) => {
              const items = credits.filter((credit) =>
                credit.file.includes(`/images/${group.key}/`),
              );
              return (
                <div key={group.key}>
                  <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
                    <div>
                      <p className="eyebrow text-forest/45">{group.label}</p>
                      <h2 className="mt-1 font-display text-[1.8rem] leading-tight">
                        {group.description}
                      </h2>
                    </div>
                    <p className="text-[0.62rem] uppercase tracking-[0.1em] text-muted/50">
                      {items.length} images
                    </p>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {items.map((credit) => (
                      <li key={credit.file}>
                        <a
                          href={credit.source}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="group block border border-line bg-white transition hover:border-forest/30"
                        >
                          <div className="relative aspect-square overflow-hidden bg-light">
                            <Image
                              src={publicPath(credit.file)}
                              alt={`Stand-in photography: ${filename(credit.file).replace(/[-_]/g, " ").replace(/\.webp$/, "")}`}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              className="object-cover transition duration-700 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 p-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-[0.64rem] font-medium text-ink">
                                {filename(credit.file)}
                              </p>
                              <p className="text-[0.56rem] text-muted/60">
                                Pexels #{credit.pexels_id}
                              </p>
                            </div>
                            <ArrowUpRight className="size-3 shrink-0 text-forest/30 transition group-hover:text-forest" />
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-12 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Camera className="mt-0.5 size-4 shrink-0 text-forest/35" />
              <p className="text-[0.76rem] leading-relaxed text-muted">
                Brand mark, icons and the social share image were created for
                this OMNEXA project and are not third-party licensed assets.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-forest/35" />
              <p className="text-[0.76rem] leading-relaxed text-muted">
                Replacing the demo catalogue with real product photography will
                also replace these credits. Upload real imagery through the
                admin product and category forms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
