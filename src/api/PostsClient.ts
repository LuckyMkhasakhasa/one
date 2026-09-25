import { BaseApiClient } from '../core/BaseApiClient';

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, 'id'>;

/** Client for the /posts resource. */
export class PostsClient extends BaseApiClient<Post> {
  protected readonly resource = '/posts';
}
