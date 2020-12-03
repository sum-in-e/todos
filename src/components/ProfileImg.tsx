import React, { useState, useEffect } from 'react';
import { dbService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { Edit3 } from 'styled-icons/feather';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	setShowingProfileImg: React.Dispatch<React.SetStateAction<string>>;
}

const ProfileImg: React.FunctionComponent<IProps> = ({ userInfo, setShowingProfileImg }) => {
	const [profileImage, setProfileImage] = useState<string>('');

	const onClickImg = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const img = e.currentTarget as HTMLDivElement;
		(img.nextSibling as HTMLInputElement).click();
	};

	const onDeleteClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
		try {
			const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
			setProfileImage(defaultImg);
			setShowingProfileImg(defaultImg);
			if (userInfo.uid) {
				dbService.collection('profile').doc(userInfo.uid).update({
					image: defaultImg,
				});
			}
			const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
			if (items.length > 0) {
				await items[0].delete();
			}
		} catch (err) {
			alert(err.message);
		} finally {
			const input = e.target as HTMLButtonElement;
			(input.parentElement?.children[1] as HTMLInputElement).value = '';
		}
	};

	const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const {
			target: { files },
		} = e;

		if (files !== null) {
			const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
			if (items.length > 0) {
				items[0].delete();
			}
			const theFile = files[0];
			const reader = new FileReader();
			reader.readAsDataURL(theFile);
			reader.onload = async (): Promise<void> => {
				const result = reader.result;
				try {
					if (result !== null && userInfo.uid !== null) {
						const dataUrl = result.toString();
						const imgRef = storageService.ref().child(`${userInfo.uid}/${uuidv4()}`);
						const response = await imgRef.putString(dataUrl, 'data_url');
						const downLoadUrl = await response.ref.getDownloadURL();
						setProfileImage(downLoadUrl);
						setShowingProfileImg(downLoadUrl);
						dbService.collection('profile').doc(userInfo.uid).update({
							image: downLoadUrl,
						});
					}
				} catch (err) {
					alert(err.message);
				}
			};
		}
	};

	useEffect(() => {
		const getProfileImg = async (): Promise<void> => {
			if (userInfo.uid !== null) {
				const profileDoc = await dbService.collection('profile').doc(userInfo.uid).get();
				if (profileDoc.exists) {
					try {
						const data = profileDoc.data();
						if (data !== undefined) {
							const userProfileImg = data.image;
							setProfileImage(userProfileImg);
							setShowingProfileImg(userProfileImg);
						}
					} catch (err) {
						alert(err.message);
					}
				} else {
					try {
						const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
						setProfileImage(defaultImg);
						setShowingProfileImg(defaultImg);
						dbService.collection('profile').doc(userInfo.uid).set({
							image: defaultImg,
						});
					} catch (err) {
						alert(err.message);
					}
				}
			}
		};
		getProfileImg();
	}, []);

	return (
		<Container>
			<ImgWrapper onClick={onClickImg}>
				<UserImg imgUrl={profileImage} />
				<Hidden>
					<EditIcon />
				</Hidden>
			</ImgWrapper>
			<FileInput type="file" onChange={onFileUpload} accept="image/x-png,image/gif,image/jpeg" />
			<ImgDelBtn onClick={onDeleteClick}>기본 이미지로 변경</ImgDelBtn>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 1rem;
`;

const FileInput = styled.input`
	display: none;
`;

const Hidden = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 4rem;
	height: 4rem;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.3);
	z-index: 2;
	position: absolute;
	top: 0;
	opacity: 0;
	transition: all 0.3s;
	${({ theme }) => theme.media.portraitMobile`
		opacity : 1;
		`}
	${({ theme }) => theme.media.landscapeMobile`
		opacity : 1;		
	`}
`;

const EditIcon = styled(Edit3)`
	height: 1.5rem;
	color: ${props => props.theme.light.grayColor};
	${({ theme }) => theme.media.portraitMobile`
		&:active {
			transform: scale(0.9, 0.9);
		}
		`}
	${({ theme }) => theme.media.landscapeMobile`
			&:active {
				transform: scale(0.9, 0.9);
			}
	`}
`;

const ImgWrapper = styled.div`
	position: relative;
	cursor: pointer;
`;

const UserImg = styled.div<{ imgUrl: string }>`
	width: 4rem;
	height: 4rem;
	border-radius: 50%;
	background-image: url(${props => props.imgUrl});
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
`;

const ImgDelBtn = styled.button`
	padding: 5px 8px;
	margin-top: 0.5rem;
	border: 1px solid ${props => props.theme.light.grayColor};
	border-radius: 15px;
	background-color: ${props => props.theme.light.greenColor};
	font-size: 0.5rem;
	color: ${props => props.theme.light.grayColor};
	outline: none;
	cursor: pointer;
	transition: all 0.3s;
	${({ theme }) => theme.media.portraitMobile`
		&:active {
			transform: scale(0.9, 0.9);
		}
		`}
	${({ theme }) => theme.media.landscapeMobile`
		&:active {
			transform: scale(0.9, 0.9);
		}
	`}
`;

export default ProfileImg;
