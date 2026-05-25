import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  reviewCount?: number;
}

export function StarRating({ rating, size = 14, reviewCount }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < fullStars
                ? "text-amber-400 fill-amber-400"
                : i === fullStars && hasHalf
                ? "text-amber-400 fill-amber-400/50"
                : "text-gray-600"
            }
          />
        ))}
      </div>
      <span className="text-sm text-gray-400 ml-1">{rating}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500">({reviewCount})</span>
      )}
    </div>
  );
}
