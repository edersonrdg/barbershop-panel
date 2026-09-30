import type { paths } from './schema';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

// Success body of a route, straight from the API contract (e.g.
// `ApiResponse<'/me', 'get'>`), so the panel never keeps a parallel DTO.
export type ApiResponse<
  Path extends keyof paths,
  M extends Method,
  Status extends number = 200,
> = paths[Path][M] extends {
  responses: { [S in Status]: { content: { 'application/json': infer Body } } };
}
  ? Body
  : never;
