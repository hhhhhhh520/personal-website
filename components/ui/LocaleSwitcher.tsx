"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const locales = [
  { code: "zh", label: "中", fullLabel: "中文" },
  { code: "en", label: "En", fullLabel: "English" },
] as const;

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Replace the locale segment in the pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center gap-1 rounded-full glass border border-border/50 p-1">
      {locales.map((loc) => (
        <motion.button
          key={loc.code}
          onClick={() => handleLocaleChange(loc.code)}
          className={`relative min-w-[44px] min-h-[44px] px-3 py-2 text-xs font-medium rounded-full transition-all duration-200 cursor-target ${
            locale === loc.code
              ? "text-primary"
              : "text-secondary hover:text-foreground"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t("switch")}
          title={loc.fullLabel}
        >
          {locale === loc.code && (
            <motion.div
              layoutId="localeIndicator"
              className="absolute inset-0 rounded-full bg-primary/20 border border-primary/30"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{loc.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
