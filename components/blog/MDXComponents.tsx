import type { MDXComponents } from "mdx/types";

// Custom MDX components matching the existing renderContent() styles
export const mdxComponents: MDXComponents = {
  h1: () => null, // Skip main title (already shown in hero area)
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4 flex items-center gap-2">
      <span className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-accent" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-secondary leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-secondary leading-relaxed ml-4 list-disc mb-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-secondary leading-relaxed ml-4 list-decimal mb-4">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="mb-1">{children}</li>
  ),
  pre: ({ children }) => (
    <pre className="my-6 p-4 rounded-xl bg-foreground/5 border border-foreground/10 overflow-x-auto">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    // Inline code (no className means not inside a code block)
    if (!className) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/90 text-sm font-mono">
          {children}
        </code>
      );
    }
    // Code inside a code block
    return (
      <code className={`text-sm text-foreground/90 font-mono whitespace-pre ${className || ""}`}>
        {children}
      </code>
    );
  },
  hr: () => <hr className="my-8 border-foreground/10" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/30 pl-4 my-4 text-secondary italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm text-secondary border-collapse">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left py-2 px-3 border-b border-foreground/20 font-medium text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-2 px-3 border-b border-foreground/10">{children}</td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
};
