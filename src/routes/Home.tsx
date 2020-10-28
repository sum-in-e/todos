import React from "react";
import MyProfile from "../components/MyProfile";

interface IProps {
  user: firebase.User | null;
}

const Home = ({ user }: IProps) => {
  return (
    <>
      <p>Home</p>
      <MyProfile user={user} />
    </>
  );
};

export default Home;
