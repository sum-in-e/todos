import React from 'react';
import MyProfile from '../components/MyProfile';
import Tasks from '../components/Tasks';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: object) => void;
	};
	reRender: () => void;
}

const Home: React.FunctionComponent<IProps> = ({ userInfo, reRender }) => {
	return (
		<>
			<MyProfile userInfo={userInfo} reRender={reRender} />
			<Tasks userInfo={userInfo} />
		</>
	);
};

export default Home;
