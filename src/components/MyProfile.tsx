import React, { useState, useRef, useEffect, useContext } from 'react';
import { dbService, authService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { Edit3 } from 'styled-icons/feather';
import { UserStateContext } from '../components/App';

interface IProps {
	reRender: () => void;
}

const MyProfile: React.FunctionComponent<IProps> = ({ reRender }) => {
	const userInfo = useContext(UserStateContext);
	const [userName, setUserName] = useState<string | null>(userInfo.displayName);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [headerProfileImg, setHeaderProfileImg] = useState<string>('');
	const [profileImg, setProfileImg] = useState<string>('');
	const [newProfileImg, setNewProfileImg] = useState<string>('');
	const [defaultProfileImg, setDefaultProfileImg] = useState<string>('');
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isLimited, setIsLimited] = useState<boolean>(false);
	const [isShowing, setIsShowing] = useState<boolean>(false);

	const fileRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;

	const onClickImg = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const img = e.currentTarget as HTMLDivElement;
		if (isEditing) {
			(img.nextSibling as HTMLInputElement).click();
		}
	};

	const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const {
			target: { files },
		} = e;

		if (files !== null) {
			try {
				const theFile = files[0];
				const reader = new FileReader();
				reader.readAsDataURL(theFile);
				reader.onload = (): void => {
					const result = reader.result;
					if (result !== null) {
						const dataUrl = result.toString();
						setNewProfileImg(dataUrl);
						setProfileImg(dataUrl);
						setDefaultProfileImg('');
					}
				};
			} catch (err) {
				alert('이미지 불러오기에 실패하였습니다. 재시도해주세요.');
			} finally {
				fileRef.current.value = '';
			}
		}
	};

	const onClickDefaultImg = async (): Promise<void> => {
		try {
			const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
			setProfileImg(defaultImg);
			setDefaultProfileImg(defaultImg);
			setNewProfileImg('');
		} catch (err) {
			alert('기본 이미지 불러오기에 실패하였습니다. 재시도해주세요.');
		}
	};

	const onClickSave = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			try {
				setIsSaving(true);
				// 이름 변경
				if (userName !== userInfo.displayName) {
					try {
						await userInfo.updateProfile({
							displayName: userName,
						});
					} catch (err) {
						alert('유저명 변경에 실패하였습니다. 재시도해주세요.');
						setUserName(userInfo.displayName);
					} finally {
						await reRender();
					}
				}

				// 새 이미지 업로드
				if (newProfileImg !== '') {
					const imageRef = storageService.ref().child(`${userInfo.uid}/${uuidv4()}`);
					const response = await imageRef.putString(newProfileImg, 'data_url');
					const downLoadUrl = await response.ref.getDownloadURL();
					const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
					const previousImageIndex = items.findIndex(item => item.name !== imageRef.name);
					if (previousImageIndex > -1) {
						items[previousImageIndex].delete();
					}
					setProfileImg(downLoadUrl);
					setHeaderProfileImg(downLoadUrl);
					setNewProfileImg('');
					await dbService.collection('profile').doc(userInfo.uid).update({
						image: downLoadUrl,
					});
				}

				// 기본 이미지로 변경
				if (defaultProfileImg !== '') {
					const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
					setProfileImg(defaultProfileImg);
					setHeaderProfileImg(defaultProfileImg);
					dbService.collection('profile').doc(userInfo.uid).update({
						image: defaultProfileImg,
					});
					if (items.length > 0) {
						items.forEach(item => item.delete());
					}
				}
			} catch (err) {
				alert('이미지 변경에 실패하였습니다. 재시도해주세요.');
				const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
				const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
				setProfileImg(defaultImg);
				setHeaderProfileImg(defaultImg);
				setNewProfileImg('');
				if (items.length > 0) {
					items.forEach(item => item.delete());
				}
				dbService.collection('profile').doc(userInfo.uid).update({
					image: defaultImg,
				});
			} finally {
				setTimeout(function () {
					setIsLimited(false);
					setIsEditing(prev => !prev);
					setIsSaving(false);
				}, 200);
			}
		}
	};

	const onClickToggle = async (e: any): Promise<void> => {
		const value = e.target.value;
		if (value === '취소' && userInfo.uid !== null) {
			try {
				const profileDoc = await dbService.collection('profile').doc(userInfo.uid).get();
				const data = profileDoc.data();
				if (data !== undefined) {
					const userProfileImg = data.image;
					setProfileImg(userProfileImg);
					setUserName(userInfo.displayName);
				}
			} catch (err) {
				alert('알 수 없는 오류가 발생하였습니다. 프로필 이미지를 초기화합니다.');
				const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
				setProfileImg(defaultImg);
				setUserName(userInfo.displayName);
			} finally {
				setNewProfileImg('');
				setDefaultProfileImg('');
				setIsLimited(false);
				setIsEditing(prev => !prev);
			}
		} else if (value === '편집') {
			setIsEditing(prev => !prev);
			if (userName !== null && userName.length === 8) {
				setIsLimited(true);
			}
		}
	};

	const onChangeText = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

	const onClickLogOut = (): void => {
		const warning = confirm('로그아웃 하시겠습니까?');
		if (warning === true) {
			authService.signOut();
		} else {
			return;
		}
	};

	const onClickProfile = (): void => {
		setIsShowing(true);
	};

	const onClickBg = () => {
		setIsShowing(false);
	};

	useEffect(() => {
		const getProfileImg = async (): Promise<void> => {
			if (userInfo.uid !== null) {
				try {
					const profileDoc = await dbService.collection('profile').doc(userInfo.uid).get();
					if (profileDoc.exists) {
						const data = profileDoc.data();
						if (data !== undefined) {
							const userProfileImg = data.image;
							setProfileImg(userProfileImg);
							setHeaderProfileImg(userProfileImg);
						}
					} else {
						const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
						setProfileImg(defaultImg);
						setHeaderProfileImg(defaultImg);
						dbService.collection('profile').doc(userInfo.uid).set({
							image: defaultImg,
						});
					}
				} catch (err) {
					alert('프로필 구성에 실패하였습니다. 페이지를 새로고침합니다.');
					window.location.reload();
				}
			}
		};
		getProfileImg();
	}, []);

	return (
		<Container>
			<ImgWrapper>
				<ShowingProfileImg onClick={onClickProfile} imgUrl={headerProfileImg} />
			</ImgWrapper>
			{isShowing ? (
				<>
					<Background onClick={onClickBg} />
					<ProfileWrapper>
						<HiddenWrapper isSaving={isSaving}>
							<span>저장중...</span>
						</HiddenWrapper>
						<BtnWrapper>
							{isEditing ? (
								<>
									<ToggleBtn onClick={onClickToggle} value="취소">
										취소
									</ToggleBtn>
									<SaveBtn onClick={onClickSave}>저장</SaveBtn>
								</>
							) : (
								<ToggleBtn onClick={onClickToggle} value="편집">
									편집
								</ToggleBtn>
							)}
						</BtnWrapper>
						<EditWrapper isEditing={isEditing}>
							<ProfileImgContainer isEditing={isEditing}>
								<Wrapper onClick={onClickImg}>
									<UserImg imgUrl={profileImg} />
									<HiddenIconWrapper isEditing={isEditing}>
										<EditIcon />
									</HiddenIconWrapper>
								</Wrapper>
								<FileInput
									type="file"
									ref={fileRef}
									onChange={onFileUpload}
									accept="image/x-png,image/gif,image/jpeg"
								/>
								{isEditing ? <ImgDelBtn onClick={onClickDefaultImg}>기본 이미지로 변경</ImgDelBtn> : ''}
							</ProfileImgContainer>
							{isEditing ? (
								<EditNameWrapper>
									<EditName
										type="text"
										placeholder="Name"
										value={userName && userName ? userName : ''}
										onChange={onChangeText}
										isLimited={isLimited}
										required
									/>
								</EditNameWrapper>
							) : (
								<NameWrapper>
									<ShowingName>{userName ? userName : 'User'}</ShowingName>
								</NameWrapper>
							)}
						</EditWrapper>
						<LogOutWrapper onClick={onClickLogOut}>
							<span>LOG OUT</span>
						</LogOutWrapper>
					</ProfileWrapper>
				</>
			) : (
				''
			)}
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
	display: block;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.6);
