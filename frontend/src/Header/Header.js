import React from 'react';
import Navbar from './Navbar';
// import { Link } from 'react-scroll'; // react-scroll is a library for scrolling in React
import SmallScreensNavbar from './SmallScreensNavbar';
import { useWindowWidthAndHeight } from './CustomHooks';
import { Link } from 'react-router-dom';

const Header = () => {

    const [width, _] = useWindowWidthAndHeight();

    return(
        <header>
            <div className="header-inner">
                <Link to="/"  className="logo nav-link">
                    Crypto Table
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
