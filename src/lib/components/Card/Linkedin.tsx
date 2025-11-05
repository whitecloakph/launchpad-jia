import { useAppContext } from "@/lib/context/AppContext";
import { CORE_API_URL, errorToast, successToast } from "@/lib/Utils";
import axios from "axios";
import Swal from "sweetalert2";
import { useState } from "react";

export default function () {
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  async function LinkedinSync() {
    if (!linkedinUrl.trim()) {
      errorToast("Please enter your LinkedIn profile URL", "top-center");
      return;
    }

    try {
      setIsLoading(true);
      setIsSynced(false);

      Swal.fire({
        icon: "info",
        title: "Syncing with LinkedIn...",
        text: "Please wait while we sync your LinkedIn profile...",
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
      });

      Swal.showLoading();

      const response = await axios.post(`${CORE_API_URL}/linkedin`, {
        email: user.email,
        linkedinUrl: linkedinUrl.trim(),
      });

      console.log(response.data);
      if (response.data.error) {
        Swal.close();
        errorToast(response.data.error, "top-center");
        return;
      }

      // Process the CV chunks from uploadResult
      const cvChunks = response.data.uploadResult.cvChunks;

      // Close the SweetAlert before processing CV chunks
      Swal.close();

      // Dispatch event to parent to process CV chunks
      window.dispatchEvent(
        new CustomEvent("processCVChunks", {
          detail: cvChunks,
        })
      );

      successToast("Successfully synced with LinkedIn!", "top-center");
      setIsSynced(true);
    } catch (error) {
      console.error("LinkedIn sync error:", error);
      Swal.close();
      errorToast(
        "Failed to sync with LinkedIn. Please try again later.",
        "top-center"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="section-header">
        <strong>
          <i className="la la-linkedin text-primary" /> Sync with LinkedIn
        </strong>
        <i className="la la-braille" />
      </div>
      <div className="notice fade-in mb-1">
        <span>
          <i className="la la-info-circle text-primary"></i> Enter your LinkedIn
          profile URL to sync your professional information into your CV.
        </span>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter your LinkedIn profile URL (e.g., https://www.linkedin.com/in/your-profile)"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          disabled={isLoading || isSynced}
        />
      </div>
      <button
        className="btn"
        style={{
          background: "#0077b5",
          color: "white",
          fontWeight: 600,
          borderRadius: 6,
          padding: "10px 24px",
          fontSize: 16,
        }}
        onClick={LinkedinSync}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <i className="la la-spinner la-spin mr-2"></i> Syncing...
          </>
        ) : (
          <>
            <i className="la la-linkedin mr-2"></i> Sync with LinkedIn
          </>
        )}
      </button>
      {isSynced && (
        <div className="notice fade-in mt-2" style={{ color: "#5bb573" }}>
          <span>
            <i className="la la-check-circle"></i> Successfully synced with
            LinkedIn
          </span>
        </div>
      )}
    </>
  );
}
