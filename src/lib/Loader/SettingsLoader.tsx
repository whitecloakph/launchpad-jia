import React from "react";

const SettingsLoader = () => {
  return (
    <div className="thread-set d-flex justify-content-center">
      <div
        className="right-thread"
        style={{ width: "100%", maxWidth: "1000px" }}
      >
        <div className="card shadow-1">
          <div className="card-header">
            <h3 className="mb-0 mr-auto">
              <div
                className="skeleton-bar blink-2"
                style={{ width: "200px" }}
              ></div>
            </h3>
          </div>
          <div className="card-body flex-row">
            <div className="mb-3" style={{ width: "40%" }}>
              <div
                className="skeleton-bar mb-2 blink-2"
                style={{ width: "100px" }}
              ></div>
              <div
                className="skeleton-bar blink-2"
                style={{ height: "38px" }}
              ></div>
              <br />
              <div
                className="skeleton-bar mb-2 blink-2"
                style={{ width: "150px" }}
              ></div>
              <div
                className="skeleton-bar blink-2"
                style={{ height: "38px" }}
              ></div>
              <br />
              <div
                className="skeleton-bar mb-2 blink-2"
                style={{ width: "150px" }}
              ></div>
              <div
                className="skeleton-bar blink-2"
                style={{ height: "38px" }}
              ></div>
              <br />
              <div
                className="skeleton-bar mb-2 blink-2"
                style={{ width: "150px" }}
              ></div>
              <div
                className="skeleton-bar blink-2"
                style={{ height: "38px" }}
              ></div>
              <br />

              <div className="d-flex justify-content-between">
                <div
                  className="skeleton-bar blink-2"
                  style={{ width: "120px", height: "38px" }}
                ></div>
                <div
                  className="skeleton-bar blink-2"
                  style={{ width: "120px", height: "38px" }}
                ></div>
              </div>
            </div>
            <div className="mb-3" style={{ width: "60%" }}>
              <div
                className="skeleton-bar mb-2"
                style={{ width: "100px" }}
              ></div>
              <div
                className="skeleton-bar blink-2"
                style={{ height: "300px", width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLoader; 