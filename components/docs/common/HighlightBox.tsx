import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface HighlightBoxProps {
  type?: "info" | "tip" | "warning" | "note" | "success";
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
}

const highlightStyles = {
  info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30",
  tip: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30", 
  warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30",
  note: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/30",
  success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30"
};

const iconColors = {
  info: "text-blue-700 dark:text-blue-300",
  tip: "text-green-700 dark:text-green-300",
  warning: "text-amber-700 dark:text-amber-300", 
  note: "text-purple-700 dark:text-purple-300",
  success: "text-green-700 dark:text-green-300"
};

export function HighlightBox({ type = "note", icon: Icon, title, children, className = "" }: HighlightBoxProps) {
  const style = highlightStyles[type];
  const iconColor = iconColors[type];
  
  return (
    <div className={`rounded-md border p-3 ${style} ${className}`}>
      <div className="flex items-start gap-2">
        {Icon && <Icon className={`w-4 h-4 mt-0.5 ${iconColor}`} />}
        <div className="flex-1">
          {title && <p className="font-medium text-sm mb-1">{title}</p>}
          <div className="text-xs">{children}</div>
        </div>
      </div>
    </div>
  );
}