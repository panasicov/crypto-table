import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import ArbitragePairsList from './Components/CoinsTable/ArbitragePairsList';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import Home from './Components/Home/Home'
import Logout from './Components/Auth/Logout';
import APIService from './APIService';
import AuthService from './Components/Auth/AuthService';

class App extends Component {
  render() {
    new AuthService().setTokenInHeaders();
    return (
      <div className='mt-70'>
        <Router>
          <Routes>
            <Route exact path='/' element={<Home />}></Route>
            <Route exact path='/login' element={<Login />}></Route>
            <Route exact path='/register' element={<Register />}></Route>
            <Route exact path='/logout' element={<Logout />}></Route>
            <Route exact path='/arbitrage' element={<ArbitragePairsList />}></Route>
          </Routes>
        </Router>
      </div>
    )
  }
}

export default App;