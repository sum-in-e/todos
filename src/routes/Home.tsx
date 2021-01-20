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
	height: calc(var(--vh, 1vh) * 100);
	background-color: ${props => props.theme.light.greenColor};
	${({ theme }) => theme.media.landscapeMobile`
		padding: 0 2rem;
		`}
`;

export default Home;
