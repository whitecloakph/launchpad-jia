import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { getStage } from "@/lib/Utils";

export async function GET(request: Request) {
  const { db } = await connectMongoDB();
  const { searchParams } = new URL(request.url);
  const careerID = searchParams.get("careerID");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search");
  const filterStage = searchParams.get("filterStage");
  const filterStatus = searchParams.get("filterStatus");
  const sortBy = searchParams.get("sortBy");
  try {
    const filter = getFilter(careerID, search, filterStage, filterStatus);
    const sort = getSort(sortBy);
    const applicants = await db.collection("interviews").aggregate([
      { $match: filter },
      { 
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          nameLower: {
            $toLower: "$name"
          },
          email: 1,
          applicationStatus: 1,
          currentStep: 1,
          status: 1,
          updatedAt: {
            $toDate: "$updatedAt"
          },
          createdAt: {
            $toDate: "$createdAt"
          },
        }
      },
      { $sort: sort },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ])
    .toArray();
    const totalApplicants = await db.collection("interviews").countDocuments(filter);
    const totalPages = Math.ceil(totalApplicants / limit);
    
    return NextResponse.json({ applicants: applicants.map((a) => {
        return {
          ...a,
          stage: getStage(a),
        }
    }), totalPages, totalApplicants });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 });
  }
}

const getFilter = (careerID: string, search: string, filterStage: string, filterStatus: string) => {
    const filter: any = { id: careerID };

    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    if (filterStatus) {
      if (filterStatus === "All Statuses") {
        filter.applicationStatus = {$in: ["Ongoing", "Dropped", "Hired", "Cancelled", null]};
      } else if (filterStatus === "Ongoing") {
        filter.applicationStatus = {$in: ["Ongoing", null]};
      } else {
        filter.applicationStatus = filterStatus;
      }
    }

    if (filterStage) {
      if (filterStage === "All Stages") {
        return {
          ...filter,
          currentStep: { $ne: "Applied" }
        }
      }
      
      if (filterStage === "CV Review") {
        return {
          ...filter,
          currentStep: "CV Screening",
          status: { $ne: "For AI Interview" }
        }
      }

      if (filterStage === "Pending AI Interview") {
        return {
          ...filter,
          $or: [
            { status: "For Interview", currentStep: { $in: ["AI Interview", null] }},
            { status: "For AI Interview", currentStep: "CV Screening" }
          ]
        }
      }

      if (filterStage === "AI Interview Review") {
        return {
          ...filter,
          status: { $ne: "For Interview" },
          currentStep: { $in: ["AI Interview", null] }
        }
      }

      if (filterStage === "For Human Interview") {
        return {
          ...filter,
          status: "For Human Interview",
          currentStep: "Human Interview"
        }
      }

      if (filterStage === "Human Interview Review") {
        return {
          ...filter,
          status: "For Human Interview Review",
          currentStep: "Human Interview"
        }
      }

      if (filterStage === "Pending Job Interview") {
        return {
          ...filter,
          status: "For Interview",
          currentStep: "Job Interview"
        }
      }

      if (filterStage === "Job Offered") {
        return {
          ...filter,
          status: "Accepted",
          currentStep: "Job Offered"
        }
      }

      if (filterStage === "Contract Signed") {
        return {
          ...filter,
          status: "Accepted",
          currentStep: "Contract Signed"
        }
      }

      return {
        ...filter,
        status: filterStage,
      }
  }
  return filter;
}

const getSort = (sortBy: string) => {
  if (sortBy === "Recent Activity") {
    return { updatedAt: -1, _id: -1 };
  }

  if (sortBy === "Oldest Activity") {
    return { updatedAt: 1, _id: -1 };
  }

  if (sortBy === "Date Applied (Newest First)") {
    return { createdAt: -1, _id: -1 };
  }

  if (sortBy === "Date Applied (Oldest First)") {
    return { createdAt: 1, _id: -1 };
  }

  if (sortBy === "Alphabetical (A-Z)") {
    return { nameLower: 1, _id: -1 };
  }

  if (sortBy === "Alphabetical (Z-A)") {
    return { nameLower: -1, _id: -1 };
  }

  return { _id: -1 };
}