import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const Header: React.FunctionComponent = () => {
	const history = useHistory();
	return (
		<Container>
			<AppTitle onClick={() => history.push('/')}>To Dos</AppTitle>
		</Container>
	);
};

const Container = styled.header`
	display: flex;
	align-items: center;
	height: 15vh;
	padding: 1.5rem;
	border-bottom: 1px solid ${props => props.theme.light.grayColor};
	color: ${props => props.theme.light.whiteColor};
	${({ theme }) => theme.media.landscapeMobile`
		padding : 1rem 2.5rem;
	`}
	${({ theme }) => theme.media.portraitTablet`
		height : 10vh;
	`}
`;

const AppTitle = styled.h1`
	margin: 0;
	text-align: center;
	cursor: pointer;
	font-size: 1rem;
`;

export default Header;
