import React, { useState, useEffect } from 'react';
import { dbService, storageService } from '../fbase';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: object) => void;
	};
}

const ProfileImg: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [profileImage, setProfileImage] = useState<string>('');

	const onClickDelete = async (e: any): Promise<void> => {
		const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
		setProfileImage(defaultImg);
		const theDoc = await dbService.collection('profile').where('userId', '==', userInfo.uid).get();
		theDoc.forEach(result =>
			dbService.doc(`profile/${result.id}`).update({
				image: defaultImg,
			}),
		);
		const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
		if (items.length > 0) {
			await items[0].delete();
		}
		// 이부분 이벤트 타입 수정
		e.target.parentElement.children[1].value = null;
	};

	const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const {
			target: { files },
		} = e;

		if (files !== null) {
			const items = (await storageService.ref().child(`${userInfo.uid}/`).list()).items;
			if (items.length > 0) {
				await items[0].delete();
			}

			const theFile = files[0];
			const reader = new FileReader();
			reader.readAsDataURL(theFile);
			reader.onload = async (): Promise<void> => {
				const result = reader.result;
				if (result !== null) {
					const dataUrl = result.toString();
					const imgRef = storageService.ref().child(`${userInfo.uid}/${uuidv4()}`);
					const response = await imgRef.putString(dataUrl, 'data_url');
					const downLoadUrl = await response.ref.getDownloadURL();
					setProfileImage(downLoadUrl);
					const theDoc = await dbService.collection('profile').where('userId', '==', userInfo.uid).get();
					theDoc.forEach(result =>
						dbService.doc(`profile/${result.id}`).update({
							image: downLoadUrl,
						}),
					);
				}
			};
		}
	};

	useEffect(() => {
		const getProfileImg = async (): Promise<void> => {
			const theDoc = await dbService.collection('profile').where('userId', '==', userInfo.uid).get();
			if (theDoc.empty) {
				const defaultImg = await storageService.ref().child('defaultProfile.png').getDownloadURL();
				await dbService.collection('profile').add({
					image: defaultImg,
					userId: userInfo.uid,
				});
				setProfileImage(defaultImg);
			} else {
				const userProfileImg = theDoc.docs.map(doc => doc.data().image);
				setProfileImage(userProfileImg[0]);
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
	background-size: contain;
	border-radius: 10px;
`;

export default ProfileImg;
