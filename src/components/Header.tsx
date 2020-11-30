import React from 'react';
import styled from 'styled-components';

const Header = () => {
	return (
		<Container>
			<AppTitle>To Dos</AppTitle>
		</Container>
	);
};

const Container = styled.header`
	display: flex;
	align-items: center;
	padding: 30px;
	height: 15vh;
	border-bottom: 1px solid ${props => props.theme.light.grayColor};
	color: ${props => props.theme.light.whiteColor};
`;

const AppTitle = styled.h1`
	margin: 0;
	text-align: center;
`;

export default Header;
