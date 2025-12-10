'use client';

import React, { useMemo, useState } from 'react';
import StarBorder from './StarBorder';

type Section = {
  id: 'intro' | 'guide' | 'info';
  title: string;
};

type DocsNavContentProps = {
  sections: Section[];
  contentHeading: string;
  contentBody: string;
};

const DocsNavContent: React.FC<DocsNavContentProps> = ({
  sections,
  contentHeading,
  contentBody,
}) => {
  const [activeId, setActiveId] = useState<Section['id']>('intro');

  const activeSection = useMemo(
    () => sections.find(section => section.id === activeId) ?? sections[0],
    [activeId, sections]
  );

  return (
    <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[260px,1fr]">
      <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <nav aria-label="Guide menu" className="space-y-3">
          {sections.map(section => {
            const isActive = section.id === activeSection.id;
            const innerContent = (
              <div
                className={`flex items-center gap-3 text-left ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-cyan-100">
                  {section.id === 'intro'
                    ? '1'
                    : section.id === 'guide'
                      ? '2'
                      : '3'}
                </span>
                <div className="font-semibold">{section.title}</div>
              </div>
            );

            if (isActive) {
              return (
                <StarBorder
                  key={section.id}
                  as="button"
                  color="rgba(200,210,222,0.95)"
                  speed="4s"
                  className="w-full cursor-pointer bg-white/5 shadow-[0_0_22px_rgba(200,210,222,0.28)] backdrop-blur-sm transition hover:scale-[1.01] active:scale-[1.01]"
                  onClick={() => setActiveId(section.id)}
                >
                  {innerContent}
                </StarBorder>
              );
            }

            return (
              <button
                key={section.id}
                onClick={() => setActiveId(section.id)}
                className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-white/0 px-3 py-3 text-left text-white/80 transition hover:scale-[1.01] hover:border-white/15 hover:bg-white/5 hover:text-white"
              >
                <span className="via-white/12 pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-xl bg-gradient-to-r from-white/0 to-white/0 opacity-0 blur-[10px] transition duration-200 group-hover:opacity-80" />
                {innerContent}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <p className="text-lg font-semibold text-white">{contentHeading}</p>
        <p className="mt-2 text-white/70">{contentBody}</p>
      </div>
    </div>
  );
};

export default DocsNavContent;
