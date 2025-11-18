import { NextRequest, NextResponse } from "next/server";

// Define the User type based on OpenAPI schema
interface User {
  id: number;
  name: string;
  email: string;
}

// Example data matching the OpenAPI User schema
const users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const user = users.find((u) => u.id === id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  users[userIndex] = { id, name, email };

  return NextResponse.json(users[userIndex]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  return NextResponse.json({
    message: "User deleted successfully",
    user: deletedUser,
  });
}
