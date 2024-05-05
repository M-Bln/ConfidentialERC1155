import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const App: React.FC = () => {
  return <div>Hello, world!</div>;
};

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
