import { NextRequest, NextResponse } from "next/server";

import {
  apiError,
  apiHandler,
  ErrorCode,
  readJsonBody,
} from "@/lib/apiError";
import { userParamsSchema, userRequestSchema } from "@/schemas/user";
import { users } from "@/services/UserService";

type UserRouteContext = {
  params: Promise<{ userId: string }>;
};

async function getValidatedUserId(params: Promise<{ userId: string }>) {
  const validation = userParamsSchema.safeParse(await params);

  if (!validation.success) {
    throw apiError(ErrorCode.VALIDATION_ERROR, validation.error.issues);
  }

  return validation.data.userId;
}

export const GET = apiHandler<UserRouteContext>(async (_, { params }) => {
  const id = await getValidatedUserId(params);
  const user = users.find((item) => item.id === id);

  if (!user) {
    throw apiError(ErrorCode.NOT_FOUND, "User");
  }

  return NextResponse.json(user);
});

export const PUT = apiHandler<UserRouteContext>(
  async (request: NextRequest, { params }) => {
    const id = await getValidatedUserId(params);
    const body = await readJsonBody(request);
    const validation = userRequestSchema.safeParse(body);

    if (!validation.success) {
      throw apiError(ErrorCode.VALIDATION_ERROR, validation.error.issues);
    }

    const userIndex = users.findIndex((item) => item.id === id);

    if (userIndex === -1) {
      throw apiError(ErrorCode.NOT_FOUND, "User");
    }

    users[userIndex] = {
      id,
      name: validation.data.name,
      email: validation.data.email,
    };

    return NextResponse.json(users[userIndex]);
  },
);

export const DELETE = apiHandler<UserRouteContext>(async (_, { params }) => {
  const id = await getValidatedUserId(params);
  const userIndex = users.findIndex((item) => item.id === id);

  if (userIndex === -1) {
    throw apiError(ErrorCode.NOT_FOUND, "User");
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  return NextResponse.json({
    message: "User deleted successfully",
    user: deletedUser,
  });
});
