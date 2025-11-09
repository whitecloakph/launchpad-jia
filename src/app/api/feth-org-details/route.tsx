import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { orgID } = await req.json();

    if (!orgID) {
      return Response.json(
        { error: "Missing orgID parameter" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Try to convert orgID to ObjectId if possible, else use as string
    let query;
    try {
      query = { _id: new ObjectId(orgID) };
    } catch (e) {
      query = { _id: orgID };
    }

    const orgDoc = await db.collection("organizations").aggregate([
      {
        $match: query
      },
      {
        $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
                {
                    $addFields: {
                        _idStr: { $toString: "$_id" }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$$planId", null] },
                                { $ne: ["$$planId", ""] },
                                { $eq: ["$_idStr", "$$planId"] }
                            ]
                        }
                    }
                }
            ],
            as: "plan"
        }
    },
    {
      $unwind: {
        path: "$plan",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        plan: {
          $ifNull: [
            "$plan",
            {
              _id: "default",
              name: "Default Plan",
              jobLimit: 100, // High default limit for development
              createdAt: new Date()
            }
          ]
        }
      }
    }
    ]).toArray();

    if (!orgDoc || orgDoc.length === 0) {
      return Response.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return Response.json(orgDoc[0]);
  } catch (error) {
    console.error("Error in feth-org-details endpoint:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
