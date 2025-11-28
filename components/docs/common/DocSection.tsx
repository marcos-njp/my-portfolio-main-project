import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface DocSectionProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function DocSection({ title, subtitle, icon: Icon, children, className = "" }: DocSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || subtitle || Icon) && (
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            {title && <h2 className="text-2xl font-semibold">{title}</h2>}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}