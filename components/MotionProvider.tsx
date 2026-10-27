"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

// `reducedMotion="user"`: com movimento reduzido, Motion mantém só opacidade (sem deslocamento/escala).
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
    </MotionConfig>
  );
}
