import "@/lib/styles/commonV2/globals.scss";
import ContextV2 from "@/lib/context/ContextV2";

export const metadata = {
  alternates: { canonical: "https://www.hellojia.ai" },
  description: "JIA Job Portal",
  title: "JIA Job Portal",
};

export default function ({ children }) {
  return <ContextV2>{children}</ContextV2>;
}
