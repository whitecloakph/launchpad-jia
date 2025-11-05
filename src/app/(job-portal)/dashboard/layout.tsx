import Sidebar from "@/lib/components/commonV2/Sidebar";

export const metadata = {
  alternates: { canonical: "https://www.hellojia.ai/dashboard" },
  description: "Dashboard - JIA Job Portal",
  title: "Dashboard - JIA Job Portal",
};

export default function ({ children }) {
  return <Sidebar>{children}</Sidebar>;
}
