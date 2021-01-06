import React, { useEffect, useRef } from 'react';
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
	profileImg: string;
	setProfileImg: React.Dispatch<React.SetStateAction<string>>;
	setHeaderProfileImg: React.Dispatch<React.SetStateAction<string>>;
	setNewProfileImg: React.Dispatch<React.SetStateAction<string>>;
	setDefaultProfileImg: React.Dispatch<React.SetStateAction<string>>;
	isEdit: boolean;
}

const ProfileImg: React.FunctionComponent<IProps> = ({
	userInfo,
	profileImg,
	setProfileImg,
	setHeaderProfileImg,
	setNewProfileImg,
	setDefaultProfileImg,
	isEdit,
}) => {
	const fileRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;

	const onImgClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const img = e.currentTarget as HTMLDivElement;
		if (isEdit) {
			(img.nextSibling as HTMLInputElement).click();
		}
	};

	const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const {
			target: { files },
		} = e;

		if (files !== null) {
			const theFile = files[0];
			const reader = new FileReader();
			reader.readAsDataURL(theFile);
			reader.onload = async (): Promise<void> => {
				const result = reader.result;
				try {
					if (result !== null) {
						const dataUrl = result.toString();
						setNewProfileImg(dataUrl);
						setProfileImg(dataUrl);
						setDefaultProfileImg('');
						fileRef.current.value = '';
					}
				} catch (err) {
					alert(err.message);
				}
			};
		}
	};

	const onDefaultImgClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
		const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
		setProfileImg(defaultImg);
		setDefaultProfileImg(defaultImg);
		setNewProfileImg('');
		fileRef.current.value = '';
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
							setProfileImg(userProfileImg);
							setHeaderProfileImg(userProfileImg);
						}
					} catch (err) {
						alert(err.message);
					}
				} else {
					try {
						const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
						setProfileImg(defaultImg);
						setHeaderProfileImg(defaultImg);
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
		<Container isEdit={isEdit}>
			<ImgWrapper onClick={onImgClick}>
				<UserImg imgUrl={profileImg} />
				<HiddenIconWrapper isEdit={isEdit}>
					<EditIcon />
				</HiddenIconWrapper>
			</ImgWrapper>
			<FileInput type="file" ref={fileRef} onChange={onFileUpload} accept="image/x-png,image/gif,image/jpeg" />
			{isEdit ? <ImgDelBtn onClick={onDefaultImgClick}>기본 이미지로 변경</ImgDelBtn> : ''}
		</Container>
	);
};

const Container = styled.div<{ isEdit: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: ${props => (props.isEdit ? '1rem' : '1.5rem')};
	${({ theme }) => theme.media.landscapeMobile`
		margin-bottom : 1rem;
	`}
`;

const ImgWrapper = styled.div`
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

const HiddenIconWrapper = styled.div<{ isEdit: boolean }>`
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
	opacity: ${props => (props.isEdit ? 1 : 0)};
	${({ theme }) => theme.media.landscapeMobile`
		width: 4rem;
		height: 4rem;
	`}
`;

const EditIcon = styled(Edit3)`
	height: 1.5rem;
	color: ${props => props.theme.light.grayColor};
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
	border: 1px solid ${props => props.theme.light.grayColor};
	border-radius: 15px;
	background-color: ${props => props.theme.light.greenColor};
	font-size: 0.5rem;
	color: ${props => props.theme.light.grayColor};
	outline: none;
	cursor: pointer;
	transition: all 0.3s;
	&:active {
		transform: scale(0.9, 0.9);
	}
	${({ theme }) => theme.media.desktop`
		&:hover {
			background-color: rgb(14, 59, 51);
			transition: background-color ease-in-out 0.3s;
		}
	`}
`;

export default ProfileImg;
