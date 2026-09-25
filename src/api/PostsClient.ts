import { APIRequestContext, APIResponse } from '@playwright/test';

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, 'id'>;

/** Thin wrapper around the /posts resource. */
export class PostsClient {
  constructor(private readonly request: APIRequestContext) {}

  list(params?: Record<string, string | number>): Promise<APIResponse> {
    return this.request.get('/posts', { params });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/posts/${id}`);
  }

  create(post: NewPost): Promise<APIResponse> {
    return this.request.post('/posts', { data: post });
  }

  update(id: number, post: Post): Promise<APIResponse> {
    return this.request.put(`/posts/${id}`, { data: post });
  }

  patch(id: number, fields: Partial<Post>): Promise<APIResponse> {
    return this.request.patch(`/posts/${id}`, { data: fields });
  }

  delete(id: number): Promise<APIResponse> {
    return this.request.delete(`/posts/${id}`);
  }
}
