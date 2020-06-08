import { useState, useCallback, useMemo } from 'react';
import { usePromise } from './usePromise';

const CACHES: {
  [key: string]: PromiseLike<any>
} = {};

type DataGenerator<T> = () => PromiseLike<T> | null;

type DataKey = string | (() => string);

export type UseCacheResponse<T> = {
  isFetching: boolean;
  data: T | undefined;
  updateCache: (nextData: T) => void;
  removeCache: () => void;
}

export function useCache<T>(getData: DataGenerator<T>, dataKey: DataKey): UseCacheResponse<T> {
  const [count, setCount] = useState<number>(0);

  const key = useMemo(() => {
    if (typeof dataKey === 'string') {
      return dataKey;
    }

    return dataKey();
  }, [dataKey]);

  const updateCache = useCallback((nextData: T) => {
    CACHES[key] = Promise.resolve(nextData);
    setCount(Date.now());
  }, [key]);

  const removeCache = useCallback(() => {
    delete CACHES[key]
  }, [key]);

  const retrieveData = useCallback(() => {
    let cachedPromise = CACHES[key];

    if (cachedPromise === undefined) {
      const dataPromise = getData();

      if (dataPromise === null) {
        return null;
      }

      cachedPromise = CACHES[key] = dataPromise;
    }

    return cachedPromise as PromiseLike<T> | null;
  }, [key, count]);

  const { data, isFetching } = usePromise(retrieveData);

  return {
    isFetching,
    data,
    updateCache,
    removeCache
  };
}
