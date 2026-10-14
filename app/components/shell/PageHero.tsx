import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  description: string;
  children?: ReactNode;
  references?: ReactNode;
}

/** Shared introduction for all project workspaces. Actions retain route handlers. */
export function PageHero({ title, description, children, references }: PageHeroProps) {
  return (
    <section className="page-hero" aria-label={title}>
      <div className="page-hero-orbit" aria-hidden="true" />
      <div className="page-hero-content">
        <p className="page-hero-eyebrow">โครงการกฎหมาย สกสว. <span aria-hidden="true"> / </span> พื้นที่ทำงานร่วมกัน</p>
        <h1>{title}</h1>
        <p className="page-hero-description">{description}</p>
        {references && <details className="page-hero-references"><summary>รายละเอียดอ้างอิง</summary><div className="mt-3 flex flex-wrap gap-2">{references}</div></details>}
      </div>
      {children && <div className="page-hero-actions">{children}</div>}
    </section>
  );
}
