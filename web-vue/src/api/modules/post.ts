import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Post } from "../types";

export function getPosts(params: ListParams) {
  return get<Post[]>(qs("/api/get-posts", params)) as Promise<PaginatedResponse<Post>>;
}

export function getPost(owner: string, name: string) {
  return get<Post>(idQuery("/api/get-post", owner, name));
}

export function addPost(post_: Partial<Post>) {
  return post("/api/add-post", post_);
}

export function updatePost(owner: string, name: string, post_: Partial<Post>) {
  return post(idQuery("/api/update-post", owner, name), post_);
}

export function deletePost(post_: Partial<Post>) {
  return post("/api/delete-post", post_);
}
