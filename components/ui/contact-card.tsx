import Link from "next/link";
import { ReactNode } from "react";

interface ContactCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  external?: boolean;
  bgColor?: string;
}

export function ContactCard({
  href,
  icon,
  title,
  subtitle,
  description,
  external = false,
  bgColor = "bg-primary/10 group-hover:bg-primary/20"
}: ContactCardProps) {
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Link href={href} {...linkProps} className="group">
      <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-all hover:border-primary/50 h-full">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center transition-colors`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {subtitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
