// "use client";

// import styles from "@/lib/styles/common/toast.module.scss";
// import { useAppContext } from "@/lib/context/Context";
// import { useEffect, useState } from "react";

// export default function ({ toastType }) {
//   const { setToast } = useAppContext();
//   const [fileName, setFileName] = useState(null);

//   function handleClose() {
//     setToast(false);
//   }

//   useEffect(() => {
//     if (toastType == "fileUpload") {
//       const file = sessionStorage.getItem("fileName");

//       if (file) {
//         sessionStorage.removeItem("fileName");
//         setFileName(file);
//       }
//     }
//   }, []);

//   return (
//     <div className={styles.toastContainer}>
//       {toastType == "fileUpload" && fileName && (
//         <>
//           <img alt="upload" src="/icons/upload.svg" />
//           <div className={styles.textContainer}>
//             {/* TODO (Vince) - Check design of filename */}
//             <span className={styles.title}>Upload successful</span>
//             <span className={styles.description}>{fileName}</span>
//             <span className={styles.description}>
//               was uploaded successfully.
//             </span>
//           </div>
//         </>
//       )}
//       <img
//         className={styles.xIcon}
//         alt="x"
//         src="/icons/x.svg"
//         onClick={handleClose}
//       />
//     </div>
//   );
// }
