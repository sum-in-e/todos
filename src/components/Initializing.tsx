import React from 'react';
import styled from 'styled-components';
import { Loader } from 'styled-icons/boxicons-regular';

const Initializing: React.FunctionComponent = () => {
	return (
		<Container>
			<LoaderI />
			<Text>Initializing...</Text>
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
	background-color: ${props => props.theme.light.whiteColor};
`;

const LoaderI = styled(Loader)`
	width: 4rem;
	color: ${props => props.theme.light.greenColor};
`;

const Text = styled.h4``;

export default Initializing;
