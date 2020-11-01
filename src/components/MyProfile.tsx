import React, { useState } from "react";
import { authService, storageService } from "../fbase";
import styled from "styled-components";
import { Edit } from "styled-icons/boxicons-regular";
import { useHistory } from "react-router-dom";

interface IProps {
  userInfo: {
    displayName: string | null;
    updateProfile: (args: object) => void;
  };
  reRender: () => void;
}

const MyProfile = ({ userInfo, reRender }: IProps) => {
  console.log("MyProfile의 userInfo", userInfo);
  const [userName, setUserName] = useState<string | null>(userInfo.displayName);
  console.log("MyProfile의 userName", userName);
  const [toggleEdit, setToggleEdit] = useState<boolean>(false);
  const history = useHistory();

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (userName !== userInfo.displayName) {
      await userInfo.updateProfile({
        displayName: userName,
      });
      setToggleEdit((prev) => !prev);
      reRender();
    } else if (userName === userInfo.displayName) {
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
    history.push("/");
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
                placeholder="이름을 입력해주세요"
                value={userName && userName ? userName : ""}
                onChange={onChange}
                autoFocus
                required
              />
              <input type="submit" value="저장" />
            </form>
            <button onClick={onToggleClick}>취소</button>
          </>
        ) : (
          <>
            <p>{userName}</p>
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
