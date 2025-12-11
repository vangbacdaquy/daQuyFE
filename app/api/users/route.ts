import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin";
import { UserRecord } from "firebase-admin/auth";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Note: For a production app, you'd want to verify the token
    // and ensure the user has permission to view other users.
    // For this demo, we'll allow any authenticated user to proceed.
    const adminAuth = getAuth(adminApp);
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users.map((userRecord: UserRecord) => {
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: `Failed to list users: ${message}` }, { status: 500 });
  }
}
