import React, {
  useContext, createContext, useState, useEffect,
} from 'react';
import { useCache, UseCacheResponse } from './useCache';

export type IStores = Record<string, (...args: any[]) => Promise<any>>;

type PromiseInnerType<T extends Promise<any>> = T extends Promise<infer P> ? P : never

type Transform<T extends IStores> = {
  [P in keyof T]: (...args: Parameters<T[P]>) => UseCacheResponse<PromiseInnerType<ReturnType<T[P]>>>
}

type RemoveCacheFn = () => void;

type IStoreContext<T extends IStores> = Transform<T> & {
  clearCache(...args: any[]): void;
}

export const CacheJoint = '_';

export const StoreContext = createContext({});

export function useStore<T extends IStores>() {
  return useContext<IStoreContext<T>>(StoreContext as unknown as React.Context<IStoreContext<T>>);
}

export function StoreProvider<T extends IStores>({
  value,
  children,
}: React.ProviderProps<T>) {
  const [removeCacheCallback, setRemoveCacheCallback] = useState<Record<string, RemoveCacheFn>>({});

  function removeCache(cacheKey: string) {
    const fnRemoveCache = removeCacheCallback[cacheKey];

    if (fnRemoveCache) {
      fnRemoveCache();
    }
  }

  function updateRemoveCacheCallback(cacheKey: string, nextRemoveCache: RemoveCacheFn) {
    if (removeCacheCallback[cacheKey]) {
      return;
    }

    const nextRemoveCacheCallback = {
      ...removeCacheCallback,
      [cacheKey]: nextRemoveCache,
    };

    setRemoveCacheCallback(nextRemoveCacheCallback);
  }

  const nextValue: IStoreContext<T> = Object.keys(value).reduce((prev, cur) => {
    const getData = value[cur];
    type ArgsType = Parameters<typeof getData>;

    prev[cur] = (...args: ArgsType) => {
      const cacheKey = [cur, ...args].join('_');
      const cacheObject = useCache(() => getData(...args), cacheKey);

      useEffect(() => {
        updateRemoveCacheCallback(cacheKey, cacheObject.removeCache);
      }, [cacheKey, cacheObject.removeCache]);

      return cacheObject;
    };

    return prev;
  }, {
    clearCache(...args: any[]) {
      const cacheKey = [...args].join('_');
      removeCache(cacheKey);
    }
  } as any);

  const MyStoreContext: React.Context<IStoreContext<T>> = StoreContext as unknown as React.Context<IStoreContext<T>>;

  return (
    <MyStoreContext.Provider value={nextValue}>
      {children}
    </MyStoreContext.Provider>
  );
}
