import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Auth from "../routes/Auth";
import Home from "../routes/Home";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
