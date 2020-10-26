import React from "react";
import { authService } from "../fbase";

const MyProfile = () => {
  const onClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    authService.signOut();
  };

  return (
    <div>
      <button onClick={onClick}>Log Out</button>
    </div>
  );
};

export default MyProfile;