`;

/* ********************* Img Wrapper ********************* */
const ImgWrapper = styled.div`
	z-index: 15;
`;

const ShowingProfileImg = styled.div<{ imgUrl: string }>`
	width: 2rem;
	height: 2rem;
	border: 2px solid ${props => props.theme.light.textColor};
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
	display: flex;
	flex-direction: column;
	align-items: center;
	position: fixed;
	top: 12rem;
	left: 50%;
	z-index: 15;
	padding: 0.7rem 1rem;
	height: 15rem;
	width: 80vw;
	transform: translate(-50%, -50%);
	border-radius: 15px;
	background-color: ${props => props.theme.light.mainColor};

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
		position : absolute;
		top: 3rem;
		left : unset;
		width: 45vw;
		transform : none;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		position : absolute;
		top: 3rem;
		left : unset;
		width: 35vw;
		transform : none;
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
	& > * {
		padding: 0;
		border: none;
		background-color: transparent;
		outline: none;
		font-size: 0.7rem;
		font-weight: 700;
		color: ${props => props.theme.light.subColor};
		cursor: pointer;
		transition: all 0.3s;
	}
`;

const ToggleBtn = styled.button``;

const SaveBtn = styled.button``;

/* ********************* Edit Wrapper ********************* */

const EditWrapper = styled.div<{ isEditing: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	padding: ${props => (props.isEditing ? '1rem 1rem 0.5rem 1rem' : '1.5rem 1rem')};
	${({ theme, isEditing }) => theme.media.landscapeMobile`
		${isEditing ? { padding: 0 } : { padding: '1rem' }};
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
	border-radius: 0;
	border-bottom: 1px solid ${props => (props.isLimited ? props.theme.light.subColor : props.theme.light.textColor)};
	background: none;
	font-size: 0.8rem;
	text-align: center;
	color: ${props => (props.isLimited ? props.theme.light.subColor : props.theme.light.textColor)};
	&:focus {
		outline: none;
	}
	&::placeholder {
		color: ${props => props.theme.light.lineColor};
	}
