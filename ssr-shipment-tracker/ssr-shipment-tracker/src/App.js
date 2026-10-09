import { createElement as h, useEffect, useState } from "react";

// This component runs on BOTH the server and the browser.
// Requirements: 1 (shipment info), 2 (interactive button), 3 (local time, no mismatch)

export default function App({ shipment, userName = "Guest" }) {
  const [count, setCount] = useState(0);
  const [localLastUpdate, setLocalLastUpdate] = useState(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    setLocalLastUpdate(formatter.format(new Date(shipment.lastUpdate)));
  }, [shipment.lastUpdate]);

  return h(
    "div",
    null,
    h("p", null, `User: ${userName}`),
    h("h1", null, "Shipment Tracker"),
    h("p", null, `Tracking Number: ${shipment.trackingNumber}`),
    h("p", null, `Status: ${shipment.status}`),
    h("p", null, `Last Update: ${localLastUpdate ?? shipment.lastUpdate}`),
    h("button", { onClick: () => setCount(count + 1) }, `Count: ${count}`),
  );
}
