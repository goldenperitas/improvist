interface NavigationArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function NavigationArrows({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: NavigationArrowsProps) {
  return (
    <div className="flex gap-8">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="w-16 h-16 rounded-full bg-gray-800 text-white text-3xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        aria-label="Previous progression"
      >
        &larr;
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="w-16 h-16 rounded-full bg-gray-800 text-white text-3xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        aria-label="Next progression"
      >
        &rarr;
      </button>
    </div>
  );
}
