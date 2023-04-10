import React from 'react';
import {Avatar, Button, Dropdown} from "antd";
import {useStateContext} from "../contexts/ContextProvider";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import {colors} from "../utils/Colors";
import {NavLink} from "react-router-dom";

const NavigationDropdown = (props) => {

  const {user} = useStateContext();


  const items = [
    {
      label: (
        <NavLink to={{
          pathname:`/users/${user.firstname}_${user.lastname}`}} state={{id: user.id}} className="font-medium">{user.firstname} {user.lastname}</NavLink>
      ),
      key: '3',
    },
    {
      type: 'divider',
    },
    {
      key: '1',
      label: (
        <div className="flex">
          <FontAwesomeIcon icon={faRightFromBracket} className="pt-2.5" style={{color: colors.primary}}/>
          <Button type="link" onClick={props.handleLogout}>
            Logout
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="flex">
      <div>
        {
          user.image ?
            <Avatar src={`${import.meta.env.VITE_API_BASE_URL}/files/upload/${user.image.id}`}/> :
            <Avatar style={{backgroundColor:colors.secondary, fontWeight:700}}>{user.firstname.charAt(0) + user.lastname.charAt(0)}</Avatar>
        }

      </div>
      <Dropdown menu={{items}} trigger={['click']} className="pl-1">
        <a onClick={(e) => e.preventDefault()} href="#">
          <FontAwesomeIcon icon={faChevronDown} style={{fontSize: "16px"}}/>
        </a>
      </Dropdown>
    </div>
  );
};

export default NavigationDropdown;
