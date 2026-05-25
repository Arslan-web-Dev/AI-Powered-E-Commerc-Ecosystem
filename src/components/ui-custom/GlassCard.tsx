import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function GlassCard({ children, className, hover = true, glow = false, onClick, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-xl border border-white/[0.08] relative overflow-hidden",
        hover && "transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10",
        glow && "animate-pulse-glow",
        onClick && "cursor-pointer",
        className
      )}
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}
      onClick={onClick}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
