export default function ProductSkeleton({ count = 4 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5] rounded-[14px]" />
          <div className="skeleton mt-3.5 h-2.5 w-16 rounded-full" />
          <div className="skeleton mt-2.5 h-3.5 w-4/5 rounded-full" />
          <div className="skeleton mt-2.5 h-3 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
