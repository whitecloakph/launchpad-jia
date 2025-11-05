import React from "react";

interface TableLoaderProps {
  columns?: number;
  type?: "candidates" | "careers" | "interviews" | "feedback" | "members" | "job-openings" | "career-applicants" | "careers-v2";
}

const TableLoader: React.FC<TableLoaderProps> = ({ type = "candidates" }) => {
  const renderLoaderRow = () => {
    if (type === "job-openings") {
      return (
        <div className="job-item">
          <div className="job-title">
            <h2>
              <div
                className="skeleton-bar"
                style={{ animationDuration: "2.3s" }}
              ></div>
            </h2>
            <small>
              <div className="skeleton-bar"></div>
            </small>
          </div>

          <div className="cta">
            <span>
              <div className="skeleton-bar"></div>
            </span>
            <i className="la la-arrow-circle-right"></i>
          </div>
        </div>
      );
    }

    if (type === "candidates") {
      return (
        <tr>
          <th scope="row">
            <div className="media align-items-center">
              <div
                className="avatar rounded-circle mr-3 bg-gray-300 blink-2"
                style={{ width: "48px", height: "48px" }}
              ></div>
              <div className="media-body">
                <div
                  className="bg-gray-300 rounded"
                  style={{ width: "120px", height: "16px" }}
                >
                  <div
                    className="skeleton-bar blink-2"
                    style={{ width: "120px" }}
                  ></div>
                </div>
              </div>
            </div>
          </th>
          <td>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "150px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "150px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded"
              style={{ width: "100px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "100px" }}
              ></div>
            </div>
          </td>
        </tr>
      );
    } else if (type === "members") {
      return (
        <tr>
          <td>
            <div className="media align-items-center">
              <div
                className="avatar avatar-md rounded-circle mr-2 bg-gray-300 blink-2"
                style={{ width: "48px", height: "48px" }}
              ></div>
              <div className="media-body">
                <div
                  className="bg-gray-300 rounded"
                  style={{ width: "120px", height: "16px" }}
                >
                  <div
                    className="skeleton-bar blink-2"
                    style={{ width: "120px" }}
                  ></div>
                </div>
              </div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "150px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "150px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "150px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "150px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "150px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "150px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "150px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "150px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "150px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "150px" }}
              ></div>
            </div>
          </td>
        </tr>
      );
    } else if (type === "careers") {
      return (
        <tr>
          <th scope="row">
            <div className="media align-items-center">
              <div className="media-body">
                <div
                  className="bg-gray-300 rounded"
                  style={{ width: "150px", height: "16px" }}
                >
                  <div
                    className="skeleton-bar blink-2"
                    style={{ width: "150px" }}
                  ></div>
                </div>
              </div>
            </div>
          </th>
          <td>
            <div
              className="bg-gray-300 rounded"
              style={{ width: "80px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "80px" }}
              ></div>
            </div>
          </td>
          <td>
            <div className="avatar-group">
              {[1, 2].map((_, idx) => (
                <div
                  key={idx}
                  className="avatar avatar-sm rounded-circle bg-gray-300 blink-2"
                  style={{ width: "32px", height: "32px" }}
                ></div>
              ))}
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded"
              style={{ width: "100px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "100px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded"
              style={{ width: "100px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "100px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded"
              style={{ width: "80px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "80px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="bg-gray-300 rounded"
              style={{ width: "24px", height: "24px" }}
            ></div>
          </td>
        </tr>
      );
    } else if (type === "interviews") {
      return (
        <tr>
          <th scope="row">
            <div className="media align-items-center">
              <div
                className="avatar rounded-circle mr-3 skeleton-bar blink-2"
                style={{ width: "48px", height: "48px" }}
              ></div>
              <div className="media-body">
                <div
                  className="skeleton-bar blink-2"
                  style={{ width: "120px" }}
                ></div>
              </div>
            </div>
          </th>
          <td className="budget">
            <div
              className="skeleton-bar blink-2"
              style={{ width: "150px" }}
            ></div>
          </td>
          <td>
            <div
              className="skeleton-bar blink-2"
              style={{ width: "100px" }}
            ></div>
          </td>
          <td>
            <div className="avatar-group">
              <div
                className="skeleton-bar blink-2"
                style={{ width: "100px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="skeleton-bar blink-2"
              style={{ width: "100px" }}
            ></div>
          </td>
          <td>
            <div
              className="skeleton-bar blink-2"
              style={{ width: "100px" }}
            ></div>
          </td>
          <td>
            <div
              className="skeleton-bar blink-2"
              style={{ width: "80px" }}
            ></div>
          </td>
        </tr>
      );
    } else if (type === "feedback") {
      return (
        <tr>
          {[...Array(6)].map((_, idx) => (
            <td key={idx}>
              <div
                className="bg-gray-300 rounded blink-2"
                style={{ width: "100%", height: "16px" }}
              >
                <div
                  className="skeleton-bar blink-2"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </td>
          ))}
        </tr>
      );
    } else if (type === "career-applicants") {
      return (
        <tr>
          <th scope="row">
            <div className="media align-items-center">
              <div
                className="avatar rounded-circle mr-3 bg-gray-300 blink-2"
                style={{ width: "48px", height: "48px" }}
              ></div>
              <div className="media-body">
                <div
                  className="bg-gray-300 rounded"
                  style={{ width: "120px", height: "16px" }}
                >
                  <div
                    className="skeleton-bar blink-2"
                    style={{ width: "120px" }}
                  ></div>
                </div>
              </div>
            </div>
          </th>
          {Array.from({ length: 4 }).map((_, idx) => (
            <td key={idx}>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "150px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "150px" }}
              ></div>
            </div>
          </td>
          ))}
        </tr>
      );
    } else if (type === "careers-v2") {
      return (
        <tr>
            <td>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "250px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "250px" }}
              ></div>
            </div>
          </td>
          {Array.from({ length: 6 }).map((_, idx) => (
            <td key={idx}>
            <div
              className="bg-gray-300 rounded blink-2"
              style={{ width: "100px", height: "16px" }}
            >
              <div
                className="skeleton-bar blink-2"
                style={{ width: "100px" }}
              ></div>
            </div>
          </td>
          ))}
        </tr>
      )
    }
  }

  if (type === "job-openings") {
    return (
      <div
        className="job-list blink-2"
        style={{
          maxHeight: "100%",
          width: "100%",
          border: "none",
          borderTop: "2px solid #ddd",
          borderRadius: "0px",
        }}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <React.Fragment key={index}>{renderLoaderRow()}</React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rowIndex) => (
        <React.Fragment key={rowIndex}>{renderLoaderRow()}</React.Fragment>
      ))}
    </>
  );
};

export default TableLoader;

export const MembersTableLoader = () => (
  <>
    {Array.from({ length: 3 }).map((_, idx) => (
      <tr key={"members-skeleton-" + idx}>
        <td>
          <div className="media align-items-center">
            <div
              className="avatar avatar-md rounded-circle mr-2 bg-gray-300 blink-2"
              style={{ width: "48px", height: "48px" }}
            ></div>
            <div className="media-body">
              <div
                className="bg-gray-300 rounded"
                style={{ width: "120px", height: "16px" }}
              >
                <div
                  className="skeleton-bar blink-2"
                  style={{ width: "120px" }}
                ></div>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div
            className="bg-gray-300 rounded blink-2"
            style={{ width: "150px", height: "16px" }}
          >
            <div
              className="skeleton-bar blink-2"
              style={{ width: "150px" }}
            ></div>
          </div>
        </td>
        <td className="text-right">
          <div
            className="bg-gray-300 rounded blink-2"
            style={{ width: "60px", height: "32px", display: "inline-block" }}
          ></div>
        </td>
      </tr>
    ))}
  </>
);
