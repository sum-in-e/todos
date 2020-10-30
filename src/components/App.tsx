import React, { useState, useEffect } from "react";
import Router from "./Router";
import { authService } from "../fbase";

interface IUser {
  displayName: string | null;
  updateProfile: (args: object) => void;
}

function App() {
  const [userInfo, setUserInfo] = useState<IUser>({
    displayName: null,
    updateProfile: (args) => args,
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  useEffect(() => {
    authService.onAuthStateChanged((loggedUser: firebase.User | null): void => {
      if (loggedUser) {
        setUserInfo({
          displayName: loggedUser.displayName,
          updateProfile: (args) => loggedUser.updateProfile(args),
        });
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  }, []);

  const reRender = (): void => {
    const loggedUser: firebase.User | null = authService.currentUser;
    if (loggedUser) {
      setUserInfo({
        displayName: loggedUser.displayName,
        updateProfile: (args) => loggedUser.updateProfile(args),
      });
    }
  };

  return (
    <>
      {init ? (
        <Router
          userInfo={userInfo}
          isLoggedIn={isLoggedIn}
          reRender={reRender}
        />
      ) : (
        "초기화중..."
      )}
    </>
  );
}

export default App;
