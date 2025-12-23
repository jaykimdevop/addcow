"use client";

import { PageTransition } from "@/components/PageTransition";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <div className="pb-24 lg:pb-28">{children}</div>
    </PageTransition>
  );
}

