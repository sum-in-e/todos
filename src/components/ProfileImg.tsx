import React, { useState, useEffect } from 'react';
import { dbService, storageService } from '../fbase';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: any) => void;
	};
}

const ProfileImg: React.FunctionComponent<IProps> = ({ userInfo }) => {
	const [profileImage, setProfileImage] = useState<string>('');

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
			<input type="file" />
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
