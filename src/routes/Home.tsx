import React from 'react';
import styled from 'styled-components';
import Tasks from '../components/Tasks';
import Header from '../components/Header';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	reRender: () => void;
}

const Home: React.FunctionComponent<IProps> = ({ userInfo, reRender }) => {
	return (
		<Container>
			<Header userInfo={userInfo} reRender={reRender} />
			<Tasks userInfo={userInfo} />
		</Container>
	);
};

const Container = styled.div`
	height: 100vh;
	width: 100vw;
	background-color: ${props => props.theme.light.greenColor};
`;

export default Home;
