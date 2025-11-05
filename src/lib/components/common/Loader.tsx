import styles from "@/lib/styles/common/loader.module.scss";
import { FIGMA_DIMENSIONS } from "@/lib/utils/constants";
import { getWidthPercentage } from "@/lib/utils/helpers";

export default function ({ loaderType, loaderData }) {
  const types = ["jobOpenings", "feedback"];

  if (loaderType == types[0]) {
    return (
      <>
        {Array.from({ length: loaderData.length }).map((_, index) => (
          <div className={styles.cardContainer} key={index}>
            <span className={styles.jobTitle} />
            <span className={styles.jobDetails} />
            <span className={styles.jobDetails} />
          </div>
        ))}
      </>
    );
  }

  if (loaderType == types[1]) {
    const columnDetails = loaderData.columnDetails;
    const length = loaderData.length;
    const tableWidth = FIGMA_DIMENSIONS.TABLE.WIDTH;

    return Array.from({ length }).map((_, index) => (
      <div className={styles.contentContainer} key={index}>
        <div
          className={styles.userContainer}
          style={{
            width: `${getWidthPercentage(columnDetails[0].width, tableWidth)}%`,
          }}
        >
          <div className={styles.userImage} />
          <div className={styles.userDetails} />
        </div>
        <div
          className={styles.position}
          style={{
            width: `${getWidthPercentage(columnDetails[1].width, tableWidth)}%`,
          }}
        >
          <span />
        </div>
        <div
          className={styles.ratingContainer}
          style={{
            width: `${getWidthPercentage(columnDetails[2].width, tableWidth)}%`,
          }}
        >
          <span />
        </div>
        <div
          className={styles.feedback}
          style={{
            width: `${getWidthPercentage(columnDetails[3].width, tableWidth)}%`,
          }}
        >
          <span />
        </div>
        <div
          className={styles.date}
          style={{
            width: `${getWidthPercentage(
              loaderData.columnDetails[4].width,
              tableWidth
            )}%`,
          }}
        >
          <span />
        </div>
      </div>
    ));
  }
}
