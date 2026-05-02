import { NextRequest, NextResponse } from "next/server";

import {
  apiError,
  apiHandler,
  ErrorCode,
  readJsonBody,
} from "@/lib/apiError";
import { userRequestSchema } from "@/schemas/user";
import { users } from "@/services/UserService";

export const GET = apiHandler(async () => {
  return NextResponse.json(users);
});

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonBody(request);
  const validation = userRequestSchema.safeParse(body);

  if (!validation.success) {
    throw apiError(ErrorCode.VALIDATION_ERROR, validation.error.issues);
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name: validation.data.name,
    email: validation.data.email,
  };

  users.push(newUser);

  return NextResponse.json(newUser, { status: 201 });
});
