"use client";

import { useState, useCallback, useMemo } from "react";
import Image, { ImageProps } from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * OptimizedImage Component
 *
 * A premium image component with lazy loading, blur placeholder,
 * responsive sizing, and elegant error handling.
 *
 * Features:
 * - Automatic lazy loading (unless priority is set)
 * - Blur placeholder for smooth loading experience
 * - Responsive sizing with srcSet support
 * - Error handling with fallback support
 * - TypeScript type safety
 */

// Default blur placeholder (shimmer effect base64)
const DEFAULT_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// Shimmer animation placeholder (more elegant)
const SHIMMER_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0ic2hpbW1lciIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiIGFuaW1hdGU9InNoaW1tZXIgMXMgZW5kbGVzcyBpbmZpbml0ZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzIwMjAyMCIgc3RvcC1vcGFjaXR5PSIxIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiMyYTJhMmEiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzIwMjAyMCIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzIwMjAyMCIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2hpbW1lcikiLz48L3N2Zz4=";

export interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Width of the image */
  width?: number;
  /** Height of the image */
  height?: number;
  /** Whether to prioritize loading (disables lazy loading) */
  priority?: boolean;
  /** Custom blur placeholder data URL */
  blurDataURL?: string;
  /** Custom fallback image URL when loading fails */
  fallbackSrc?: string;
  /** Custom fallback component when loading fails */
  fallbackComponent?: React.ReactNode;
  /** Whether to show shimmer effect during loading */
  shimmer?: boolean;
  /** Object fit style for the image */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /** Responsive sizes attribute for srcSet */
  sizes?: string;
  /** Additional className for the container */
  containerClassName?: string;
  /** Whether to animate on load */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
}

/**
 * Generates a shimmer blur placeholder
 */
export function generateShimmerBlur(
  width: number = 100,
  height: number = 100,
  baseColor: string = "#202020",
  shimmerColor: string = "#2a2a2a"
): string {
  // For client-side, we return the SVG-based shimmer
  return SHIMMER_BLUR_DATA_URL;
}

/**
 * Creates responsive sizes configuration
 */
export function createResponsiveSizes(config: {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  default?: string;
}): string {
  const sizes: string[] = [];

  if (config.xl) sizes.push(`(min-width: 1280px) ${config.xl}`);
  if (config.lg) sizes.push(`(min-width: 1024px) ${config.lg}`);
  if (config.md) sizes.push(`(min-width: 768px) ${config.md}`);
  if (config.sm) sizes.push(`(min-width: 640px) ${config.sm}`);
  if (config.default) sizes.push(config.default);

  return sizes.join(", ");
}

// Default responsive sizes for common use cases
export const DEFAULT_SIZES = {
  full: "100vw",
  hero: createResponsiveSizes({
    xl: "80vw",
    lg: "90vw",
    md: "100vw",
    default: "100vw",
  }),
  card: createResponsiveSizes({
    xl: "300px",
    lg: "280px",
    md: "250px",
    sm: "200px",
    default: "150px",
  }),
  thumbnail: createResponsiveSizes({
    lg: "150px",
    md: "120px",
    sm: "100px",
    default: "80px",
  }),
  avatar: createResponsiveSizes({
    lg: "64px",
    md: "48px",
    sm: "40px",
    default: "32px",
  }),
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  blurDataURL,
  fallbackSrc,
  fallbackComponent,
  shimmer = true,
  objectFit = "cover",
  sizes,
  containerClassName,
  animate = true,
  animationDuration = 0.5,
  className,
  style,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!priority);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Determine the blur placeholder to use
  const placeholderBlurDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    if (shimmer) return SHIMMER_BLUR_DATA_URL;
    return DEFAULT_BLUR_DATA_URL;
  }, [blurDataURL, shimmer]);

  // Handle image load error
  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      // Try fallback source first
      setCurrentSrc(fallbackSrc);
    } else {
      // Show error state
      setHasError(true);
      setIsLoading(false);
    }
  }, [fallbackSrc, currentSrc]);

  // Handle successful load
  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Object fit mapping for CSS
  const objectFitClass = useMemo(() => {
    const fitMap: Record<string, string> = {
      contain: "object-contain",
      cover: "object-cover",
      fill: "object-fill",
      none: "object-none",
      "scale-down": "object-scale-down",
    };
    return fitMap[objectFit] || "object-cover";
  }, [objectFit]);

  // If there's an error and we have a fallback component, show it
  if (hasError && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // If there's an error and no fallback, show a placeholder
  if (hasError) {
    return (
      <div
        className={`relative bg-secondary/10 flex items-center justify-center ${containerClassName}`}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100%",
        }}
      >
        <div className="text-secondary/50 flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs text-secondary/70">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer loading overlay */}
      <AnimatePresence>
        {isLoading && shimmer && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className="absolute inset-0 z-10 bg-secondary/5"
          >
            <div
              className="absolute inset-0 shimmer-gradient animate-shimmer"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
                animation: "shimmer 2s infinite",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Image */}
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.98 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: animationDuration, ease: "easeOut" }}
        className="w-full h-full"
      >
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          placeholder="blur"
          blurDataURL={placeholderBlurDataURL}
          sizes={sizes}
          className={`${objectFitClass} ${className || ""}`}
          style={style}
          onError={handleError}
          onLoad={handleLoadComplete}
          {...props}
        />
      </motion.div>
    </div>
  );
}

// Export utility functions and presets
export { DEFAULT_BLUR_DATA_URL, SHIMMER_BLUR_DATA_URL };

// Named exports for common configurations
export const OptimizedImagePresets = {
  hero: {
    shimmer: true,
    objectFit: "cover" as const,
    sizes: DEFAULT_SIZES.hero,
    priority: false,
  },
  card: {
    shimmer: true,
    objectFit: "cover" as const,
    sizes: DEFAULT_SIZES.card,
    priority: false,
  },
  avatar: {
    shimmer: true,
    objectFit: "cover" as const,
    sizes: DEFAULT_SIZES.avatar,
    priority: false,
  },
  thumbnail: {
    shimmer: true,
    objectFit: "cover" as const,
    sizes: DEFAULT_SIZES.thumbnail,
    priority: false,
  },
  critical: {
    shimmer: false,
    objectFit: "cover" as const,
    priority: true,
  },
};
