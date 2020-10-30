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
