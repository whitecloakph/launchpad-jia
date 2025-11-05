import { useEffect, useState } from "react";
import { superAdminList } from "../SuperAdminUtils";
import { useAppContext } from "../context/AppContext";

export default function (props: any) {
  const [render, setRender] = useState(false);

  const { user } = useAppContext();

  useEffect(() => {
    setTimeout(() => {
      if (user) {
        if (superAdminList.includes(user.email)) {
          console.log("super admin access granted");
        } else {
          window.location.href = "/";
        }
      }
    }, 200);
  }, [user]);

  return <>{render && <>{props.children}</>}</>;
}
