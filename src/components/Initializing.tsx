import React from 'react';
import styled from 'styled-components';
import { LoaderAlt } from 'styled-icons/boxicons-regular';

const Initializing: React.FunctionComponent = () => {
	return (
		<Container>
			<LoaderI />
			<Text>Loading...</Text>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100vw;
	height: 100vh;
	background-color: ${props => props.theme.light.greenColor};
`;

const LoaderI = styled(LoaderAlt)`
	width: 4rem;
	color: ${props => props.theme.light.whiteColor};
`;

const Text = styled.h4`
	color: ${props => props.theme.light.whiteColor};
`;

export default Initializing;
