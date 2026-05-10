"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";

const linkVariants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const underlineVariants = {
  initial: { width: 0 },
  hover: { width: "100%" },
};

// Mobile menu animation variants
const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
      staggerChildren: 0.08,
    },
  },
};

const mobileNavItemVariants: Variants = {
  closed: { x: -30, opacity: 0, rotate: -5 },
  open: { x: 0, opacity: 1, rotate: 0 },
};

export default function Navigation() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navigation links with translations
  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/projects", label: t("projects") },
    { href: "/blog", label: t("blog") },
    { href: "/skills", label: t("skills") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 glass transition-all duration-300 ${
        scrolled ? "shadow-lg shadow-black/5" : ""
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="relative group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-lg gradient-text hidden sm:block">
                Portfolio
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                variants={linkVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
              >
                <Link href={link.href} className="relative px-4 py-2 group">
                  <motion.span
                    className={`relative z-10 transition-colors duration-200 ${
                      pathname === link.href
                        ? "text-primary"
                        : "text-secondary group-hover:text-foreground"
                    }`}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {link.label}
                  </motion.span>

                  {/* Active indicator */}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Hover underline */}
                  <motion.div
                    variants={underlineVariants}
                    initial="initial"
                    whileHover="hover"
                    className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                  />
                </Link>
              </motion.div>
            ))}
            {/* Locale Switcher */}
            <motion.div
              variants={linkVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: navLinks.length * 0.1 }}
              className="ml-2"
            >
              <LocaleSwitcher />
            </motion.div>
            {/* Theme Toggle */}
            <motion.div
              variants={linkVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: (navLinks.length + 1) * 0.1 }}
              className="ml-2"
            >
              <ThemeToggle />
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: 45, y: 8, width: "120%" }
                    : { rotate: 0, y: 0, width: "100%" }
                }
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-0.5 bg-foreground origin-left rounded-full"
              />
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { opacity: 0, x: -10 }
                    : { opacity: 1, x: 0 }
                }
                transition={{ duration: 0.2 }}
                className="w-full h-0.5 bg-foreground rounded-full"
              />
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: -45, y: -8, width: "120%" }
                    : { rotate: 0, y: 0, width: "100%" }
                }
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-0.5 bg-foreground origin-left rounded-full"
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    variants={mobileNavItemVariants}
                  >
                    <Link
                      href={link.href}
                      className={`relative block px-4 py-3 rounded-xl transition-all duration-200 ${
                        pathname === link.href
                          ? "text-primary bg-primary/10"
                          : "text-secondary hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span className="relative z-10">{link.label}</span>

                      {/* Active indicator line */}
                      {pathname === link.href && (
                        <motion.div
                          layoutId="mobileActiveLine"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary to-accent"
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
                {/* Locale and Theme in Mobile Menu */}
                <motion.div
                  variants={mobileNavItemVariants}
                  className="flex justify-center gap-6 pt-4 border-t border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-secondary text-sm">语言</span>
                    <LocaleSwitcher />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary text-sm">主题</span>
                    <ThemeToggle />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}
