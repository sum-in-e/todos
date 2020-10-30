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
  userInfo: {
    displayName: string | null;
    updateProfile: (args: object) => void;
  };
  isLoggedIn: boolean;
  reRender: () => void;
}

const Routes = ({ userInfo, isLoggedIn, reRender }: IProps) => {
  return (
    <Router>
      <Switch>
        {isLoggedIn ? (
          <>
            <Route exact path="/">
              <Home userInfo={userInfo} reRender={reRender} />
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
