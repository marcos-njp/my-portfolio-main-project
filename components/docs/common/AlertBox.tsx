import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type AlertType = "info" | "warning" | "success" | "error";

interface AlertBoxProps {
  type?: AlertType;
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
}

const alertStyles = {
  info: "border-blue-500/50 bg-blue-500/10 text-blue-500",
  warning: "border-amber-500/50 bg-amber-500/10 text-amber-500", 
  success: "border-green-500/50 bg-green-500/10 text-green-500",
  error: "border-red-500/50 bg-red-500/10 text-red-500"
};

export function AlertBox({ type = "info", icon: Icon, title, children, className = "" }: AlertBoxProps) {
  const baseStyle = alertStyles[type];
  
  return (
    <div className={`rounded-lg border p-6 ${baseStyle} ${className}`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-5 h-5 mt-0.5" />}
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-2">{title}</h3>}
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}