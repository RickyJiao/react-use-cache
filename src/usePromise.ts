import { useEffect, useState } from 'react';

type DataGenerator<T> = () => PromiseLike<T> | null;

export function usePromise<T>(getData: DataGenerator<T>) {
  const [isFetching, setIsFetching] = useState(true);
  const [data, setData] = useState<T>();

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      const promise = getData();

      if (promise === null) {
        return;
      }

      setIsFetching(true);
      setData(undefined);

      const data: T = await promise;

      if (!mounted) {
        return;
      }

      setData(data);
      setIsFetching(false);
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [getData]);

  return {
    isFetching,
    data
  };
}
