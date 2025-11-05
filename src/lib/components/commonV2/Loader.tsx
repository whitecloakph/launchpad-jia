import styles from "@/lib/styles/commonV2/loader.module.scss";
import { assetConstants } from "@/lib/utils/constantsV2";

export default function ({ loaderType, loaderData }) {
  const loaderTypeList = ["career", "application"];

  if (loaderType == loaderTypeList[0]) {
    const { length } = loaderData;

    return Array.from({ length }).map((_, index) => (
      <div className={styles[loaderType]} key={index}>
        <div className={styles.companyDetails}>
          <div className={styles.imageContainer} />
          <div className={styles.textContainer}>
            <span className={styles.jobTitle} />
            <span className={styles.companyName} />
          </div>
        </div>
        <span className={styles.details} />
        <span className={styles.details} />
      </div>
    ));
  }

  if (loaderType == loaderTypeList[1]) {
    const { length } = loaderData;

    return Array.from({ length }).map((_, index) => (
      <div className={styles[loaderType]} key={index}>
        <div className={styles.logo} />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={styles.container}>
            <span className={styles.text} />
            <span className={styles.text} />
          </div>
        ))}
      </div>
    ));
  }

  if (!loaderTypeList.includes(loaderType)) {
    return (
      <div className={styles.default}>
        <img alt="" src={assetConstants.loading} />
        <span>Loading...</span>
      </div>
    );
  }
}
