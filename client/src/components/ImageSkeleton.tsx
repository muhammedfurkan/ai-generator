export default function ImageSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-muted aspect-square">
      {/* Shimmer animation */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
