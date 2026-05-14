"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const navItems = [
  { href: "/", labelKey: "home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/projects", labelKey: "projects", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m2 4v4m4-4v4m4-4v4" },
  { href: "/blog", labelKey: "blog", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM16 2v4M8 2v4M3 10h18" },
  { href: "/skills", labelKey: "skills", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M17.664 17.664l-.707.707M12 21v-1M6.343 17.657l-.707.707M3 12h1m1.636-6.364l.707-.707M12 12a4 4 0 108 0 4 4 0 00-8 0z" },
  { href: "/about", labelKey: "about", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const containerVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

export default function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      {/* Glass background */}
      <div className="glass border-t border-white/10">
        <div className="max-w-lg mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <motion.div
                  key={item.href}
                  variants={itemVariants}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-secondary hover:text-foreground"
                    }`}
                  >
                    {/* Icon */}
                    <motion.div
                      animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={isActive ? 2 : 1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={item.icon}
                        />
                      </svg>

                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          layoutId="mobileNavIndicator"
                          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        />
                      )}
                    </motion.div>

                    {/* Label */}
                    <span
                      className={`text-xs font-medium transition-all duration-200 ${
                        isActive ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      {t(item.labelKey)}
                    </span>
                  </Link>

                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavBg"
                      className="absolute inset-0 -z-10 rounded-xl bg-primary/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-transparent" />
    </motion.nav>
  );
}
