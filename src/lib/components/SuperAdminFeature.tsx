import { useEffect, useState } from "react";
import { superAdminList } from "../SuperAdminUtils";
import { useAppContext } from "../context/AppContext";

export default function (props: any) {
  const [render, setRender] = useState(false);

  const { user } = useAppContext();

  useEffect(() => {
    if (user) {
      if (superAdminList.includes(user?.email)) {
        setRender(true);
      }
    }
  }, [user]);

  return <>{render && <>{props.children}</>}</>;
}
