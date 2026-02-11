// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App /> {/* DO NOT wrap App in another <Router> here */}
  </React.StrictMode>
);
