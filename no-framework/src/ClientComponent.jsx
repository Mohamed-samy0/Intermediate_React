"use client";

import { useState } from "react";

export default function ClientComponent() {
  console.log("rendering ClientComponent client component");
  const [counter, setCounter] = useState(0);
  return (
    <fieldset>
      <legend>Client component</legend>
      <p>Counter {counter}</p>
      <button onClick={() => setCounter(counter + 1)}>Increment</button>
      <button onClick={() => setCounter(counter - 1)}>Decrement</button>
    </fieldset>
  );
}
