import { prisma } from './prisma';
import { defaultBlocks, defaultProjects, defaultSystems } from './default-content';
import { BlockType } from '@prisma/client';

export async function ensureSeedData() {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const [blockCount, projectCount, systemCount] = await Promise.all([
    prisma.contentBlock.count(),
    prisma.project.count(),
    prisma.supportedSystem.count(),
  ]);

  if (blockCount === 0) {
    await prisma.contentBlock.createMany({
      data: defaultBlocks.map((block) => ({
        ...block,
        type: block.type as BlockType,
      })),
    });
  }

  if (projectCount === 0) {
    await prisma.project.createMany({
      data: defaultProjects.map((project) => ({ ...project })),
    });
  } else {
    const existingProjects = await prisma.project.findMany({
      select: { slug: true },
    });
    const existingSlugs = new Set(existingProjects.map((project) => project.slug));
    const missingProjects = defaultProjects.filter((project) => !existingSlugs.has(project.slug));

    if (missingProjects.length > 0) {
      await prisma.project.createMany({
        data: missingProjects.map((project) => ({ ...project })),
      });
    }
  }

  if (systemCount === 0) {
    await prisma.supportedSystem.createMany({
      data: defaultSystems.map((system) => ({ ...system })),
    });
  }
}

export async function getPublicContent() {
  if (!process.env.DATABASE_URL) {
    return {
      blocks: defaultBlocks.map((block, index) => ({
        id: `fallback-block-${index + 1}`,
        slug: block.slug,
        type: block.type as BlockType,
        title: block.title,
        subtitle: block.subtitle ?? null,
        content: block.content,
        sortOrder: block.sortOrder,
        isActive: block.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      projects: defaultProjects.map((project, index) => ({
        id: `fallback-project-${index + 1}`,
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        description: project.description,
        imageUrl: project.imageUrl,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        technologies: project.technologies,
        sortOrder: project.sortOrder,
        isActive: project.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      systems: defaultSystems.map((system, index) => ({
        id: `fallback-system-${index + 1}`,
        name: system.name,
        slug: system.slug,
        logoUrl: system.logoUrl,
        shortDescription: system.shortDescription,
        experience: system.experience,
        projectLinks: system.projectLinks,
        certificateLinks: system.certificateLinks,
        resourceLinks: system.resourceLinks,
        sortOrder: system.sortOrder,
        isActive: system.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      certificates: [],
    };
  }

  await ensureSeedData();

  const [blocks, projects, systems, certificates] = await Promise.all([
    prisma.contentBlock.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.project.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.supportedSystem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.certificate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return { blocks, projects, systems, certificates };
}
