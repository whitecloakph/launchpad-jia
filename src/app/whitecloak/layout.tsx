import Context from "@/lib/context/Context";
import "@/lib/styles/common/animation.scss";
import "@/lib/styles/common/global.scss";

export const metadata = {
  alternates: {
    canonical: "https://www.hellojia.ai/whitecloak",
  },
  description: "Whitecloak Careers",
  title: "Whitecloak Careers",
};

export default function ({ children }) {
  return <Context>{children}</Context>;
}
