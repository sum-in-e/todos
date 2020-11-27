import React, { useState, useEffect } from 'react';
import { dbService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
}

const ProfileImg: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [profileImage, setProfileImage] = useState<string>('');

	const onClickDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
		try {
			const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
			setProfileImage(defaultImg);
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
						}
					} catch (err) {
						alert(err.message);
					}
				} else {
					try {
						const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
						setProfileImage(defaultImg);
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
		<div>
			<UserImg imgUrl={profileImage} />
			<input type="file" onChange={onFileUpload} accept="image/x-png,image/gif,image/jpeg" />
			<button onClick={onClickDelete}>Delete Profile Image</button>
		</div>
	);
};

const UserImg = styled.div<{ imgUrl: string }>`
	width: 60px;
	height: 60px;
	background-image: url(${props => props.imgUrl});
	background-position: center;
	background-size: cover;
	background-repeat: no-repeat;
	border-radius: 10px;
`;

export default ProfileImg;
