import React, {useEffect, useState} from 'react';
import {Button, Card, Col, Form, Input, Row, Typography} from "antd";
import {colors} from "../utils/Colors";
import elegantTexLogo from "../assets/images/eleganttex-logo-only.png";
import {LockOutlined} from "@ant-design/icons";
import {toast} from "react-toastify";
import useAxiosClient from "../axios-client.js";
import {useLocation, useNavigate} from "react-router-dom";
import {useStateContext} from "../contexts/ContextProvider";

const ResetPassword = () => {

  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const axiosClient = useAxiosClient();
  const {state}= useLocation();
  const navigate = useNavigate();
  const { setUser, setToken, setMessage } = useStateContext();


  useEffect(() => {
    if (!state) {
      navigate("/")
    }
  }, [state, navigate]);
  const onFinish = (data) => {
    const payload = {
      email: state.email,
      currentPassword: data.currentPassword,
      password: data.password,
      confirmPassword: data.confirmPassword
    }
    setLoading(true);
    axiosClient.post('auth/resetPassword', payload).then(({data}) => {
      setLoading(false);
      setToken(null);
      setUser(null);
      setMessage(data.message);
    }).catch(error => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    })
  }



  return (
    <Row type="flex" justify="center" align="middle">
      <Col xl={8} md={16} sm={24} xs={24}>
        <div className="p-2">
          <Card className="shadow" headStyle={{color:colors.primary, textAlign:'center', fontSize:'30px', fontWeight:'bolder'}}>
            <div style={{width:"auto", textAlign:"center"}}>
              <img src={elegantTexLogo} alt="ET-LOGO" style={{height:"80px", marginLeft:"auto", marginRight:"auto", maxWidth:"100%"}}/>
            </div>
            <div className="text-center">
              <div className="margin-bottom-md">
                <Title level={3} >Reset Your Password!</Title>
                <Text type="secondary" >Please enter your old password followed by new password</Text>
              </div>
            </div>
            <Form
              name="reset"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your old password!',
                  },
                ]}
              >
                <Input size={"large"} prefix={<LockOutlined style={{color: colors.primary}} className="site-form-item-icon"/>}
                       placeholder="Old Password"/>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your new password!',
                  },
                ]}
              >
                <Input size={"large"} prefix={<LockOutlined style={{color: colors.primary}} className="site-form-item-icon"/>}
                       type="password"
                       placeholder="New Password"/>
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({getFieldValue}) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                  }),
                ]}
              >
                <Input size={"large"}
                       prefix={<LockOutlined style={{color: colors.primary}} className="site-form-item-icon"/>}
                       type="password"
                       placeholder="Confirm Password"/>
              </Form.Item>

              <Form.Item>
                <Button loading={loading} style={{fontWeight:"bold"}} type="primary" htmlType="submit" block>
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

      </Col>
    </Row>
  );
};

export default ResetPassword;
