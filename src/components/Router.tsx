import React from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Auth from "../routes/Auth";
import Home from "../routes/Home";

interface IProps {
  user: object | null;
  isLoggedIn: boolean;
}

const Routes = ({ user, isLoggedIn }: IProps) => {
  return (
    <Router>
      <Switch>
        {isLoggedIn ? (
          <>
            <Route exact path="/">
              <Home />
            </Route>
            <Redirect from="/*" to="/" />
          </>
        ) : (
          <>
            <Route path="/auth">
              <Auth />
            </Route>
            <Redirect from="/*" to="/auth" />
          </>
        )}
      </Switch>
    </Router>
  );
};

export default Routes;
