import { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { copyTextToClipboard, loadingToast, successToast } from "@/lib/Utils";
import { toast } from "react-toastify";

export default function (props) {
  const { user } = useAppContext();

  const { data } = props;

  console.log(data);

  async function updateCareer(
    dataUpdates: any,
    loadingMessage: string,
    sucessMessage: string
  ) {
    let userInfoSlice = {
      image: user.image,
      name: user.name,
      email: user.email,
    };

    loadingToast(loadingMessage);
    // Handle slug if it's an array or string

    console.log(data._id);

    const response = await axios.post("/api/update-career", {
      _id: data._id,
      lastEditedBy: userInfoSlice,
      ...dataUpdates,
    });

    if (response.status === 200) {
      successToast(sucessMessage, 1200);
      toast.dismiss("loading-toast");
    }
  }

  const [shareLink, setLink] = useState(null);

  async function generateLink() {
    const directLink = `/direct-interview/${data._id}`;

    await updateCareer(
      {
        directInterviewLink: directLink,
        updatedAt: Date.now(),
      },
      "Generating Link...",
      "Sucessfully Created Direct Link"
    );

    let dynamicLink = `${
      window.location.origin.includes("hirejia.ai")
        ? "https://www.hellojia.ai"
        : window.location.origin
    }${directLink}`;
    setLink(dynamicLink);
    copyTextToClipboard(dynamicLink);
  }

  async function disableLink() {
    await updateCareer(
      {
        directInterviewLink: null,
        updatedAt: Date.now(),
      },
      "Removing Direct Link",
      "Sucessfully Removed Direct Link"
    );

    setLink(null);
  }

  useEffect(() => {
    if (data) {
      if (data.directInterviewLink) {
        let dynamicLink = `${window.location.origin}${data.directInterviewLink}`;

        setLink(dynamicLink);
      }
    }
  }, [data]);

  return (
    <>
      {data && (
        <>
          <div className="card shadow-1 mt-4 fade-in-bottom">
            <div className="card-header">
              <h3 className="mb-0 mr-auto">
                <i className="la la-link text-primary mr-2" /> Direct Interview
                Link
              </h3>

              <i className="la la-bars text-primary mr-2" />
            </div>

            <div className="card-body">
              <>
                {shareLink && (
                  <>
                    <small className="text-black">
                      <i className="la la-square text-primary"></i> Share this
                      link to an applicant for a direct interview.
                    </small>

                    <input
                      type="text"
                      className="form-control"
                      value={shareLink}
                    />

                    <div className="btn-set careers-btn-set">
                      <a href={shareLink} target="_blank" className="mr-2">
                        <button className="btn btn-primary">
                          <i className="la la-link"></i> Open
                        </button>
                      </a>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          copyTextToClipboard(shareLink);
                        }}
                      >
                        <i className="la la-copy"></i> Copy
                      </button>
                      <button
                        className="btn btn-outline-default"
                        onClick={disableLink}
                      >
                        <i className="la la-square text-danger"></i> Disable
                        Link
                      </button>
                    </div>
                  </>
                )}
              </>

              {!shareLink && (
                <button className="btn btn-default" onClick={generateLink}>
                  <i className="la la-link text-success" /> Generate Direct
                  Interview Link
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
