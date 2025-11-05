import JobDetails from "@/lib/components/screens/JobDetails";
import { use } from "react";

export default function ({ params }) {
  return <JobDetails params={use(params)} />;
}
