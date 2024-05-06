import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";

const rootHtmlElement = document.getElementById("root");
if (rootHtmlElement) {
  const root = ReactDOM.createRoot(rootHtmlElement);
  root.render(<App />);
}

// import * as React from "react";
// import ReactDOM from "react-dom";
// import App from "./src/App";

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );
