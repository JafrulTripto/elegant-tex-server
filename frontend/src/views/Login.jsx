import { Alert, Button, Card, Col, Form, Input, Layout, Row, Typography, theme } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import useAxiosClient from "../axios-client.js";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { useEffect, useState } from "react";
import Loading from "../components/Util/Loading";
import elegantTexLogo from '../assets/images/eleganttex-logo-only.png'


export default function Login() {

  const axiosClient = useAxiosClient();
  const { setToken, message, setMessage } = useStateContext();

  const [loading, setLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);
  const { Title, Text } = Typography;
  const { token } = theme.useToken();

  useEffect(() => {
    if (message) {
      setLoginMessage({ message, type: "info" });
    }

    setTimeout(() => {
      setLoginMessage(null);
      setMessage("");
    }, 15000)
  }, [message, setMessage])

  const onFinish = (values) => {
    const payload = {
      email: values.email,
      password: values.password
    }
    setLoading(true);
    axiosClient.post('auth/login', payload).then(({ data }) => {
      setToken(data.access_token, data.expires_in);
      setLoading(false);
    }).catch(error => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      setLoginMessage({ message: message, type: "error" });
      setLoading(false);
    })
  };

  const onFinishFailed = (errorInfo) => {
  };

  if (loading) {
    return <Loading />
  }
  return (
    <Layout style={{ minHeight: "100vh", background: token.colorBgLayout }}>
      <Row type="flex" justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xl={6} md={12} sm={20} xs={22}>
          <div className="p-2">
            <Card
              bordered={false}
              className="shadow-xl"
              style={{ borderRadius: token.borderRadiusLG * 1.5 }}
              bodyStyle={{ padding: '40px' }}
            >
              <div style={{ width: "auto", textAlign: "center", marginBottom: 24 }}>
                <img src={elegantTexLogo} alt="ET-LOGO" style={{ height: "64px", margin: "0 auto" }} />
              </div>
              <div className="text-center mb-8">
                {loginMessage ? (
                  <Alert message={loginMessage.message} type={loginMessage.type} showIcon className="mb-4" />
                ) : (
                  <>
                    <Title level={2} style={{ marginBottom: 8, color: token.colorTextHeading }}>Welcome back</Title>
                    <Text type="secondary" >Please enter your details to sign in</Text>
                  </>
                )}
              </div>
              <Form
                name="login"
                size="large"
                layout="vertical"
                initialValues={{
                  remember: true,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your email!',
                    },
                    {
                      type: 'email',
                      message: 'Please enter a valid email!',
                    }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: token.colorTextPlaceholder }} />}
                    placeholder="Enter your email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: token.colorTextPlaceholder }} />}
                    placeholder="Enter your password"
                  />
                </Form.Item>


                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" block size="large" style={{ fontWeight: 600 }}>
                    Sign in
                  </Button>
                </Form.Item>

              </Form>
            </Card>
            <div className="text-center mt-6 text-slate-400 text-sm">
              Elegant Tex Server © {new Date().getFullYear()}
            </div>
          </div>

        </Col>
      </Row>
    </Layout>
  )
}
