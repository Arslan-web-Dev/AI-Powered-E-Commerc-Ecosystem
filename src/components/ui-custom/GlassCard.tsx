import { cn } from "@/lib/utils";

interface SurfaceCardProps {
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, interactive = false, glow = false, onClick }: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] relative overflow-hidden",
        "bg-white/[0.03] backdrop-blur-xl",
        interactive && "transition-all duration-200 hover:border-purple-500/20 hover:bg-white/[0.055] hover:-translate-y-px hover:shadow-lg hover:shadow-purple-500/[0.07] cursor-pointer",
        glow && "glow-pulse",
        className
      )}
      onClick={onClick}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
