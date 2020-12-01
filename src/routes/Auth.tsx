import React, { useState } from 'react';
import styled from 'styled-components';
import { authService } from '../fbase';
import Header from '../components/Header';

const Auth: React.FunctionComponent = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [toggleAccount, setToggleAccount] = useState<boolean>(false);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const value = (form.children[1] as HTMLInputElement).value;
		try {
			if (value === 'SIGN UP') {
				await authService.createUserWithEmailAndPassword(email, password);
			} else if (value === 'LOGIN') {
				await authService.signInWithEmailAndPassword(email, password);
			}
		} catch (error) {
			alert(error.message);
		}
	};

	const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value: inputValue },
		} = e;
		if (e.target.type === 'email') {
			setEmail(inputValue);
		} else if (e.target.type === 'password') {
			setPassword(inputValue);
		}
	};

	const onClick = (): void => {
		setToggleAccount(prev => !prev);
	};

	return (
		<Container>
			<Header />
			<Main>
				<Title>{toggleAccount ? 'Sign In' : 'Sign Up'}</Title>
				<Form onSubmit={onSubmit}>
					<TextInputWrapper>
						<TextInput type="email" value={email} placeholder="Email" onChange={onChange} required />
						<TextInput
							type="password"
							value={password}
							placeholder="Password"
							onChange={onChange}
							required
						/>
					</TextInputWrapper>
					<SubmitInput type="submit" value={toggleAccount ? 'LOGIN' : 'SIGN UP'} />
				</Form>
				<ToggleWrapper>
					<GuidePhrase>
						{toggleAccount ? `Don't you have an Account?` : `Already have an Account?`}
					</GuidePhrase>
					<ToggleButton onClick={onClick}>{toggleAccount ? 'Sign Up' : 'Sign In'}</ToggleButton>
				</ToggleWrapper>
			</Main>
			<Footer></Footer>
		</Container>
	);
};

const Container = styled.section`
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100vh;
	width: 100vw;
	background-color: ${props => props.theme.light.greenColor};
	color: ${props => props.theme.light.whiteColor};
`;

/* ************** Main ************** */
const Main = styled.main`
	display: flex;
	flex-direction: column;
	align-content: center;
	justify-content: center;
	height: 80vh;
	width: 100vw;
	padding: 1.5rem;
	${({ theme }) => theme.media.landscapeMobile`
		height : 90vh;
		width : 60vw;
		padding : 1rem;
	`}
	${({ theme }) => theme.media.portraitTablet`
		width : 50vw;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		width : 40vw;
    `}
	 ${({ theme }) => theme.media.desktop`
		width : 40vw;


    `}
`;

const Title = styled.h1`
	text-align: center;
	font-size: 0.8rem;
	font-weight: 400;
	margin: 0;
	margin-bottom: 2rem;
	${({ theme }) => theme.media.landscapeMobile`
		
	`}
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin-bottom: 3rem;
	${({ theme }) => theme.media.landscapeMobile`
		margin-bottom: 1.5rem;
	`}
`;

const TextInputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 4rem;
	margin-bottom: 1.5rem;
	font-size: 1rem;
	${({ theme }) => theme.media.landscapeMobile`
		
	`}
`;

const TextInput = styled.input`
	height: 50%;
	border: none;
	border-bottom: 2px solid ${props => props.theme.light.whiteColor};
	background: none;
	font-weight: 900;
	color: ${props => props.theme.light.whiteColor};
	&:focus {
		outline: none;
	}
	&::placeholder {
		font-weight: 900;
		color: ${props => props.theme.light.whiteColor};
	}
`;

const SubmitInput = styled.input`
	width: 100%;
	height: 1.5rem;
	background-color: ${props => props.theme.light.whiteColor};
	font-weight: 700;
	font-size: 0.8rem;
	color: ${props => props.theme.light.greenColor};
	border: none;
	outline: none;
	cursor: pointer;
`;

const ToggleWrapper = styled.div`
	display: flex;
	justify-content: center;
`;

const GuidePhrase = styled.span`
	margin-right: 10px;
	font-weight: 300;
	font-size: 0.6rem;
`;

const ToggleButton = styled.span`
	border: none;
	font-size: 0.6rem;
	font-weight: 700;
	background: none;
	cursor: pointer;
`;

/* ************** Footer ************** */
const Footer = styled.footer`
	border-top: 1px solid ${props => props.theme.light.grayColor};
	height: 10vh;
	width: 100vw;
	${({ theme }) => theme.media.landscapeMobile`
		display : none;
	`}
`;

export default Auth;
