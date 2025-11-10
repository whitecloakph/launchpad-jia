import { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { candidateActionToast, copyTextToClipboard, loadingToast, successToast } from "@/lib/Utils";
import { toast } from "react-toastify";

export default function DirectInterviewLinkV2(props: { formData: any, setFormData: (formData: any) => void }) {
  const { user } = useAppContext();

  const { formData, setFormData } = props;

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

    const response = await axios.post("/api/update-career", {
      _id: formData._id,
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
    const directLink = `/direct-interview/${formData._id}`;

    await updateCareer(
      {
        directInterviewLink: directLink,
        updatedAt: Date.now(),
      },
      "Generating Link...",
      "Sucessfully Created Direct Link"
    );

    let dynamicLink = `${window.location.origin}${directLink}`;
    setLink(dynamicLink);
    copyTextToClipboard(dynamicLink);
    setFormData({ ...formData, directInterviewLink: `/direct-interview/${formData._id}` });
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
    setFormData({ ...formData, directInterviewLink: null });
  }

  useEffect(() => {
      if (formData?.directInterviewLink) {
        let dynamicLink = `${window.location.origin.includes("hirejia.ai") ? 
          "https://www.hellojia.ai" : window.location.origin}${formData.directInterviewLink}`;

        setLink(dynamicLink);
      }
  }, [formData?.directInterviewLink]);

  return (
    <>
      {formData && (
          <div className="layered-card-outer">
            <div className="layered-card-middle">
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
             
                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Direct Interview Link</span>
            </div>

            <div className="layered-card-content">
              <>
                {shareLink && (
                  <>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      value={shareLink}
                      readOnly={true}
                    />
                    <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        candidateActionToast(
                            "Career Link Copied to Clipboard",
                            1300,
                            <i className="la la-link mr-1 text-info"></i>
                        );
                    }}
                    >
                    <i className="la la-copy" style={{ fontSize: 20, color: "#535862" }}></i>
                    </div>
                    </div>
                    <span style={{ textAlign: "center", fontSize: 14, color: "#717680", fontWeight: 500 }}>
                      Share this
                      link to an applicant for a direct interview.
                    </span>

                    <div className="btn-set careers-btn-set" style={{ flexDirection: "row", gap: 10 }}>
                      <a href={shareLink} target="_blank">
                        <div style={{ color: "#414651", display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 700, fontSize: 14 }}>
                            <i className="la la-link"></i> Open link
                        </div>
                      </a>
                      <button
                        style={{ color: "#B32318", display: "flex", alignItems: "center", gap: 8, background: "#FEF3F2", border: "1px solid #FEF3F2", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 700, fontSize: 14 }}
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
                <button style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }}
                 onClick={generateLink}>
                  <i className="la la-link text-success" /> Generate Direct
                  Interview Link
                </button>
              )}
            </div>
            </div>
          </div>
      )}
    </>
  );
}
