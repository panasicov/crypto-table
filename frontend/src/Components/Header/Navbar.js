import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../Auth/AuthService';

const authService = new AuthService();

const Navbar = (navClass, linkClassName) => {
  const [navButtons, setNavButtons] = useState({
    'Arbitrage': '/arbitrage',
  });

  useEffect(() => {
    authService.isLogged()
    .then(response => {
      if (response) {
        setNavButtons({
          'Arbitrage': '/arbitrage',
          'logout': '/logout'
        })
      } else {
        setNavButtons({
          'Arbitrage': '/arbitrage',
          'Login': '/login',
          'Register': '/register'
        });
      }
    })
  }, [])

  const NavComponent = ({navClass, linkClassName}) => (
    <nav className={navClass}>
      {Object.entries(navButtons).map( ([key, value]) =>
        <Link to={value} className={linkClassName}>
          {key}
        </Link>
      )}
    </nav>
  )

  return (
    <NavComponent navClass={navClass} linkClassName = {linkClassName} />
  );
}

export default Navbar;