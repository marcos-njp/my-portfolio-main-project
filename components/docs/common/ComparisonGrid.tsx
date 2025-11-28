import { ReactNode } from "react";

interface ComparisonCardProps {
  title: string;
  type?: "before" | "after";
  items: string[] | ReactNode[];
  className?: string;
}

export function ComparisonCard({ title, type = "before", items, className = "" }: ComparisonCardProps) {
  const isAfter = type === "after";
  
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
        {isAfter ? (
          <span className="w-4 h-4 text-green-500">✓</span>
        ) : (
          <span className="w-4 h-4 text-red-500">✗</span>
        )}
        {title}
      </h4>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={isAfter ? "text-green-500" : "text-red-500"}>
              {isAfter ? "✅" : "❌"}
            </span>
            {typeof item === "string" ? item : <div>{item}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ComparisonGridProps {
  before: Omit<ComparisonCardProps, "type">;
  after: Omit<ComparisonCardProps, "type">;
  className?: string;
}

export function ComparisonGrid({ before, after, className = "" }: ComparisonGridProps) {
  return (
    <div className={`grid md:grid-cols-2 gap-4 ${className}`}>
      <ComparisonCard {...before} type="before" />
      <ComparisonCard {...after} type="after" />
    </div>
  );
}