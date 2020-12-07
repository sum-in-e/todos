import React, { useState, useRef } from 'react';
import { dbService, authService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import ProfileImg from './ProfileImg';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	reRender: () => void;
}

const MyProfile: React.FunctionComponent<IProps> = ({ userInfo, reRender }) => {
	const [userName, setUserName] = useState<string | null>(userInfo.displayName);
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [headerProfileImg, setHeaderProfileImg] = useState<string>('');
	const [profileImg, setProfileImg] = useState<string>('');
	const [newProfileImg, setNewProfileImg] = useState<string>('');
	const [defaultProfileImg, setDefaultProfileImg] = useState<string>('');
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const imgRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const mainRef = React.useRef() as React.MutableRefObject<HTMLElement>;
	const saveRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;
	const editRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const logOutRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

	const onSave = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			try {
				setIsSaving(true);

				// 새 이미지 업로드
				if (newProfileImg !== '') {
					const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
					if (items.length > 0) {
						items[0].delete();
					}
					const imageRef = storageService.ref().child(`${userInfo.uid}/${uuidv4()}`);
					const response = await imageRef.putString(newProfileImg, 'data_url');
					const downLoadUrl = await response.ref.getDownloadURL();
					setProfileImg(downLoadUrl);
					setHeaderProfileImg(downLoadUrl);
					setNewProfileImg('');
					dbService.collection('profile').doc(userInfo.uid).update({
						image: downLoadUrl,
					});
				}

				// 기본 이미지로 변경
				if (defaultProfileImg !== '') {
					setProfileImg(defaultProfileImg);
					setHeaderProfileImg(defaultProfileImg);
					dbService.collection('profile').doc(userInfo.uid).update({
						image: defaultProfileImg,
					});

					const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
					if (items.length > 0) {
						await items[0].delete();
					}
				}

				// 이름 변경
				if (userName !== userInfo.displayName) {
					await userInfo.updateProfile({
						displayName: userName,
					});
					await reRender();
				}
			} catch (err) {
				alert(err.message);
			} finally {
				setTimeout(function () {
					setIsEdit(prev => !prev);
					setIsSaving(false);
				}, 200);
			}
		}
	};

	const onToggleClick = async (e: any): Promise<void> => {
		const value = e.target.value;
		if (value === '취소' && userInfo.uid !== null) {
			try {
				// 이미지 기존걸로 보이게 하기
				const profileDoc = await dbService.collection('profile').doc(userInfo.uid).get();
				const data = profileDoc.data();
				if (data !== undefined) {
					const userProfileImg = data.image;
					await setProfileImg(userProfileImg);
				}
				// 이름 기존걸로 보이게 하기
				setUserName(userInfo.displayName);
			} catch (err) {
				alert(err.message);
			} finally {
				setNewProfileImg('');
				setDefaultProfileImg('');
				setIsEdit(prev => !prev);
			}
		} else if (value === '편집') {
			setIsEdit(prev => !prev);
		}
	};

	const onTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setUserName(value);
	};

	const onMouseOver = (): void => {
		mainRef.current.classList.add('showing');
		window.addEventListener('click', onOutsideClick);
	};

	const onMouseLeave = (): void => {
		mainRef.current.classList.remove('showing');
		window.removeEventListener('click', onOutsideClick);
	};

	const onLogOutClick = (): void => {
		authService.signOut();
	};

	const onProfileClick = (): void => {
		mainRef.current.classList.add('showing');
		window.addEventListener('click', onOutsideClick);
	};

	const onOutsideClick = (e: any): void => {
		const isInside = mainRef.current.contains(e.target as Node);

		if (isInside) {
			console.log('내부 클릭');
			if (logOutRef.current === e.target || logOutRef.current === e.target.parentNode) {
				console.log('로그아웃 클릭');
				window.removeEventListener('click', onOutsideClick);
				onLogOutClick();
			}
			return;
		} else if (imgRef.current === e.target) {
			console.log('showing profile 클릭');
			return;
		} else {
			console.log('바깥 클릭');
			window.removeEventListener('click', onOutsideClick);
			mainRef.current.classList.remove('showing');
		}
	};

	return (
		<Container>
			<ImgWrapper onMouseLeave={onMouseLeave}>
				<ShowingProfileImg
					ref={imgRef}
					onClick={onProfileClick}
					onMouseOver={onMouseOver}
					imgUrl={headerProfileImg}
				/>
			</ImgWrapper>
			<Main ref={mainRef} onMouseLeave={onMouseLeave} onMouseOver={onMouseOver}>
				<HiddenWrapper isSaving={isSaving}>
					<span>저장중...</span>
				</HiddenWrapper>
				<SubmitWrapper>
					{isEdit ? (
						<>
							<ToggleBtn onClick={onToggleClick} value="취소">
								취소
							</ToggleBtn>
							<SaveBtn onClick={onSave} ref={saveRef}>
								저장
							</SaveBtn>
						</>
					) : (
						<ToggleBtn onClick={onToggleClick} value="편집">
							편집
						</ToggleBtn>
					)}
				</SubmitWrapper>
				<EditWrapper ref={editRef}>
					<ProfileImg
						userInfo={userInfo}
						profileImg={profileImg}
						setProfileImg={setProfileImg}
						setHeaderProfileImg={setHeaderProfileImg}
						setNewProfileImg={setNewProfileImg}
						setDefaultProfileImg={setDefaultProfileImg}
						isEdit={isEdit}
					/>
					{isEdit ? (
						<EditNameWrapper>
							<EditName
								type="text"
								placeholder="Name"
								value={userName && userName ? userName : ''}
								onChange={onTextChange}
								autoFocus
								required
							/>
						</EditNameWrapper>
					) : (
						<NameWrapper>
							<ShowingName>{userName ? userName : 'User'}</ShowingName>
						</NameWrapper>
					)}
				</EditWrapper>
				<LogOutWrapper ref={logOutRef}>
					<span>LOG OUT</span>
				</LogOutWrapper>
			</Main>
		</Container>
	);
};

