import { APIRequestContext, APIResponse } from '@playwright/test';

type Params = Record<string, string | number>;

/** Generic REST client for a single resource; subclasses set the resource path. */
export abstract class BaseApiClient<T extends { id: number }> {
  protected abstract readonly resource: string;

  constructor(protected readonly request: APIRequestContext) {}

  list(params?: Params): Promise<APIResponse> {
    return this.request.get(this.resource, { params });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`${this.resource}/${id}`);
  }

  create(entity: Omit<T, 'id'>): Promise<APIResponse> {
    return this.request.post(this.resource, { data: entity });
  }

  update(id: number, entity: T): Promise<APIResponse> {
    return this.request.put(`${this.resource}/${id}`, { data: entity });
  }

  patch(id: number, fields: Partial<T>): Promise<APIResponse> {
    return this.request.patch(`${this.resource}/${id}`, { data: fields });
  }

  delete(id: number): Promise<APIResponse> {
    return this.request.delete(`${this.resource}/${id}`);
  }
}
