import { test, expect } from '../../src/fixtures';
import type { Post } from '../../src/api/PostsClient';

test.describe('Posts API', () => {
  test('GET /posts returns a list of posts', async ({ posts }) => {
    const res = await posts.list();
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');

    const body: Post[] = await res.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        userId: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
      }),
    );
  });

  test('GET /posts?userId filters by user', async ({ posts }) => {
    const res = await posts.list({ userId: 1 });
    expect(res.ok()).toBeTruthy();

    const body: Post[] = await res.json();
    expect(body.length).toBeGreaterThan(0);
    for (const post of body) expect(post.userId).toBe(1);
  });

  test('GET /posts/:id returns a single post', async ({ posts }) => {
    const res = await posts.get(1);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ id: 1, userId: 1 });
  });

  test('GET /posts/:id returns 404 for a missing post', async ({ posts }) => {
    const res = await posts.get(999_999);
    expect(res.status()).toBe(404);
  });

  test('POST /posts creates a post', async ({ posts }) => {
    const newPost = { userId: 1, title: 'Playwright title', body: 'Playwright body' };
    const res = await posts.create(newPost);
    expect(res.status()).toBe(201);

    const body: Post = await res.json();
    expect(body).toMatchObject(newPost);
    expect(body.id).toEqual(expect.any(Number));
  });

  test('PUT /posts/:id replaces a post', async ({ posts }) => {
    const updated = { id: 1, userId: 1, title: 'Updated', body: 'Updated body' };
    const res = await posts.update(1, updated);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  test('PATCH /posts/:id updates a single field', async ({ posts }) => {
    const res = await posts.patch(1, { title: 'Patched' });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ id: 1, title: 'Patched' });
  });

  test('DELETE /posts/:id deletes a post', async ({ posts }) => {
    const res = await posts.delete(1);
    expect(res.status()).toBe(200);
  });
});
