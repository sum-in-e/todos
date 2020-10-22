import React from "react";
import Router from "./Router";
import { authService } from "../fbase";

function App() {
  console.log(authService.currentUser);
  return (
    <div className="App">
      <Router />
    </div>
  );
}

export default App;
