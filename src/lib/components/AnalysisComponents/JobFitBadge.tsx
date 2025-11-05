import { formatMap } from "@/lib/Utils";

export default function (props) {
  const { data } = props;

  return (
    <>
      {data && (
        <>
          {data.final_assessment && (
            <div className="accord-item">
              <div
                className="job-fit-card"
                style={{
                  background: formatMap(data.final_assessment).background,
                }}
              >
                <small className="ax-tag">
                  <strong>
                    <i className="la la-first-order text-primary" /> AI
                    Assessment
                  </strong>
                </small>
                <h2>
                  <i
                    className={formatMap(data.final_assessment).icon}
                    style={{
                      color: formatMap(data.final_assessment).iconColor,
                    }}
                  />{" "}
                  {data.final_assessment}
                </h2>
                <span>{data.assessment_reason}</span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
