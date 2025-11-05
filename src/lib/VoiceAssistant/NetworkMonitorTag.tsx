import { useState, useEffect } from "react";

export default function NetworkMonitorTag(props: any) {
  const { setInternetChecked } = props;

  const [connectionStatus, setConnectionStatus] =
    useState<string>("Checking..");
  const [latency, setLatency] = useState<number>(0);
  const [conState, setConState] = useState<string>("checking");

  const pollingIntervalDelay = 2000;

  function checkConnection() {
    const targetUrl = "https://www.gstatic.com/generate_204";

    const startTime = performance.now();

    fetch(targetUrl, { mode: "no-cors" })
      .then((data) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        setLatency(duration);

        if (duration <= 50) {
          setConState("good");
          setConnectionStatus("Strong");
          setInternetChecked(true);
        }

        if (duration > 50 && duration <= 100) {
          setConState("good");
          setConnectionStatus("Good");
          setInternetChecked(true);
        }

        if (duration > 101) {
          setConState("very-slow");
          setConnectionStatus("Poor");
          setInternetChecked(false);
        }

        if (duration > 1500) {
          setConState("bad");
          setConnectionStatus("Bad");
          setInternetChecked(false);
        }
      })
      .catch((error) => {
        setConnectionStatus("No Connection");
        setLatency(0);
        setConState("bad");
        setInternetChecked(false);
      })
      .finally(() => {
        setTimeout(checkConnection, pollingIntervalDelay);
      });
  }

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="network-monitor-tag">
      <div className={`connection-status ${conState}`}>
        <i className="la la-wifi"></i>
        <span>{latency.toFixed(0)}ms</span>
      </div>

      <div className={`connection-status ${conState}`}>
        <i className="la la-bullseye"></i>
        <span>{connectionStatus}</span>
      </div>
    </div>
  );
}
