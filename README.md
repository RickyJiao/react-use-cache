# react-use-cache

React use cache is an local cache manager to cache response data in memory. It will automatically return previous cached one when requesting the same data from serve to:

- improve performance
- avoid multiple same requests to server to reduce server pressure

## Installation

Using npm:

```sh
$ npm install --save react-use-cache
```

Using yarn:

```sh
$ yarn add react-use-cache
```

## Example

### useCache

React hook for cache promises fulfilled value. Use with `fetch` or `axios` together to avoid multiple same request to server. Here is an example to cache blog detail object.

Once a new comment is created, we are able to use `updateCache` to update the cached object.

Here is the hook interface
```jsx
  type DataGenerator<T> = () => PromiseLike<T> | null;

  type UseCacheResponse<T> = {
    isFetching: boolean;
    data: T | undefined;
    updateCache: (nextData: T) => void;
    removeCache: () => void;
  }

  function useCache<T>(getData: DataGenerator<T>, dataKey: DataKey): UseCacheResponse<T>
```
Note: `getData` should return a **PromiseLike** object. It will be invoked only `dataKey` is changed.

```jsx
// Blog.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useCache } from 'react-use-cache';

export default function Blog() {
  const { id: blogId } = useParams();
  const { isFetching, data: blog, updateCache } = useCache(
    () => axios.get(`/blog/${blogId}`),
    `BLOG_${blogId}`
  );
  const [comment, setComment] = useState<string>('');

  async function addComment() {
    const addedComment = await axios.post(`/blog/${blogId}/comment`, {
      comment: comment,
    });

    const newComments = [...(blog.comments || []), addedComment];

    updateCache({
      ...blog,
      comments: newComments,
    });
  }

  return (
    <div>
      {isFetching && <span>Loading...</span>}
      {blog && (
        <div>
          <div>...render blog content here</div>
          <div>...render comment list</div>
        </div>
      )}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <button onClick={addComment}>Add comment</button>
      </div>
    </div>
  );
}
```




### usePromise
React hook for handling promises

## Server Side Rendering

not supported now

## Contributing

Please feel free to submit any issues or pull requests.

## License

MIT
