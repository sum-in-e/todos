import React from "react";
import { authService } from "../fbase";

interface IProps {
  user: firebase.User | null;
}

const MyProfile = ({ user }: IProps) => {
  const onClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    authService.signOut();
  };

  return (
    <div>
      <button onClick={onClick}>Log Out</button>
      <p>{user !== null ? user.email : "hi"}</p>
    </div>
  );
};

export default MyProfile;
