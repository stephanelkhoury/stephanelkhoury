import Link from 'next/link';

const cards = [
  {
    href: '/admin/full-site',
    title: 'Full Site Editor',
    description: 'Edit the entire website payload (blocks, projects, systems, certificates) from one JSON CMS.',
  },
  {
    href: '/admin/multigraphic-builder',
    title: 'Multigraphic Builder',
    description: 'WordPress-like block builder for /multigraphiclb with live preview and full control over sections.',
  },
  {
    href: '/admin/sections',
    title: 'Sections CMS',
    description: 'Edit Hero, About, Experience, and Contact with structured fields.',
  },
  {
    href: '/admin/projects',
    title: 'Projects CMS',
    description: 'Manage full projects dataset using dedicated project APIs.',
  },
  {
    href: '/admin/systems',
    title: 'Systems CMS',
    description: 'Manage supported systems and platform detail links.',
  },
  {
    href: '/admin/certificates',
    title: 'Certificates CMS',
    description: 'Maintain certificates, issuers, file URLs, and previews.',
  },
  {
    href: '/admin/blob',
    title: 'Blob Storage',
    description: 'Upload/list/delete files in Vercel Blob with metadata persisted in Neon.',
  },
  {
    href: '/admin/chats',
    title: 'Chat Logs',
    description: 'Inspect all stored chat sessions and assistant responses.',
  },
];

export default function AdminHomePage() {
  return (
    <section>
      <h1 className="text-3xl font-semibold mb-2 tracking-tight">High-Level CMS Dashboard</h1>
      <p className="text-slate-400 mb-8 max-w-2xl">
        Structured admin workspace with dedicated APIs and modules for sections, projects, systems, certificates, and chat logs.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-slate-700 bg-[#0f172a] p-5 hover:border-slate-500 transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2 text-slate-100">{card.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
