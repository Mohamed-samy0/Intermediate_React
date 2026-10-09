import { Suspense } from "react";

import ServerComponent from "./ServerComponent";
import ClientComponent from "./ClientComponent";

export default function App() {
  console.log("rendering app server component");
  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <h1>Notes App</h1>
      <ServerComponent />
      <ClientComponent />
    </Suspense>
  );
}
