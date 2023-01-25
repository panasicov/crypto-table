import React from 'react';
import Navbar from './Navbar';
import SmallScreensNavbar from './SmallScreensNavbar';
import useWindowWidthAndHeight from './CustomHooks';
import { Link } from 'react-router-dom';
import './Header.css'

const Header = () => {

  const [width, _] = useWindowWidthAndHeight();

  return(
    <header class="d-flex  aligns-items-center justify-content-center">
      <div class="header-inner">
        <Link to="/"  className="nav-link">
          <span class="logo">Crypto Table</span>
        </Link>
        {
          width > 1000 ? <Navbar navClass="nav-big" linkClassName="nav-big-link"/>
                       : <SmallScreensNavbar navClass="nav-small" linkClassName = "nav-small-link"/>
        }
      </div>
    </header>
  )
}

export default Header;