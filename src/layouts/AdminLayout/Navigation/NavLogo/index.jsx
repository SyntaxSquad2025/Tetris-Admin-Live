// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';

// import { ConfigContext } from '../../../../contexts/ConfigContext';
// import * as actionType from '../../../../store/actions';

// const NavLogo = () => {
//   const configContext = useContext(ConfigContext);
//   const { collapseMenu } = configContext.state;
//   const { dispatch } = configContext;

//   let toggleClass = ['mobile-menu'];
//   if (collapseMenu) {
//     toggleClass = [...toggleClass, 'on'];
//   }

//   return (
//     <React.Fragment>
//       <div className="navbar-brand header-logo">
//         <Link to="#" className="b-brand">
//           <div>
//             <i className="feather icon-play" />
//           </div>
//           <span className="b-title">Admin Panel</span>
//         </Link>
//         <Link to="#" className={toggleClass.join(' ')} id="mobile-collapse" onClick={() => dispatch({ type: actionType.COLLAPSE_MENU })}>
//           <span />
//         </Link>
//       </div>
      
//     </React.Fragment>
//   );
// };

// export default NavLogo;


"use client"

import React, { useContext } from "react"
import { Link } from "react-router-dom"

import { ConfigContext } from "../../../../contexts/ConfigContext"
import * as actionType from "../../../../store/actions"

const NavLogo = () => {
  const configContext = useContext(ConfigContext)
  const { collapseMenu } = configContext.state
  const { dispatch } = configContext

  let toggleClass = ["mobile-menu"]
  if (collapseMenu) {
    toggleClass = [...toggleClass, "on"]
  }

  return (
    <React.Fragment>
      <div className="navbar-brand header-logo">
        <Link to="#" className="b-brand">
          <i className="feather icon-grid" />
          <span className="b-title">TETRIS GAME</span>
        </Link>
        <Link
          to="#"
          className={toggleClass.join(" ")}
          id="mobile-collapse"
          onClick={() => dispatch({ type: actionType.COLLAPSE_MENU })}
        >
          <span />
        </Link>
      </div>
    </React.Fragment>
  )
}

export default NavLogo
