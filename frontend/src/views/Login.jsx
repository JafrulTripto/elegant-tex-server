import {Button, Card, Checkbox, Col, DatePicker, Form, Input, Layout, Row, Space} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {colors} from "../utils/Colors.js";
import {useNavigate} from "react-router-dom";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import {toast} from "react-toastify";


export default function Login() {

  const navigate = useNavigate();

  const {setToken, setUser} = useStateContext();


  const onFinish = (values) => {
    const payload = {
      email: values.email,
      password: values.password
    }
    axiosClient.post('auth/login', payload).then(({data}) => {
      setToken(data.token);
      setUser(data.user);
    }).catch(error => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    })
  };

  const onFinishFailed = (errorInfo) => {
  };

  // if (isLoading) {
  //   return <CustomSpinner />
  // }
  return (
    <Layout style={{height: "100vh"}}>
      <Row type="flex" justify="center" align="middle" style={{minHeight: '100vh'}}>
        <Col xl={6}>
          <Card title="Elegant Tex" className="shadow" headStyle={{color:colors.primary, textAlign:'center', fontSize:'30px', fontWeight:'bolder'}}>
            <Form
              name="login"
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Please input your email!',
                  },
                ]}
              >
                <Input prefix={<UserOutlined style={{color: colors.primary}} className="site-form-item-icon"/>}
                       placeholder="Email"/>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your password!',
                  },
                ]}
              >
                <Input prefix={<LockOutlined style={{color: colors.primary}} className="site-form-item-icon"/>}
                       type="password"
                       placeholder="Password"/>
              </Form.Item>

              <Row>
                <Col xl={16} md={12} sm={12}>
                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                  >
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                </Col>
                <Col xl={8} md={12} sm={12} type="flex" align="end">
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Sign In
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </Layout>
  )
}
