import { components, paths } from "./openapi";

export type User = components["schemas"]["User"];
export type UserResponse = User;
export type UserRequest = components["schemas"]["UserRequest"];
export type DeleteUserResponse = components["schemas"]["DeleteUserResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type UserPath = keyof paths;
