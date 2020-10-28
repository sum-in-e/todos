import React, { useState } from "react";
import { authService } from "../fbase";
import styled from "styled-components";
import { Edit } from "styled-icons/boxicons-regular";

interface IProps {
  user: firebase.User | null;
}

const MyProfile = ({ user }: IProps) => {
  const [userName, setUserName] = useState<string | null>(user!.displayName);
  const [toggleEdit, setToggleEdit] = useState<boolean>(false);

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<any> => {
    e.preventDefault();
    if (userName !== user?.displayName) {
      await user?.updateProfile({
        displayName: userName,
      });
      setToggleEdit((prev) => !prev);
    } else if (userName === user.displayName) {
      alert("변경 사항이 없습니다");
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setUserName(value);
  };

  const onToggleClick = (): void => {
    setToggleEdit((prev) => !prev);
  };

  const onLogOutClick = (): void => {
    authService.signOut();
  };

  return (
    <div>
      <button onClick={onLogOutClick}>Log Out</button>
      <div>
        {toggleEdit ? (
          <>
            <form onSubmit={onSubmit}>
              <input
                type="text"
                value={userName !== null ? userName : "user"}
                onChange={onChange}
              />
              <input type="submit" value="저장" />
            </form>
            <button onClick={onToggleClick}>취소</button>
          </>
        ) : (
          <>
            <p>{userName !== null ? userName : "user"}</p>
            <EditIcon onClick={onToggleClick} />
          </>
        )}
      </div>
    </div>
  );
};

const EditIcon = styled(Edit)`
  width: 20px;
`;

export default MyProfile;
