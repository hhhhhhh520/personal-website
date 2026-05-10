import OptimizedImage, {
  OptimizedImagePresets,
  DEFAULT_SIZES,
  createResponsiveSizes,
} from "@/components/ui/OptimizedImage";

/**
 * OptimizedImage Usage Examples
 *
 * This file demonstrates how to use the OptimizedImage component
 * in different scenarios throughout the portfolio.
 */

// ============================================
// Example 1: Hero Section Image
// ============================================
export function HeroImage() {
  return (
    <OptimizedImage
      src="/images/hero-bg.jpg"
      alt="Portfolio hero background"
      fill
      sizes={DEFAULT_SIZES.hero}
      priority={false}
      shimmer={true}
      objectFit="cover"
      containerClassName="absolute inset-0 z-0"
    />
  );
}

// ============================================
// Example 2: Project Card Thumbnail
// ============================================
export function ProjectThumbnail({ project }: { project: { id: string; title: string; image: string } }) {
  return (
    <OptimizedImage
      src={project.image}
      alt={`${project.title} preview`}
      width={400}
      height={225}
      sizes={DEFAULT_SIZES.card}
      shimmer={true}
      objectFit="cover"
      containerClassName="aspect-video rounded-t-lg overflow-hidden"
      fallbackSrc="/images/project-placeholder.png"
      animate={true}
    />
  );
}

// ============================================
// Example 3: Avatar with Fallback
// ============================================
export function UserAvatar({ src, name }: { src: string; name: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={`${name}'s avatar`}
      width={64}
      height={64}
      sizes={DEFAULT_SIZES.avatar}
      objectFit="cover"
      containerClassName="rounded-full overflow-hidden"
      fallbackComponent={
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xl font-semibold text-primary">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      }
    />
  );
}

// ============================================
// Example 4: Blog Post Featured Image
// ============================================
export function BlogFeaturedImage({ src, title }: { src: string; title: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={title}
      width={1200}
      height={630}
      sizes={createResponsiveSizes({
        xl: "1200px",
        lg: "900px",
        md: "700px",
        default: "100vw",
      })}
      priority={false}
      shimmer={true}
      objectFit="cover"
      containerClassName="aspect-[1200/630] rounded-lg overflow-hidden"
      fallbackSrc="/images/blog-placeholder.png"
    />
  );
}

// ============================================
// Example 5: Critical Above-the-fold Image
// ============================================
export function LogoImage() {
  return (
    <OptimizedImage
      src="/images/logo.png"
      alt="Site logo"
      width={48}
      height={48}
      priority={true} // Critical image, load immediately
      shimmer={false}
      objectFit="contain"
      containerClassName="w-12 h-12"
    />
  );
}

// ============================================
// Example 6: Gallery Grid Images
// ============================================
export function GalleryGrid({ images }: { images: Array<{ id: string; url: string; alt: string }> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <OptimizedImage
          key={image.id}
          src={image.url}
          alt={image.alt}
          width={300}
          height={300}
          sizes={DEFAULT_SIZES.thumbnail}
          shimmer={true}
          objectFit="cover"
          containerClassName="aspect-square rounded-lg overflow-hidden"
          animationDuration={0.3}
        />
      ))}
    </div>
  );
}

// ============================================
// Example 7: Using Presets for Common Cases
// ============================================
export function QuickExamples() {
  return (
    <div className="space-y-8">
      {/* Card using preset */}
      <OptimizedImage
        src="/images/work-1.jpg"
        alt="Project showcase"
        width={400}
        height={300}
        {...OptimizedImagePresets.card}
        containerClassName="rounded-lg overflow-hidden"
      />

      {/* Avatar using preset */}
      <OptimizedImage
        src="/images/profile.jpg"
        alt="Profile photo"
        width={80}
        height={80}
        {...OptimizedImagePresets.avatar}
        containerClassName="rounded-full overflow-hidden"
      />

      {/* Critical image using preset */}
      <OptimizedImage
        src="/images/hero-banner.jpg"
        alt="Welcome banner"
        width={1920}
        height={600}
        {...OptimizedImagePresets.critical}
        containerClassName="w-full"
      />
    </div>
  );
}

export default function OptimizedImageExamples() {
  return null;
}
