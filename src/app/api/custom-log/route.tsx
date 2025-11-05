import { NextRequest, NextResponse } from "next/server";
import moment from "moment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    // Validate that data is provided
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Data is required",
        },
        { status: 400 }
      );
    }

    // Log the received data
    let customLogData = { ...data };

    customLogData.logTag = "jia-custom-log";
    customLogData.logDate = moment().format("MMM D YYYY HH:mm:ss");

    console.log(customLogData);

    return NextResponse.json({
      success: true,
      message: "Data logged successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to log data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
