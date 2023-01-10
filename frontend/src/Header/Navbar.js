import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({navClass, linkClassName}) => (
    <NavComponent navClass={navClass} linkClassName = {linkClassName} />
);

export const NavComponent = ({navClass, linkClassName}) => (
    <nav className={navClass}>
        {Object.entries({"Arbitrage": "/arb"}).map( ([key, value]) =>
            <Link to={value} className={linkClassName}>
                {key}
            </Link>
        )}
    </nav>
)

export default Navbar;
