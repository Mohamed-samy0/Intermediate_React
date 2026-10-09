import { createElement as h } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.js";

function getShipmentFromServer() {
  const initialData = window.__INITIAL_DATA__ ?? {};
  return {
    shipment: initialData.shipment ?? null,
    userName: initialData.userName ?? "Guest",
  };
}

const { shipment, userName } = getShipmentFromServer();

hydrateRoot(document.getElementById("root"), h(App, { shipment, userName }));
