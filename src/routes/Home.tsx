import React from "react";
import MyProfile from "../components/MyProfile";

interface IProps {
  userInfo: {
    uid: string | null;
    displayName: string | null;
    updateProfile: (args: object) => void;
  };
  reRender: () => void;
}

const Home = ({ userInfo, reRender }: IProps) => {
  return (
    <>
      <p>Home</p>
      <MyProfile userInfo={userInfo} reRender={reRender} />
    </>
  );
};

export default Home;
