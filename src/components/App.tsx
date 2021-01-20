import React, { useState, useEffect } from 'react';
import Router from './Router';
import { authService } from '../fbase';
import Initializing from './Initializing';

interface IUser {
	uid: string | null;
	displayName: string | null;
	updateProfile: (args: { displayName: string | null }) => void;
}

const App: React.FunctionComponent = () => {
	const [userInfo, setUserInfo] = useState<IUser>({
		uid: null,
		displayName: null,
		updateProfile: args => args,
	});
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [init, setInit] = useState<boolean>(false);

	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
	console.log(window.innerHeight, vh);
	window.addEventListener('resize', () => {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	});

	useEffect(() => {
		authService.onAuthStateChanged((loggedUser: firebase.User | null): void => {
			if (loggedUser) {
				setUserInfo({
					uid: loggedUser.uid,
					displayName: loggedUser.displayName,
					updateProfile: args => loggedUser.updateProfile(args),
				});
				setIsLoggedIn(true);
			} else {
				setIsLoggedIn(false);
			}
			setInit(true);
		});
	}, []);

	const reRender = (): void => {
		const loggedUser: firebase.User | null = authService.currentUser;
		if (loggedUser) {
			setUserInfo({
				uid: loggedUser.uid,
				displayName: loggedUser.displayName,
				updateProfile: args => loggedUser.updateProfile(args),
			});
		}
	};

	return <>{init ? <Router userInfo={userInfo} isLoggedIn={isLoggedIn} reRender={reRender} /> : <Initializing />}</>;
};

export default App;
