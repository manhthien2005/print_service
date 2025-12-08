import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export function useLazyLoad<T>(data: T[], itemsPerPage = 10) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  useEffect(() => {
    const endIndex = pageRef.current * itemsPerPage;
    const newItems = data.slice(0, endIndex);
    setDisplayedItems(newItems);
    setHasMore(endIndex < data.length);
  }, [data, itemsPerPage]);

  const loadMore = () => {
    if (!hasMore) return;
    pageRef.current += 1;
    const endIndex = pageRef.current * itemsPerPage;
    const newItems = data.slice(0, endIndex);
    setDisplayedItems(newItems);
    setHasMore(endIndex < data.length);
  };

  return { displayedItems, hasMore, loadMore };
}

export function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore) {
      callback();
    }
  }, [inView, hasMore, callback]);

  return ref;
}
