import { components, paths } from "./openapi";

export type ContactFormRequest = components["schemas"]["ContactFormRequest"];
export type ContactFieldErrors = components["schemas"]["ContactFieldErrors"];
export type ContactSubmissionStatus =
  components["schemas"]["ContactSubmissionStatus"];
export type ContactSubmissionResult =
  components["schemas"]["ContactSubmissionResult"];
export type User = components["schemas"]["User"];
export type UserResponse = User;
export type UserRequest = components["schemas"]["UserRequest"];
export type DeleteUserResponse = components["schemas"]["DeleteUserResponse"];
export type ApiErrorResponse = components["schemas"]["ApiErrorResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type UserPath = keyof paths;
