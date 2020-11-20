import React, { useState } from 'react';
import { authService } from '../fbase';

const Auth = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [toggleAccount, setToggleAccount] = useState<boolean>(false);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement> | any): Promise<void> => {
		e.preventDefault();
		const {
			target: {
				2: { value },
			},
		} = e;
		try {
			if (value === 'Sign Up') {
				await authService.createUserWithEmailAndPassword(email, password);
			} else if (value === 'Log In') {
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
		<>
			<div>
				<form onSubmit={onSubmit}>
					<input type="email" value={email} placeholder="email" onChange={onChange} required />
					<input type="password" value={password} placeholder="password" onChange={onChange} required />
					<input type="submit" value={toggleAccount ? 'Log In' : 'Sign Up'} />
				</form>
			</div>
			<button onClick={onClick}>{toggleAccount ? 'Sign Up' : 'Log In'}</button>
		</>
	);
};

export default Auth;
