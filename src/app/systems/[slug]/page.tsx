import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

export default async function SystemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const system = process.env.DATABASE_URL
    ? await prisma.supportedSystem.findUnique({ where: { slug } })
    : defaultSystems.find((item) => item.slug === slug);

  if (!system || !system.isActive) {
    notFound();
  }

  const projectLinks = asArray(system.projectLinks);
  const certificateLinks = asArray(system.certificateLinks);
  const resourceLinks = asArray(system.resourceLinks);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <Link href="/#systems" className="text-[#3b82f6] text-sm">
            ← Back to Supported Systems
          </Link>

          <div className="mt-4 mb-8 flex items-center gap-4">
            <Image src={system.logoUrl} alt={system.name} className="h-14 w-14 object-contain" width={56} height={56} />
            <div>
              <h1 className="text-4xl font-bold">{system.name}</h1>
              <p className="text-gray-400">{system.shortDescription}</p>
            </div>
          </div>

          <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold mb-3">My Experience</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{system.experience}</p>
          </section>

          <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold mb-3">Related Projects</h2>
            {projectLinks.length === 0 ? (
              <p className="text-gray-400">No project links added yet.</p>
            ) : (
              <ul className="list-disc ml-5 space-y-2">
                {projectLinks.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer" className="text-[#3b82f6] break-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold mb-3">Certificates</h2>
            {certificateLinks.length === 0 ? (
              <p className="text-gray-400">No certificate links added yet.</p>
            ) : (
              <ul className="list-disc ml-5 space-y-2">
                {certificateLinks.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer" className="text-[#10b981] break-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold mb-3">Resources</h2>
            {resourceLinks.length === 0 ? (
              <p className="text-gray-400">No resources added yet.</p>
            ) : (
              <ul className="list-disc ml-5 space-y-2">
                {resourceLinks.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer" className="text-gray-200 break-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
