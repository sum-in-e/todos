import React, { useState } from 'react';
import styled from 'styled-components';
import { authService } from '../fbase';

const Auth: React.FunctionComponent = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [toggleAccount, setToggleAccount] = useState<boolean>(false);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const value = (form.children[1] as HTMLInputElement).value;
		if (value === 'SIGN UP') {
			try {
				await authService.createUserWithEmailAndPassword(email, password);
			} catch (err) {
				alert(err.message);
			}
		} else if (value === 'LOGIN') {
			try {
				await authService.signInWithEmailAndPassword(email, password);
			} catch (err) {
				alert('존재하지 않는 이메일 이거나, 비밀번호를 잘못 입력하였습니다.\n다시 시도해 주세요.');
			}
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
			<Header>
				<AppTitle>To Dos</AppTitle>
			</Header>
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
			<Footer />
		</Container>
	);
};

const Container = styled.section`
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100vh;
	height: calc(var(--vh, 1vh) * 100);
	width: 100vw;
	background-color: ${props => props.theme.light.mainColor};
	color: ${props => props.theme.light.textColor};
	${({ theme }) => theme.media.landscapeMobile`
		${{ 'border-left': `1px solid ${theme.light.lineColor}` }};
		${{ 'border-right': `1px solid ${theme.light.lineColor}` }};
	`}
`;

/* ************** Header ************** */
const Header = styled.header`
	display: flex;
	align-items: center;
	width: 100vw;
	height: 12vh;
	padding: 1rem;
	background-color: ${props => props.theme.light.mainColor};
	border-bottom: 1px solid ${props => props.theme.light.lineColor};
	color: ${props => props.theme.light.textColor};
	${({ theme }) => theme.media.landscapeMobile`
		height : 15vh;
		padding : 0 2.5rem;
		${{ 'border-left': `1px solid ${theme.light.lineColor}` }};
		${{ 'border-right': `1px solid ${theme.light.lineColor}` }};
	`}
	${({ theme }) => theme.media.portraitTablet`
		height : 10vh;
	`}
	${({ theme }) => theme.media.desktop`
		height : 15vh;
	`}
`;

const AppTitle = styled.h1`
	margin: 0;
	text-align: center;
	font-weight: 400;
	font-size: 1rem;
	cursor: pointer;
`;

/* ************** Main ************** */
const Main = styled.main`
	display: flex;
	flex-direction: column;
	align-content: center;
	justify-content: center;
	height: 78vh;
	width: 100vw;
	padding: 1rem;
	${({ theme }) => theme.media.landscapeMobile`
		width : 17rem;
		height : 79vh;
	`}
	${({ theme }) => theme.media.portraitTabletS`
		width : 15rem;
		`}
	${({ theme }) => theme.media.portraitTablet`
		height: 80vh;
		width : 17rem;
	`}
	${({ theme }) => theme.media.landscapeTablet`
		width : 17rem;
    `}
	 ${({ theme }) => theme.media.desktop`
	    height: 75vh;
		width : 20rem;
    `}
`;

const Title = styled.h1`
	text-align: center;
	font-size: 0.8rem;
	font-weight: 400;
	margin: 0;
	margin-bottom: 2rem;
	${({ theme }) => theme.media.landscapeMobile`
		margin-bottom : 1rem;
	`}
	${({ theme }) => theme.media.portraitTablet`
		margin-bottom : 4rem;
		font-size : 0.9rem;
	`}
	${({ theme }) => theme.media.desktop`
		margin-bottom : 3rem;
		font-size : 0.9rem;
	`}
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin-bottom: 3rem;
	${({ theme }) => theme.media.landscapeMobile`
		margin-bottom: 1rem;
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
		font-size : 0.8rem;
	`}
	${({ theme }) => theme.media.portraitTablet`
		margin-bottom: 2.5rem;
	`}
`;

const TextInput = styled.input`
	height: 50%;
	border: none;
	border-bottom: 1px solid ${props => props.theme.light.textColor};
	border-radius: 0;
	background: none;
	color: ${props => props.theme.light.textColor};
	&:focus {
		outline: none;
	}
	&::placeholder {
		color: ${props => props.theme.light.lineColor};
	}
`;

const SubmitInput = styled.input`
	width: 100%;
	height: 1.5rem;
	background-color: ${props => props.theme.light.textColor};
	font-weight: 700;
	font-size: 0.8rem;
	color: ${props => props.theme.light.mainColor};
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
	border-top: 1px solid ${props => props.theme.light.lineColor};
	height: 10vh;
	width: 100vw;
	${({ theme }) => theme.media.landscapeMobile`
		display : none;
	`}
`;

export default React.memo(Auth);
