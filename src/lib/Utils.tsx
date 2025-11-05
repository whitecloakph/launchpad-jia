import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:4000";

export function validateEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

export function convertDate(date) {
  let parsedDate = new Date(date);

  let year = parsedDate.getFullYear();
  let month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  let day = String(parsedDate.getDate()).padStart(2, "0");
  let hours = String(parsedDate.getHours()).padStart(2, "0");
  let minutes = String(parsedDate.getMinutes()).padStart(2, "0");
  let seconds = String(parsedDate.getSeconds()).padStart(2, "0");

  // Format as 'YYYY-MM-DD HH:mm:ss'
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const errorToast = (message, duration) => {
  let toastInstance = document.querySelector(".Toastify__toast");

  if (toastInstance) {
    return false;
  }
  toast.error(message, {
    position: "top-center",
    autoClose: duration ? duration : 2500,
    pauseOnHover: false,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    progress: undefined,
  });
};

export const successToast = (message, duration) => {
  let toastInstance = document.querySelector(".Toastify__toast");

  if (toastInstance) {
    return false;
  }

  toast.success(message, {
    position: "top-center",
    autoClose: duration ? duration : 1200,
    pauseOnHover: false,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    progress: undefined,
  });
};

export const loadingToast = (message) => {
  toast.loading(message, {
    toastId: "loading-toast",
    position: "top-center",
    autoClose: 3000,
    pauseOnHover: false,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    progress: undefined,
  });
};

export function ellipsis(text, maxLength) {
  let newText = text;
  if (text.length >= maxLength) {
    newText = newText.substring(0, maxLength) + "...";
  }
  return newText;
}

export function slugify(text) {
  return text.toLowerCase().split(" ").join("-");
}

export const guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    console.error("Clipboard API not supported");
    return;
  }

  navigator.clipboard.writeText(text).then(
    function () {
      successToast("Text copied to clipboard successfully", 1000);
    },
    function (err) {
      console.error("Failed to copy text: ", err);
      errorToast("Failed to Copy", 1000);
    }
  );
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function formatDateToRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export const formatMap = (target) => {
  let formatVals: any = {
    "Strong Fit": {
      icon: "la la-star",
      iconColor: "Green",
      background: `linear-gradient(
            to right,
            rgba(186, 247, 204, 0.71),
            rgba(241, 229, 163, 0.07)
            )`,
    },

    "Good Fit": {
      icon: "la la-check-circle",
      iconColor: "green",
      background: `linear-gradient(
            to right,
            rgba(186, 247, 204, 0.71),
            rgba(65, 81, 74, 0.07)
            )`,
    },

    "Maybe Fit": {
      icon: "la la-exclamation-circle",
      iconColor: "salmon",
      background: `linear-gradient(
            to right,
            rgba(244, 233, 170, 0.71),
            rgba(250, 128, 114, 0.2)
            )`,
    },

    "Not Fit": {
      icon: "la la-times",
      iconColor: "red",
      background: `linear-gradient(
            to right,
            rgba(250, 177, 146, 0.47),
            rgba(250, 128, 114, 0.07)
            )`,
    },
  };

  if (formatVals[target]) {
    return formatVals[target];
  }

  if (!formatVals[target]) {
    return {
      icon: "la la-square",
      iconColor: "royalblue",
      background: `#ddd`,
    };
  }
};

export const interviewQuestionCategoryMap = {
  "CV Validation / Experience": {
    description:
      "Verify resume/curriculum vitae claims and elicit detail on past projects. If no resume/curriculum vitae is attached by the applicant, then generate questions about most recent jobs and those related to job description.",
  },
  Technical: {
    description:
      "Probe job-specific skills listed in the job description. May also ask questions relating to the principles, patterns, concepts in their field.",
  },
  Behavioral: {
    description: "Test work ethics, teamwork, leadership, adaptability.",
  },
  Analytical: {
    description:
      "Present mini-cases or problems to assess problem-solving approach.",
  },
  Others: {
    description:
      "Logistics (work setup, salary, when to start), hobbies, culture fit.",
  },
};

export const workSetupOptions = ["Fully Remote", "Onsite", "Hybrid"];

export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
  }
  return arr;
}

