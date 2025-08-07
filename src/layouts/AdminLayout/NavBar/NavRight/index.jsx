import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const NavRight = () => {
  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto" id="navbar-right">
        <ListGroup.Item as="li" bsPrefix=" "></ListGroup.Item>
        <ListGroup.Item as="li" bsPrefix=" "></ListGroup.Item>
        <ListGroup.Item as="li" bsPrefix=" ">
          {/* Direct link to Profile without dropdown */}
          <Link to="/profile" className="profile-link">
            <i className="icon feather icon-user fs-3" />
            <span className="ms-2"></span>
          </Link>
        </ListGroup.Item>
      </ListGroup>
    </React.Fragment>
  );
};

export default NavRight;

