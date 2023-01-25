import React, { useState } from 'react';
import NavComponent from './Navbar';

const SmallScreensNavbar = () =>{

  let [translate, setTranslate ] = useState(true);

  return (
    <div>
      <button className="hamburger-btn" onClick= {() => setTranslate(!translate)}>
        {translate ? <span>&#9776;</span> : <span>&times;</span>}
      </button>
      <div id="sidebar-list" className={translate ? "addTransiton" : "removeTransition"}>
        <span onClick={() => setTranslate(!translate)}>
          <NavComponent
            navClass="nav-small"
            linkClassName="nav-small-link"
          />
        </span>
      </div>
    </div>
  )
}

export default SmallScreensNavbar;