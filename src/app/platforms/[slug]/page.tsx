import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PremiumNavbar from '@/components/premium/Navbar';
import PremiumFooter from '@/components/premium/Footer';
import { prisma } from '@/lib/prisma';
import { defaultSystems } from '@/lib/default-content';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export default async function PlatformDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const platform = process.env.DATABASE_URL
    ? await prisma.supportedSystem.findUnique({ where: { slug } })
    : defaultSystems.find((item) => item.slug === slug);

  if (!platform || !platform.isActive) {
    notFound();
  }

  const projectLinks = asArray(platform.projectLinks);
  const certificateLinks = asArray(platform.certificateLinks);
  const resourceLinks = asArray(platform.resourceLinks);

  return (
    <>
      <PremiumNavbar />
      <main className="min-h-screen pt-28 px-6 md:px-12 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <section className="max-w-5xl mx-auto">
          <Link href="/#platforms" className="text-blue-400 text-sm hover:text-blue-300">
            ← Back to Platforms
          </Link>

          <div className="mt-5 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
            <article className="rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 p-8">
              <div className="flex items-center gap-4 mb-6">
                <Image src={platform.logoUrl} alt={platform.name} className="h-14 w-14 object-contain" width={56} height={56} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">Platform</p>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{platform.name}</h1>
                </div>
              </div>

              <p className="text-zinc-700 dark:text-zinc-300 text-lg mb-6">{platform.shortDescription}</p>

              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/60 p-6">
                <h2 className="text-2xl font-semibold mb-3">My Experience</h2>
                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{platform.experience}</p>
              </div>
            </article>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/50 p-6">
                <h2 className="text-xl font-semibold mb-3">Related Projects</h2>
                {projectLinks.length === 0 ? (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">No project links added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {projectLinks.map((link) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 break-all text-sm">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/50 p-6">
                <h2 className="text-xl font-semibold mb-3">Certificates</h2>
                {certificateLinks.length === 0 ? (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">No certificate links added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {certificateLinks.map((link) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 break-all text-sm">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/50 p-6">
                <h2 className="text-xl font-semibold mb-3">Resources</h2>
                {resourceLinks.length === 0 ? (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">No resources added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {resourceLinks.map((link) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noreferrer" className="text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white break-all text-sm">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}
