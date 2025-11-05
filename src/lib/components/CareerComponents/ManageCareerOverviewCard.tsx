import { successToast } from "@/lib/Utils";

export default function ManageCareerOverviewCard(props: any) {
  const {
    jobTitle,
    description,
    location,
    workSetup,
    workSetupRemarks,
    jobID,
    orgID,
  } = props;

  return (
    <div className="card shadow-1">
      <div className="card-header">
        <h3 className="mb-0 mr-auto">
          <i className="la la-list text-primary mr-2" />
          Career Overview
        </h3>
      </div>

      <div className="card-body">
        <h1>
          <strong>
            <i className="la la-briefcase mr-1 text-primary"></i> {jobTitle}
          </strong>
        </h1>

        <div className="btn-set">
          {orgID !== "682d3fc222462d03263b0881" && (
            <button
              className="btn btn-default btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://hellojia.ai/applicant/job-openings/${jobID}`
                );
                successToast(
                  "Public Job Link Copied to Clipboard",
                  "top-center"
                );
              }}
            >
              <i className="la la-link mr-1 text-info"></i> Copy Public Job Link
            </button>
          )}

          {orgID === "682d3fc222462d03263b0881" && (
            <button
              className="btn btn-default btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://hellojia.ai/whitecloak/job-openings/${jobID}`
                );
                successToast(
                  "WC Careers AI | Public Job Link Copied to Clipboard",
                  "top-center"
                );
              }}
            >
              <i className="la la-link mr-1 text-info"></i> WC Careers AI | Copy
              Public Job Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