export function scoreColor(score: number): string {
  // Ensure score is within 0-100 range
  const clampedScore = Math.max(0, Math.min(100, score));

  if (clampedScore === 0) {
    return "grey";
  }

  // Define color ranges
  if (clampedScore < 20) {
    // Red range (0-19)
    return "#FF0000";
  }

  if (clampedScore < 40) {
    // Orange range (20-39)
    return "#FF8C00";
  }

  if (clampedScore < 60) {
    // Yellow range (40-59)
    return "#c9bf4d";
  }

  if (clampedScore < 80) {
    return "#3dd9a2";
  }

  // Green range (80-100)
  return "#00CC00";
}

export const getStatusBadge = (status) => {
  switch (status) {
    case "For Interview":
      return "text-info";
    case "For Review":
      return "text-primary";
    case "Accepted":
      return "text-success";
    case "Rejected":
      return "text-danger";
    case "Failed CV Screening":
      return "text-salmon";
    case "Action Required":
      return "text-info blink-1";
    default:
      return "bg-secondary";
  }
};

export function saveContentToFile(content, fileName) {
  // Create a Blob with the content
  const blob = new Blob([content], { type: "text/plain" });

  // Create a temporary anchor element
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;

  // Trigger the download
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export function htmlToPlainText(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const plainText = tempDiv.textContent || tempDiv.innerText || "";
  return plainText.replace(/,/g, " ");
}

export function getStage(a: any) {
  if (
    a.currentStep === "AI Interview" ||
    !a.currentStep ||
    (a.currentStep === "CV Screening" && a.status === "For AI Interview")
  ) {
    if (a.status === "For Interview" || a.status === "For AI Interview")
      return "Pending AI Interview";
    return "AI Interview Review";
  }
  if (a.currentStep === "Human Interview") {
    if (a.status === "For Human Interview Review")
      return "Human Interview Review";
    return "For Human Interview";
  }
  if (a.currentStep === "Job Interview") {
    return "Pending Job Interview";
  }
  if (a.currentStep === "Job Offered") {
    return "Job Offered";
  }
  if (a.currentStep === "Contract Signed") {
    return "Contract Signed";
  }
  if (a.currentStep === "CV Screening") return "CV Review";

  if (a.currentStep === "Applied") return "Applied";
  return a.status;
}

export const applicationStatusMap = {
  "CV Review": {
    nextStage: {
      name: "Pending AI Interview",
      step: "AI Interview",
      status: "For Interview",
    },
    currentStage: {
      step: "CV Screening",
      status: "For CV Screening",
    },
  },
  "Pending AI Interview": {
    nextStage: {
      name: "AI Interview Review",
      step: "AI Interview",
      status: "For AI Interview Review",
    },
    currentStage: {
      step: "CV Screening",
      status: "For AI Interview",
    },
  },
  "AI Interview Review": {
    nextStage: {
      name: "For Human Interview",
      step: "Human Interview",
      status: "For Human Interview",
    },
    currentStage: {
      step: "AI Interview",
      status: "For AI Interview Review",
    },
  },
  "For Human Interview": {
    nextStage: {
      name: "Human Interview Review",
      step: "Human Interview",
      status: "For Human Interview Review",
    },
    currentStage: {
      step: "Human Interview",
      status: "For Human Interview",
    },
  },
  "Human Interview Review": {
    nextStage: {
      name: "Pending Job Interview",
      step: "Job Interview",
      status: "For Interview",
    },
    currentStage: {
      step: "Human Interview",
      status: "For Human Interview Review",
    },
  },
  "Pending Job Interview": {
    nextStage: {
      name: "Job Offered",
      step: "Job Offered",
      status: "Accepted",
    },
    currentStage: {
      step: "Job Interview",
      status: "For Interview",
    },
  },
  "Job Offered": {
    nextStage: {
      name: "Contract Signed",
      step: "Contract Signed",
      status: "Accepted",
    },
    currentStage: {
      step: "Job Offered",
      status: "Accepted",
    },
  },
  "Contract Signed": {
    nextStage: {
      name: "Hired",
      step: "Hired",
      status: "Accepted",
    },
    currentStage: {
      step: "Contract Signed",
      status: "Accepted",
    },
  },
};

export const candidateActionToast = (message, duration, icon) => {
  toast.success(message, {
    className: "custom-toast-container",
    icon: icon,
    position: "top-center",
    autoClose: duration ? duration : 1200,
    pauseOnHover: false,
    hideProgressBar: true,
    closeOnClick: true,
    draggable: false,
    progress: undefined,
  });
};

export const handleCareerFitColor = (fit: string) => {
  if (fit?.includes("Good Fit")) {
    return {
      background: "#EFF6FF",
      color: "#1849D5",
    };
  }
  if (fit?.includes("Strong Fit")) {
    return {
      background: "#ECFDF3",
      color: "#027A48",
    };
  }

  if (fit?.includes("Maybe Fit")) {
    return {
      background: "#F9F5FF",
      color: "#414651",
    };
  }

  return {
    background: "#FEE4E2",
    color: "#B42318",
  };
};

export async function deleteCareer(careerId: string) {
  console.log("deleteCareer", careerId);
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleting career...",
        text: "Please wait while we delete the career...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.post("/api/delete-career", {
          id: careerId,
        });

        if (response.data.success) {
          Swal.fire({
            title: "Deleted!",
            text: "The career has been deleted.",
            icon: "success",
            allowOutsideClick: false,
          }).then(() => {
            window.location.href = "/recruiter-dashboard/careers";
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.error || "Failed to delete the career",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error deleting career:", error);
        Swal.fire({
          title: "Error!",
          text: "An error occurred while deleting the career",
          icon: "error",
        });
      }
    }
  });
}

