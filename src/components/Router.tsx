import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Auth from '../pages/Auth';
import Home from '../pages/Home';

interface IProps {
	isLoggedIn: boolean;
}

const Routes: React.FunctionComponent<IProps> = ({ isLoggedIn }) => {
	return (
		<Router>
			<Switch>
				{isLoggedIn ? (
					<>
						<Route exact path="/">
							<Home />
						</Route>
					</>
				) : (
					<>
						<Route path="/">
							<Auth />
						</Route>
					</>
				)}
			</Switch>
		</Router>
	);
};

export default Routes;
