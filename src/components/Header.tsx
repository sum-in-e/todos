import React from 'react';
import styled from 'styled-components';
import MyProfile from './MyProfile';

const Header: React.FunctionComponent = () => {
	return (
		<Container>
			<ContentWrapper>
				<AppTitle>To Dos</AppTitle>
				<MyProfile />
			</ContentWrapper>
		</Container>
	);
};

const Container = styled.header`
	position: fixed;
	z-index: 10;
	top: 0;
	left: 0;
	width: 100vw;
	height: 12vh;
	height: calc(var(--vh, 1vh) * 12);
	background-color: ${props => props.theme.light.mainColor};
	color: ${props => props.theme.light.textColor};
	${({ theme }) => theme.media.landscapeMobile`
		height : 18vh;
		height: calc(var(--vh, 1vh) * 18);
	`}
	${({ theme }) => theme.media.portraitTablet`		
		height : 10vh;
		height: calc(var(--vh, 1vh) * 10);
	`}
	${({ theme }) => theme.media.desktop`		
		height : 15vh;
	`}
`;

const ContentWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
	padding: 1rem;
	border-bottom: 1px solid ${props => props.theme.light.lineColor};
	${({ theme }) => theme.media.landscapeMobile`
		padding: 0.5rem;
		${{ 'border-left': `1px solid ${theme.light.lineColor}` }};
		${{ 'border-right': `1px solid ${theme.light.lineColor}` }};
	`}
	${({ theme }) => theme.media.portraitTabletS`
		padding: 0.5rem 1.5rem;
	`}
`;

const AppTitle = styled.h1`
	margin: 0;
	text-align: center;
	font-size: 1rem;
	font-weight: 400;
`;

export default Header;
