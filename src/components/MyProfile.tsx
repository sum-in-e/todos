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
	const [isLimited, setIsLimited] = useState<boolean>(false);

	const imgRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const backgroundRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const mainRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
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
					setIsLimited(false);
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
			if (userName !== null && userName.length === 8) {
				setIsLimited(true);
			}
		}
	};

	const onTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		const length = value.length;
		if (length <= 8) {
			setUserName(value);
			if (length <= 7) {
				setIsLimited(false);
			}
			if (length === 8) {
				setIsLimited(true);
			}
		}
	};

	const onLogOutClick = (): void => {
		const warning = confirm('로그아웃 하시겠습니까?');
		if (warning === true) {
			authService.signOut();
		} else {
			window.addEventListener('click', onOutsideClick);
			return;
		}
	};

	const onProfileClick = (): void => {
		mainRef.current.classList.add('showing');
		backgroundRef.current.classList.add('showing');
		window.addEventListener('click', onOutsideClick);
	};

	const onOutsideClick = (e: any): void => {
		const isInside = mainRef.current.contains(e.target as Node);

		if (isInside) {
			if (logOutRef.current === e.target || logOutRef.current === e.target.parentNode) {
				window.removeEventListener('click', onOutsideClick);
				onLogOutClick();
			}
			return;
		} else if (imgRef.current === e.target) {
			return;
		} else {
			window.removeEventListener('click', onOutsideClick);
			backgroundRef.current.classList.remove('showing');
			mainRef.current.classList.remove('showing');
		}
	};

	return (
		<Container>
			<ImgWrapper>
				<ShowingProfileImg ref={imgRef} onClick={onProfileClick} imgUrl={headerProfileImg} />
			</ImgWrapper>
			<Background ref={backgroundRef} />
			<ProfileWrapper ref={mainRef}>
				<HiddenWrapper isSaving={isSaving}>
					<span>저장중...</span>
				</HiddenWrapper>
				<BtnWrapper>
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
				</BtnWrapper>
				<EditWrapper ref={editRef} isEdit={isEdit}>
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
								isLimited={isLimited}
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
			</ProfileWrapper>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	position: relative;
	z-index: 10;
`;

/* ********************* Background ********************* */
const Background = styled.div`
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.6);
	&.showing {
		display: block;
	}
`;

/* ********************* Img Wrapper ********************* */
const ImgWrapper = styled.div`
	z-index: 15;
`;

const ShowingProfileImg = styled.div<{ imgUrl: string }>`
	width: 2rem;
	height: 2rem;
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
	`}
`;

/* ********************* ProfileWrapper ********************* */
const ProfileWrapper = styled.div`
	display: none;
	flex-direction: column;
	align-items: center;
	position: fixed;
	top: 12rem;
	left: 50%;
	z-index: 15;
	transform: translate(-50%, -50%);
	height: 15rem;
	width: 80vw;
	border-radius: 15px;
	background-color: ${props => props.theme.light.greenColor};
	&.showing {
		display: flex;
	}
	${({ theme }) => theme.media.landscapeMobile`
		top : 50%;
		height: 12rem;
		width: 40vw;
	`}
	${({ theme }) => theme.media.portraitTabletS`
		left : 50%;
		width: 60vw;
	`}
	${({ theme }) => theme.media.portraitTablet`
		left : 74%;
		width: 45vw;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		top: 13rem;
		left : 80%;
		width: 35vw;
	`}
	${({ theme }) => theme.media.desktop`
		position : absolute;
		top : 3rem;
		left : unset;
		width: 13rem;
		transform : none;
	`}
`;

/* ********************* Hidden Wrapper ********************* */
const HiddenWrapper = styled.div<{ isSaving: boolean }>`
	display: ${props => (props.isSaving ? 'flex' : 'none')};
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 0;
	z-index: 16;
	height: inherit;
	width: inherit;
	border-radius: inherit;
	background-color: rgba(17, 17, 17, 0.306);
	font-size: 0.7rem;
`;

/* ********************* Submit Wrapper ********************* */

const BtnWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	padding: 0.5rem;
	& > * {
		border: none;
		border-radius: 10px;
		background: none;
		outline: none;
		font-size: 0.7rem;
		font-weight: 700;
		color: ${props => props.theme.light.yellowColor};
		cursor: pointer;
		transition: all 0.3s;
		${({ theme }) => theme.media.desktop`
		&:hover {
			color: rgb(199, 149, 55);
			transition: color ease-in-out 0.3s;
		}
	`}
	}
`;

const ToggleBtn = styled.button``;

const SaveBtn = styled.button``;

/* ********************* Edit Wrapper ********************* */

const EditWrapper = styled.div<{ isEdit: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	padding: ${props => (props.isEdit ? '1rem 1rem 0.5rem 1rem' : '1.5rem 1rem')};
	${({ theme, isEdit }) => theme.media.landscapeMobile`
		${isEdit ? { padding: 0 } : { padding: '1rem' }};
	`}
`;

const EditNameWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 1rem;
`;

const EditName = styled.input<{ isLimited: boolean }>`
	width: 5rem;
	margin-right: 3px;
	border: none;
	border-bottom: 1px solid
		${props => (props.isLimited ? props.theme.light.yellowColor : props.theme.light.whiteColor)};
	background: none;
	font-size: 0.8rem;
	text-align: center;
	color: ${props => (props.isLimited ? props.theme.light.yellowColor : props.theme.light.whiteColor)};
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
	color: ${props => props.theme.light.whiteColor};
`;

/* ********************* Log Out Wrapper ********************* */
const LogOutWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	bottom: 0px;
	height: 2.5rem;
	width: 100%;
	border-top: 1px solid ${props => props.theme.light.yellowColor};
	border-radius: 0 0 15px 15px;
	font-size: 0.7rem;
	font-weight: 700;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	transition: all 0.3s;
	&:active span {
		transform: scale(0.9, 0.9);
	}
	${({ theme }) => theme.media.portraitMobile`
		bottom : 1rem;
		width : 33%;
		height: 1.3rem;
		padding : 0 0.2rem;
		border-radius: 15px;
		${{ border: `1px solid ${theme.light.yellowColor}` }};
	`}
	${({ theme }) => theme.media.landscapeMobile`
		bottom : 0.5rem;
		width : 33%;
		height: 1.3rem;
		padding : 0 0.2rem;
		border-radius: 15px;
		${{ border: `1px solid ${theme.light.yellowColor}` }};
	`}
	${({ theme }) => theme.media.desktop`
		&:hover {
			background-color: rgb(14, 59, 51);
			transition: background-color ease-in-out 0.3s;
		}
	`}
`;

export default MyProfile;
