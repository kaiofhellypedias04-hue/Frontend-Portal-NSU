import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

export function InfiniteScrollSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  label = 'Carregando mais registros...',
}: {
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => unknown;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(Boolean(isLoading));

  useEffect(() => {
    loadingRef.current = Boolean(isLoading);
  }, [isLoading]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current || !onLoadMore) return;
    loadingRef.current = true;
    Promise.resolve(onLoadMore()).finally(() => {
      loadingRef.current = false;
    });
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !hasMore || isLoading || !onLoadMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, onLoadMore]);

  useEffect(() => {
    if (!hasMore || isLoading || !onLoadMore) return undefined;

    const onScroll = () => {
      const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (distanceToBottom < 500) {
        loadMore();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [hasMore, isLoading, loadMore, onLoadMore]);

  if (!hasMore && !isLoading) {
    return null;
  }

  return (
    <div ref={ref} className="flex items-center justify-center gap-2 border-t border-borderSoft/70 px-4 py-4 text-sm text-textSoft">
      {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
      {isLoading ? (
        label
      ) : (
        <button type="button" className="rounded-lg border border-borderSoft bg-panel2 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-sky-400/60" onClick={loadMore}>
          Carregar mais registros
        </button>
      )}
    </div>
  );
}
