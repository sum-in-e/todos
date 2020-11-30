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
	${({ theme }) => theme.media.mobile`
		padding: 60px 35px;
		height: 75vh;  
    `}
`;

const Title = styled.h1`
	text-align: center;
	${({ theme }) => theme.media.mobile`
		margin-bottom: 4rem;
		font-size: 17px;
		font-weight: 400;
    `}
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	${({ theme }) => theme.media.mobile`
		margin-bottom: 5rem;
		height: 50%;
    `}
`;

const TextInputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	${({ theme }) => theme.media.mobile`
		height: 60%;
		font-size: 2rem;
    `}
`;

const TextInput = styled.input`
	border: none;
	background: none;
	font-weight: 900;
	color: ${props => props.theme.light.whiteColor};
	&:focus {
		outline: none;
	}
	&::placeholder {
		color: ${props => props.theme.light.whiteColor};
		font-weight: 900;
	}
	${({ theme }) => theme.media.mobile`
		height: 45%;
		border-bottom: 2px solid ${theme.light.whiteColor};
    `}
`;

const SubmitInput = styled.input`
	font-weight: 700;
	color: ${props => props.theme.light.greenColor};
	background-color: ${props => props.theme.light.whiteColor};
	border: none;
	outline: none;
	cursor: pointer;
	${({ theme }) => theme.media.mobile`
		width: 100%;
		height: 40px;
    `}
`;

const ToggleWrapper = styled.div`
	display: flex;
	justify-content: center;
`;

const GuidePhrase = styled.span`
	${({ theme }) => theme.media.mobile`
			margin-right: 10px;
			font-weight: 300;
    `}
`;

const ToggleButton = styled.span`
	border: none;
	font-weight: 700;
	background: none;
	cursor: pointer;
`;

/* ************** Footer ************** */
const Footer = styled.footer`
	border-top: 1px solid ${props => props.theme.light.grayColor};
	${({ theme }) => theme.media.mobile`
		height: 10vh;
    `}
`;

export default Auth;
