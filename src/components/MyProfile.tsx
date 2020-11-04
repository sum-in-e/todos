import React, { useState, useEffect } from "react";
import { authService, dbService, storageService } from "../fbase";
import styled from "styled-components";
import { Edit } from "styled-icons/boxicons-regular";
import { useHistory } from "react-router-dom";

interface IProps {
  userInfo: {
    uid: string | null;
    displayName: string | null;
    updateProfile: (args: object) => void;
  };
  reRender: () => void;
}

const MyProfile = ({ userInfo, reRender }: IProps) => {
  const [userName, setUserName] = useState<string | null>(userInfo.displayName);
  const [toggleEdit, setToggleEdit] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string>("");
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

  useEffect(() => {
    const test = async (): Promise<void> => {
      const hi = await dbService
        .collection("profile")
        .where("userId", "==", userInfo.uid)
        .get();

      if (hi.empty) {
        // storage에 있는 default image와, uid를 userId로 넣어서 collection 생성하고 그 결과물을 profileImage state에 넣기
        console.log("docs 없음");
        const defaultImg = await storageService
          .ref()
          .child("defaultProfile.png")
          .getDownloadURL();
        await dbService.collection("profile").add({
          image: defaultImg,
          userId: userInfo.uid,
        });
        setProfileImage(defaultImg);
      } else {
        // false면 user의 uid를 가진 docs가 있다는 거니까, 해당 collection을 가져와서 profileImage state에 넣기
        console.log("docs 있음");
      }
    };
    test();
  }, []);

  return (
    <div>
      <div>
        <ProfileImg />
        <form>
          <input type="file" />
        </form>
      </div>
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
            <p>{userName ? userName : "User"}</p>
            <EditIcon onClick={onToggleClick} />
          </>
        )}
      </div>
      <button onClick={onLogOutClick}>Log Out</button>
    </div>
  );
};

const EditIcon = styled(Edit)`
  width: 20px;
`;

const ProfileImg = styled.div`
  width: 60px;
  height: 60px;
  background-color: black;
  border-radius: 10px;
`;

export default MyProfile;
