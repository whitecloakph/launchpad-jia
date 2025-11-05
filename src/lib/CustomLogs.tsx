import axios from "axios";

export const customLog = (data: any) => {
  axios.post("/api/custom-log", {
    data: data,
  });
};
