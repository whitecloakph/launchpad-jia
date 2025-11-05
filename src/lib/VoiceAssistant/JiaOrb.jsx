import Lottie from "lottie-react";
import orb from "./OrbAnimation.json";
import { useEffect, useState } from "react";

export default function JiaOrb() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let svgTarget = document.querySelector(
      "g[transform='matrix(0.7172130942344666,0,0,0.7172130942344666,511,650.1393432617188)']"
    );

    if (svgTarget.style.display !== "none") {
      svgTarget.style.display = "none";
      setIsLoaded(true);
    }

    console.log("removed water mark");
  }, [isLoaded]);

  return (
    <>
      <Lottie animationData={orb} loop={true} className="orb-avatar" />
    </>
  );
}
