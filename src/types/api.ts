import { components, paths } from "./openapi";

export type User = components["schemas"]["User"];
export type UserResponse = User;
export type UserRequest =
  paths["/users/{id}"]["put"]["requestBody"]["content"]["application/json"];
