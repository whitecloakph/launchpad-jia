import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { toast } from "react-toastify";
import { errorToast, loadingToast, successToast } from "../Utils";
import Swal from "sweetalert2";
import styles from "@/lib/styles/commonV2/modal.module.scss";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(type) {
  const res = await auth.signInWithPopup(googleProvider).catch((err) => {
    errorToast("Login Cancelled by User");
  });

  if (!res) {
    return false;
  }

  const profile = res.additionalUserInfo.profile;

  loadingToast("Logging in...");

  localStorage.authToken = res.user._delegate.accessToken;

  localStorage.user = JSON.stringify({
    email: profile.email,
    image: profile.picture,
    name: profile.name,
    role: type,
  });

  axios
    .post("/api/auth", {
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    })
    .then(async (res) => {
      if (
        res.data.error &&
        profile.email.split("@")[1] !== "whitecloak.com" &&
        !profile.email.split("@")[1].includes("shae")
      ) {
        errorToast(res.data.error);
        console.log(res.data);
      }

      toast.dismiss("loading-toast");

      successToast("Login successful");

      const host = window.location.host;

      if (
        (host.includes("localhost") || host.includes("hirejia.ai")) &&
        res.data.role == "applicant"
      ) {
        Swal.fire({
          title: "No Account Found",
          text: `There's no employer account associated with your login ${res.data.email}.`,
          icon: "warning",
          showCancelButton: true, // second button
          confirmButtonText: "OK",
          cancelButtonText: "I'm a job seeker",
          customClass: {
            title: styles.swalTitle,
            icon: styles.swalIcon,
            confirmButton: styles.swalConfirmButton,
            cancelButton: styles.swalCancelButton,
            htmlContainer: styles.swalDescription,
            popup: styles.swalContainer,
            actions: styles.swalAction,
          },
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.close();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = host.includes("localhost")
              ? "/job-portal"
              : "https://www.hellojia.ai";
          }
        });

        localStorage.removeItem("user");
        return false;
      }

      // handle direct interview link redirects
      if (window.location.search.includes("?directInterviewID")) {
        let directInterviewID = window.location.search.split(
          "?directInterviewID="
        )[1];

        if (directInterviewID) {
          window.location.href = `/direct-interview/${directInterviewID}`;
        }

        return false;
      }

      if (type === "whitecloak-careers") {
        if (sessionStorage.redirectionPath) {
          const redirectionPath = sessionStorage.getItem("redirectionPath");
          sessionStorage.removeItem("redirectionPath");
          window.location.href = redirectionPath;
        } else {
          window.location.href = "/whitecloak/applicant";
        }
        return false;
      }

      if (type === "job-portal") {
        if (sessionStorage.redirectionPath) {
          const redirectionPath = sessionStorage.getItem("redirectionPath");
          sessionStorage.removeItem("redirectionPath");
          window.location.href = redirectionPath;
        } else {
          window.location.href = "/dashboard";
        }
        return false;
      }

      // maintain flow
      if (window.location.search.includes("?redirect=")) {
        let redirect = window.location.search.split("?redirect=")[1];

        if (redirect) {
          window.location.href = redirect;
        }

        return false;
      }

      if (host.startsWith("admin.hirejia.ai")) {
        localStorage.role = "admin";
        window.location.href = "/admin-portal";
        return;
      }

      let orgData = await axios.post("/api/get-org", {
        user: profile,
      });

      if (orgData.data.length == 0) {
        localStorage.role = "applicant";
        window.location.href = window.location.origin.includes("localhost")
          ? "/job-portal"
          : "https://www.hellojia.ai";
        return;
      }

      if (orgData.data.length > 0) {
        localStorage.role = "admin";
        const activeOrg = localStorage.activeOrg;

        localStorage.activeOrg = activeOrg
          ? activeOrg
          : JSON.stringify(orgData.data[0]);
        localStorage.orgList = JSON.stringify(orgData.data);

        const parsedActiveOrg = JSON.parse(localStorage.activeOrg);

        if (parsedActiveOrg.role == "hiring_manager") {
          window.location.href = `/recruiter-dashboard/careers?orgID=${parsedActiveOrg._id}`;
        } else {
          window.location.href = `/recruiter-dashboard?orgID=${parsedActiveOrg._id}`;
        }
      }
    })
    .catch((error) => {
      console.error("Google login error", error);
      errorToast("Google login failed");
      toast.dismiss("loading-toast");
    });
}

export function signInWithMicrosoft() {
  const provider = new firebase.auth.OAuthProvider("microsoft.com");
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      // Handle successful sign-in
      const profile = result.user["_delegate"];

      localStorage.authToken = result.user._delegate.accessToken;

      loadingToast("Logging in.");
      axios
        .post("/api/auth", {
          name: profile.email.split("@")[0],
          email: profile.email,
          image: `https://api.dicebear.com/8.x/shapes/svg?seed=${
            profile.email.split("@")[0]
          }`,
        })
        .then((res) => {
          if (res.data.error) {
            errorToast(res.data.error);
            toast.dismiss("loading-toast");
          }

          if (res.data.name) {
            localStorage.user = JSON.stringify(res.data);
            window.location.href = "/dashboard";
          }
        });
    })
    .catch((error) => {
      // Handle errors
      console.error("Microsoft login error", error);
      errorToast("Microsoft login failed");
    });
}

export const firebaseAuth = firebase.auth();

export default firebase;
