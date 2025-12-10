'use client';

import React, { useMemo, useState } from 'react';
import LightPillar from './LightPillar';

type Section = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  lightPillarTitle?: string;
  lightPillarDescription?: string;
  codeTitle?: string;
  codeBlock?: string;
};

interface DocsGuideProps {
  sections: Section[];
}

const DocsGuide: React.FC<DocsGuideProps> = ({ sections }) => {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  const activeSection = useMemo(
    () => sections.find(section => section.id === activeId) ?? sections[0],
    [activeId, sections]
  );

  return (
    <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[260px,1fr]">
      <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <nav aria-label="Guide menu" className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-white transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/5 hover:text-white ${
                activeId === section.id
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/5 bg-white/0 text-white/80'
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
            </button>
          ))}
        </nav>
      </aside>

      <div className="space-y-10">
        {activeSection && (
          <>
            {activeSection.id === 'intro' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">
                    01
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {activeSection.title}
                  </h2>
                  <p className="text-white/70">{activeSection.summary}</p>
                </div>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {activeSection.bullets.map(item => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-white/80"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {activeSection.id === 'guide' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">
                    02
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {activeSection.title}
                  </h2>
                  <p className="text-white/70">{activeSection.summary}</p>
                </div>

                <ol className="mt-4 space-y-3 text-white/80">
                  {activeSection.bullets.map((item, idx) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                    >
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-cyan-100">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(260px,1fr),minmax(260px,1fr)]">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b16]">
                    <div className="relative h-[320px]">
                      <LightPillar
                        topColor="#9FA3C8"
                        bottomColor="#253447"
                        intensity={1}
                        rotationSpeed={0.2}
                        glowAmount={0.002}
                        pillarWidth={3.4}
                        pillarHeight={0.4}
                        noiseIntensity={0.5}
                        pillarRotation={108}
                        interactive={false}
                        mixBlendMode="screen"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.09),transparent_30%),linear-gradient(180deg,rgba(10,12,26,0.3)_0%,rgba(10,12,26,0.9)_100%)]" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
                          {activeSection.lightPillarTitle}
                        </p>
                        <p className="mt-2 max-w-xl text-white/80">
                          {activeSection.lightPillarDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5 font-mono text-sm text-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                    <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-cyan-100">
                      <span>{activeSection.codeTitle}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70">
                        LightPillar
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-white/80">
                      {activeSection.codeBlock}
                    </pre>
                  </div>
                </div>
              </section>
            )}

            {activeSection.id === 'info' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">
                    03
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {activeSection.title}
                  </h2>
                  <p className="text-white/70">{activeSection.summary}</p>
                </div>
                <ul className="mt-4 space-y-3 text-white/80">
                  {activeSection.bullets.map(item => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocsGuide;
