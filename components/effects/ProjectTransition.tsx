"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

interface TransitionState {
  isAnimating: boolean;
  projectColor: string;
}

/**
 * ProjectTransition Component
 *
 * Creates a smooth transition effect when clicking on a project orb:
 * 1. Orb scales up and fades out from its position
 * 2. Full-screen overlay fades in with project color
 * 3. Target page content fades in
 *
 * Usage:
 * ```tsx
 * const { startTransition, TransitionOverlay } = useProjectTransition();
 *
 * // On click:
 * startTransition(project.color, () => router.push(`/projects/${project.id}`));
 *
 * // In render:
 * <TransitionOverlay />
 * ```
 */
export function useProjectTransition() {
  const [state, setState] = useState<TransitionState>({
    isAnimating: false,
    projectColor: "#3B82F6",
  });

  const startTransition = useCallback((color: string, onComplete?: () => void) => {
    setState({ isAnimating: true, projectColor: color });

    // Trigger navigation after orb expansion (400ms)
    const expandTimer = setTimeout(() => {
      onComplete?.();
    }, 400);

    // Complete transition after full animation (800ms total)
    const completeTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, isAnimating: false }));
    }, 800);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const TransitionOverlay = useCallback(() => (
    <AnimatePresence>
      {state.isAnimating && (
        <>
          {/* Expanding orb effect */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="rounded-full"
              style={{
                backgroundColor: state.projectColor,
                boxShadow: `0 0 100px ${state.projectColor}`,
              }}
              initial={{ width: 100, height: 100 }}
              animate={{
                width: Math.max(window.innerWidth, window.innerHeight) * 2,
                height: Math.max(window.innerWidth, window.innerHeight) * 2,
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            />
          </motion.div>

          {/* Page fade-in overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </>
      )}
    </AnimatePresence>
  ), [state.isAnimating, state.projectColor]);

  return {
    startTransition,
    TransitionOverlay,
    isAnimating: state.isAnimating,
  };
}

/**
 * ProjectTransitionProvider
 *
 * Wrapper component that provides transition context for the app.
 * Place this at the root layout level.
 */
export function ProjectTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

/**
 * ProjectTransitionOverlay
 *
 * Standalone overlay component for simpler use cases.
 * Controls visibility via `isActive` prop.
 */
export function ProjectTransitionOverlay({
  color,
  isActive,
}: {
  color: string;
  isActive: boolean;
}) {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Expanding orb effect */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="rounded-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 100px ${color}`,
              }}
              initial={{ width: 100, height: 100 }}
              animate={{
                width: 2000,
                height: 2000,
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            />
          </motion.div>

          {/* Page fade-in overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

export default ProjectTransitionOverlay;