`;

const NameWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const ShowingName = styled.span`
	font-size: 0.8rem;
	color: ${props => props.theme.light.textColor};
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
	border-top: 1px solid ${props => props.theme.light.subColor};
	border-radius: 0 0 15px 15px;
	font-size: 0.7rem;
	font-weight: 700;
	color: ${props => props.theme.light.subColor};
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
		${{ border: `1px solid ${theme.light.subColor}` }};
	`}
	${({ theme }) => theme.media.landscapeMobile`
		bottom : 0.5rem;
		width : 33%;
		height: 1.3rem;
		padding : 0 0.2rem;
		border-radius: 15px;
		${{ border: `1px solid ${theme.light.subColor}` }};
	`}
	${({ theme }) => theme.media.desktop`
		&:hover {
			background-color: #5B5B5B;
			transition: background-color ease-in-out 0.3s;
		}
	`}
`;

/* ********************* Profile Img Container ********************* */
const ProfileImgContainer = styled.div<{ isEditing: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: ${props => (props.isEditing ? '1rem' : '1.5rem')};
	${({ theme }) => theme.media.landscapeMobile`
		margin-bottom : 1rem;
	`}
`;

const Wrapper = styled.div`
	position: relative;
	cursor: pointer;
`;

const UserImg = styled.div<{ imgUrl: string }>`
	width: 5rem;
	height: 5rem;
	border-radius: 50%;
	background-image: url(${props => props.imgUrl});
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	${({ theme }) => theme.media.landscapeMobile`
		width: 4rem;
		height: 4rem;
	`}
`;

const HiddenIconWrapper = styled.div<{ isEditing: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 5rem;
	height: 5rem;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.3);
	z-index: 2;
	position: absolute;
	top: 0;
	opacity: ${props => (props.isEditing ? 1 : 0)};
	${({ theme }) => theme.media.landscapeMobile`
		width: 4rem;
		height: 4rem;
	`}
`;

const EditIcon = styled(Edit3)`
	height: 1.5rem;
	color: ${props => props.theme.light.lineColor};
	&:active {
		transform: scale(0.9, 0.9);
	}
`;

const FileInput = styled.input`
	display: none;
`;

const ImgDelBtn = styled.button`
	padding: 5px 8px;
	margin-top: 0.5rem;
	border: 1px solid ${props => props.theme.light.lineColor};
	border-radius: 15px;
	background-color: ${props => props.theme.light.mainColor};
	font-size: 0.5rem;
	color: ${props => props.theme.light.lineColor};
	outline: none;
	cursor: pointer;
	transition: all 0.3s;
	&:active {
		transform: scale(0.9, 0.9);
	}
	${({ theme }) => theme.media.desktop`
		&:hover {
			background-color: #5B5B5B;
			transition: background-color ease-in-out 0.3s;
		}
	`}
`;

export default MyProfile;
