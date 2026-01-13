import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 animate-shimmer rounded" />
          <div className="h-4 w-4 animate-shimmer rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 animate-shimmer rounded" />
          <div className="mt-1 h-3 w-32 animate-shimmer rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={
                  trend.isPositive ? "text-success" : "text-destructive"
                }
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%{" "}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
