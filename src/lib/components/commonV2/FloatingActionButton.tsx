import styles from "@/lib/styles/commonV2/floatingActionButton.module.scss";
import { assetConstants } from "@/lib/utils/constantsV2";
import { useEffect, useState } from "react";

export default function () {
  const [isVisible, setIsVisible] = useState(false);

  function checkScreen() {
    const width = window.innerWidth;
    const scrollY = window.scrollY || window.pageYOffset;

    setIsVisible(width < 768 && scrollY > 0);
  }

  function handleClick() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    checkScreen();
    window.addEventListener("resize", checkScreen);
    window.addEventListener("scroll", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
      window.removeEventListener("scroll", checkScreen);
    };
  }, []);

  return (
    isVisible && (
      <div className={styles.container} onClick={handleClick}>
        <img alt="" src={assetConstants.arrowV3} />
      </div>
    )
  );
}