const Container = styled.section`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	position: relative;
	z-index: 10;
`;

/* ********************* Img Wrapper ********************* */

const ImgWrapper = styled.div``;

const ShowingProfileImg = styled.div<{ imgUrl: string }>`
	width: 2rem;
	height: 2rem;
	margin-bottom: 1rem;
	border: 2px solid ${props => props.theme.light.whiteColor};
	border-radius: 50%;
	background-image: url(${props => props.imgUrl});
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	cursor: pointer;
	${({ theme }) => theme.media.portraitTablet`
		width: 2.5rem;
		height: 2.5rem;
		margin-bottom : 1rem;
	`}
`;

/* ********************* Main ********************* */

const Main = styled.main`
	display: none;
	flex-direction: column;
	align-items: center;
	position: absolute;
	top: 3rem;
	height: 12rem;
	width: 9rem;
	border-radius: 15px;
	background-color: ${props => props.theme.light.greenColor};
	box-shadow: 0px 0px 5px 0px rgba(255, 255, 255, 0.84);
	&.showing {
		display: flex;
	}
	${({ theme }) => theme.media.portraitTablet`
		top : 4rem;
	`}
`;

/* ********************* Hidden Wrapper ********************* */
const HiddenWrapper = styled.div<{ isSaving: boolean }>`
	display: ${props => (props.isSaving ? 'flex' : 'none')};
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 0;
	height: inherit;
	width: inherit;
	border-radius: inherit;
	background-color: rgba(49, 49, 49, 0.306);
	font-size: 0.7rem;
	z-index: 15;
`;

/* ********************* Submit Wrapper ********************* */

const SubmitWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	padding: 0.4rem;
`;

const ToggleBtn = styled.button`
	margin-left: 5px;
	border: none;
	border-radius: 10px;
	background: none;
	font-size: 0.6rem;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	outline: none;
	transition: all 0.3s;
	${({ theme }) => theme.media.desktop`
		&:hover {
			color: rgb(199, 149, 55);
			transition: color ease-in-out 0.3s;
		}
	`}
`;

const SaveBtn = styled.button`
	margin-left: 5px;
	border: none;
	border-radius: 10px;
	background: none;
	font-size: 0.6rem;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	outline: none;
	transition: all 0.3s;
	${({ theme }) => theme.media.desktop`
		&:hover {
			color: rgb(199, 149, 55);
			transition: color ease-in-out 0.3s;
		}
	`}
`;

/* ********************* Edit Wrapper ********************* */

const EditWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	padding: 0.5rem 1rem;
`;

const EditNameWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 1rem;
`;

const EditName = styled.input`
	width: 3rem;
	margin-right: 3px;
	border: none;
	border-bottom: 1px solid ${props => props.theme.light.yellowColor};
	background: none;
	font-size: 0.8rem;
	text-align: center;
	color: ${props => props.theme.light.yellowColor};
	&:focus {
		outline: none;
	}
	&::placeholder {
		color: ${props => props.theme.light.grayColor};
	}
`;

const NameWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const ShowingName = styled.span`
	font-size: 0.8rem;
	color: ${props => props.theme.light.yellowColor};
`;

/* ********************* Log Out Wrapper ********************* */
const LogOutWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	bottom: 0px;
	height: 2rem;
	width: 100%;
	border-top: 1px solid ${props => props.theme.light.yellowColor};
	border-radius: 0 0 15px 15px;
	font-size: 0.7rem;
	font-weight: 700;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	transition: all 0.3s;
	${({ theme }) => theme.media.portraitMobile`
		&:active span {
			transform: scale(0.9, 0.9);
		}
		`}
	${({ theme }) => theme.media.landscapeMobile`
		&:active span {
			transform: scale(0.9, 0.9);
		}
		`}
	${({ theme }) => theme.media.portraitTablet`
		&:active span {
			transform: scale(0.9, 0.9);
		}
	`}
	${({ theme }) => theme.media.landscapeTablet`
		&:active span {
			transform: scale(0.9, 0.9);
		}
	`}
	${({ theme }) => theme.media.desktop`
		&:hover {
			background-color: rgb(14, 59, 51);
			transition: background-color ease-in-out 0.3s;
		}
	`}
`;

export default MyProfile;
