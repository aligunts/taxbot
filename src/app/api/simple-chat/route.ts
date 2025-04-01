import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Just echo back the messages for testing
    return NextResponse.json({
      message: `Received ${messages.length} messages. The last one says: ${messages[messages.length - 1]?.content}`,
      success: true,
    });
  } catch (error: any) {
    console.error("Simple chat error:", error);

    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