export const applicantStatusFormatMap = {
  "Ongoing": {
      border: "1px solid #FEDF89",
      backgroundColor: "#FFFAEB",
      color: "#B54708",
      dotColor: "#F79009"
  },
  "Dropped": {
      border: "1px solid #FECDCA",
      backgroundColor: "#FEF3F2",
      color: "#B32318",
      dotColor: "#F04438"
  },
  "Cancelled": {
      border: "1px solid #FECDCA",
      backgroundColor: "#FEF3F2",
      color: "#B32318",
      dotColor: "#F04438"
  },
  "Hired": {
      border: "1px solid #10B981",
      backgroundColor: "#ECFDF3",
      color: "#047857",
      dotColor: "#12B76A"
  },
  "No CV Uploaded": {
      border: "1px solid #E9EAEB",
      backgroundColor: "#F5F5F5",
      color: "#414651",
  }
}

export const extractInterviewAssessment = (summary: any) => {
  if (!summary) return "";

  const strongBulletPoints = summary.slice(summary.indexOf('# Strong Points') + '# Strong Points'.length, summary.indexOf("# Weak Points") - 1).trim();
  const endOfWeakPoints = summary.indexOf("# Final assessment") === -1 ? summary.indexOf("# Final Assessment") : summary.indexOf("# Final assessment");
  const weakBulletPoints = summary.slice(summary.indexOf('# Weak Points') + '# Weak Points'.length, endOfWeakPoints - 1).trim()

  const markdownToHtml = (md: string) => {
    if (!md) return "";
    let html = md;

    html = html.replace(/^(\s*[-*])(.+)$/gm, '<li>$2</li>');

    html = `<ul>${html}</ul>`;

    return html;
  };
  return `<h2>Strong Points</h2>${markdownToHtml(strongBulletPoints)}\n\n<h2>Weak Points</h2>${markdownToHtml(weakBulletPoints)}`;
}

export const getInvitationEmailTemplate = (
  email: string,
  orgName: string,
  role: string
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to bottom, #4f04b9f0, #b79fcf76); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Jia</h1>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">
        Dear ${email},
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">
        We are pleased to invite you to join <strong>${orgName}</strong> on Jia as a <strong>${
  role.charAt(0).toUpperCase() + role.slice(1)
}</strong>. Your expertise and contribution will be valuable to our team.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 30px;">
        To get started, please click the button below to access your account:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.hellojia.ai" 
           style="background: #4f04b9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Click Here to Login
        </a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">
        If you have any questions or need assistance, please don't hesitate to contact us.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333;">
        Best regards,<br>
        The Jia Team
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666666; font-size: 14px;">
      <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
  </div>
`;

export const clearUserSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("isCVAvailable");
  localStorage.removeItem("role");
  localStorage.removeItem("activeOrg");
  localStorage.removeItem("orgList");
}