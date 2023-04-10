import React, {useEffect, useState} from 'react';
import {Avatar, Button, Card, Col, Row, Tag} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {UserOutlined} from "@ant-design/icons";
import { Typography } from 'antd';
import {toast} from "react-toastify";
import useAxiosClient from "../axios-client";
import Loading from "../components/Util/Loading";
import {colors} from "../utils/Colors";
import {useStateContext} from "../contexts/ContextProvider";
import loading from "../components/Util/Loading";


const UserProfile = () => {

  const {state}= useLocation();
  const {user} = useStateContext()
  const { Title } = Typography;
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedUser, setFetchedUser] = useState(null)
  const axiosClient = useAxiosClient();
  const navigate = useNavigate();

  const resetButtonStyle = {
    background: colors.secondary,
    borderColor: colors.secondary,
    color: "#fffff",
    fontWeight:"bold"
  };

  const cardHeaderStyle = {
    background: colors.primary,
    color: colors.secondary
  }

  useEffect(() => {
    const getUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(`/users/user/${state.id}`);
        setIsLoading(false);
        setFetchedUser({...response.data.data})
      } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        toast.error(message);
        setIsLoading(false);
      }
    }
    getUserData()
  }, [state])

  const resetUserPassword = () => {
    navigate('/resetPassword', {state: {email: user.email}});
  }

  if (fetchedUser && !isLoading){
    return (
      <Row>
        <Col xs={24} md={8} lg={8}>
          <Card  title="Profile"  headStyle={cardHeaderStyle}>
            {fetchedUser.image ? <Avatar
              shape="square"
              size={{
                xs: 100,
                sm: 100,
                md: 120,
                lg: 150,
                xl: 150,
                xxl: 150,
              }}
              src={`${import.meta.env.VITE_API_BASE_URL}/files/upload/${fetchedUser.image.id}`}
            /> : <Avatar
              shape="square"
              size={{
                xs: 100,
                sm: 100,
                md: 120,
                lg: 150,
                xl: 150,
                xxl: 150,
              }}
              icon={<UserOutlined />}
            />}
            <div className="flex pt-4 align-baseline">
              <Title level={3}>{fetchedUser.firstName} {fetchedUser.lastName}</Title>
              {fetchedUser.roles.length > 0 ? fetchedUser.roles.map((role, index) => {
                return <div key={index} className="align-middle pt-2 pl-2"><Tag style={{fontWeight:"bold"}} color="#539165">{role}</Tag></div>
              }) : <div className="align-middle pt-2 pl-2"><Tag style={{fontWeight:"bold"}} color="#DF2E38">User</Tag></div>}
            </div>
            <div>
              <p className="mb-1">{fetchedUser.address.address}, {fetchedUser.address.upazila.name}, {fetchedUser.address.district.name}</p>
              <p className="mb-1">{fetchedUser.address.phone}</p>
              <p>{fetchedUser.email}</p>
            </div>
            {fetchedUser.id === user.id ? <div>
              <Button style={resetButtonStyle} type={"primary"} onClick={resetUserPassword}>Reset Password</Button>
            </div> : null}
          </Card>
        </Col>
      </Row>

    );
  }

  return <Loading layout="default"/>;

};

export default UserProfile;
