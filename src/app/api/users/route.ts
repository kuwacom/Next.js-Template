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

export async function GET(request: NextRequest) {
  // Return the list of users as JSON
  return NextResponse.json(users);
}
