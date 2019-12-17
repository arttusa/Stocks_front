import React from 'react';  
import Home from './Home';
import Info from './Info';
// Älä poista routeria ja switchiä, kaatuu muuten 
// TODO: Etsi syy 
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const defaultPath = (path) => {
  if(path === "/info") {
    return 1;
  }
  else {
    return 0;
  }
} 

const Navitab = () => {
  const currentPath = window.location.pathname;
  const [value, setValue] = React.useState(defaultPath(currentPath));
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return(
    <>
      <Tabs value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleChange}
            >
        <Tab label="Home" component={Link} to="/" />
        <Tab label="Info" component={Link} to="/info" />
      </Tabs>


      <Switch>
      <Route
        exact path="/"
        component={Home}
        
      />
      <Route
        exact path="/info"
        component={Info} 
      />
      </Switch>



    </>
  )
}

export default Navitab;