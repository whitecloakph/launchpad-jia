export default function(props) {
    const { requireVideo, setRequireVideo } = props;

    return (
        <div className="d-flex align-items-center justify-content-center flex-column">
          <strong>
            <i className="la la-video text-primary mr-2"></i> Require Video Interview
          </strong>
          <button
            className={`btn  ${
              requireVideo ? "btn-primary" : "btn-danger"
            } `}
            style={{maxWidth: "100px", marginTop: "10px"}}
            onClick={() => {
              setRequireVideo(!requireVideo);
            }}
          >
            <i
              className={`la ${
                requireVideo ? "la-video" : "la-video-slash"
              }`}
            ></i>{" "}
            {requireVideo ? "On" : "Off"}
          </button>
        </div>
    )
}