import { users } from "@/services/UserService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return the list of users as JSON
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name,
    email,
  };
  users.push(newUser);

  console.log(users);
  return NextResponse.json(newUser, { status: 201 });
}
