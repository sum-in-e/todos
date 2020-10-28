import React, { useState, useEffect } from "react";
import Router from "./Router";
import { authService } from "../fbase";

function App() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  useEffect(() => {
    authService.onAuthStateChanged((loggedUser: firebase.User | null): void => {
      if (loggedUser !== null) {
        setIsLoggedIn(true);
        setUser(loggedUser);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  });

  return (
    <>{init ? <Router user={user} isLoggedIn={isLoggedIn} /> : "초기화중..."}</>
  );
}

export default App;
