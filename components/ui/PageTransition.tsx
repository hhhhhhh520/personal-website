"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

/**
 * PageTransition Component
 * Wraps page content with smooth enter animations
 * Note: Removed AnimatePresence/key to avoid unmounting components on route change
 * This prevents WebGL context loss when navigating between pages
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      key={pathname}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
