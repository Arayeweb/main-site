import { IconStar } from "@/components/icons";

export default function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`امتیاز ${rating} از ۵`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar
          key={i}
          size={size}
          className={i < rating ? "fill-amber-400 text-amber-400" : "fill-navy-100 text-navy-100"}
        />
      ))}
    </div>
  );
}
