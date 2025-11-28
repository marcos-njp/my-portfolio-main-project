import { ReactNode } from "react";

interface StepListProps {
  steps: Array<{
    number?: string | number;
    title: string;
    description?: string;
    content?: ReactNode;
  }>;
  className?: string;
}

export function StepList({ steps, className = "" }: StepListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {step.number ?? index + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{step.title}</p>
            {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
            {step.content && <div className="mt-2">{step.content}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}