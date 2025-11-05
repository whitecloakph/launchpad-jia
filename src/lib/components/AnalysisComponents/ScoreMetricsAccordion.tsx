import { useState } from "react";

export default function (props: any) {
  const [toShow, setToShow] = useState([]);
  const [allShow, setAllShow] = useState(false);

  function toggleShow(key) {
    if (toShow.includes(key)) {
      let keySet = toShow.filter((x) => key !== x);
      setToShow(keySet);
    }

    if (!toShow.includes(key)) {
      setToShow([...toShow, key]);
    }
  }

  function toggleAll() {
    if (allShow) {
      setToShow([]);
    }

    if (!allShow) {
      setToShow(data.map((x) => x.key));
    }

    setAllShow(!allShow);
  }

  const { data } = props;
  return (
    <>
      <div className="accord-thread">
        <div className="section-header mt-2">
          <strong>
            <i className="la la-square text-primary" /> Scoring Rationale
          </strong>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={toggleAll}
          >
            <i className="la la-bars" /> {allShow ? "Hide" : "Show"} All
          </button>
        </div>

        {data &&
          data.map((x: any) => {
            return (
              <div className="accordion-item">
                <div
                  className="header"
                  onClick={() => {
                    toggleShow(x.key);
                  }}
                >
                  <div className="metric-score">
                    <div className="score-item">
                      <span>
                        <i className="la la-cube" />
                      </span>
                    </div>
                    <h3>
                      {x.key}:{" "}
                      <strong className="text-primary">{x.data} / 100</strong>
                    </h3>
                  </div>

                  {!toShow.includes(x.key) && (
                    <button
                      className="btn btn-white"
                      onClick={() => {
                        toggleShow(x.key);
                      }}
                    >
                      <i className="la la-angle-down" />
                    </button>
                  )}

                  {toShow.includes(x.key) && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        toggleShow(x.key);
                      }}
                    >
                      <i className="la la-angle-up" />
                    </button>
                  )}
                </div>

                {toShow.includes(x.key) && (
                  <div className="info-body fade-in">
                    <span>{x.rationale}</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
