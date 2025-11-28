import { ReactNode } from "react";

interface CodeBlockProps {
  children: ReactNode;
  title?: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ children, title, language = "typescript", className = "" }: CodeBlockProps) {
  return (
    <div className={`rounded-lg border bg-muted/50 p-4 ${className}`}>
      {title && (
        <h4 className="font-semibold text-sm mb-3">{title}</h4>
      )}
      <pre className="text-xs text-muted-foreground overflow-x-auto">
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  );
}