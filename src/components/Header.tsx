import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import MyProfile from './MyProfile';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	reRender: () => void;
}

const Header: React.FunctionComponent<IProps> = ({ userInfo, reRender }) => {
	const history = useHistory();
	return (
		<Container>
			<AppTitle onClick={() => history.push('/')}>To Dos</AppTitle>
			<MyProfile userInfo={userInfo} reRender={reRender} />
		</Container>
	);
};

const Container = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100vw;
	height: 12vh;
	padding: 2rem 1rem 1rem 1rem;
	background-color: ${props => props.theme.light.greenColor};
	border-bottom: 1px solid ${props => props.theme.light.grayColor};
	color: ${props => props.theme.light.whiteColor};
	${({ theme }) => theme.media.landscapeMobile`
		height : 18vh;
		padding: 2rem 2rem 1rem 2rem;

	`}
`;

const AppTitle = styled.h1`
	margin: 0;
	text-align: center;
	cursor: pointer;
	font-size: 1rem;
`;

export default Header;
