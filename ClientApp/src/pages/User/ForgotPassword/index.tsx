import { MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Helmet, history, Link, useIntl } from '@umijs/max';
import { Button, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import Settings from '../../../../config/defaultSettings';
import { forgotPassword } from '@/services/ant-design-pro/auth';

const useStyles = createStyles(() => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { styles } = useStyles();
  const intl = useIntl();

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await forgotPassword({ email: values.email });
      if (response.status === 200) {
        message.success('Password reset link sent to your email.');
        history.push('/user/login'); // Redirect to login page after success
      } else {
        message.error('Failed to send reset link.');
      }
    } catch (error) {
      //message.error('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.forgot-password',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.png" />}
          title="UR Admin Portal"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          onFinish={async (values) => {
            await handleSubmit(values as { email: string });
          }}
          submitter={{
            render: () => (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%', height: '40px' }}
              >
                {intl.formatMessage({
                  id: 'pages.forgotPassword.sendResetLink',
                })}
              </Button>
            ),
          }}
        >
          <Tabs
            centered
            items={[
              {
                key: 'resetPassword',
                label: intl.formatMessage({
                  id: 'pages.login.resetPassword.tab',
                  defaultMessage: 'Reset Password',
                }),
              },
            ]}
          />
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.email.placeholder',
              defaultMessage: 'Email',
            })}
            rules={[
              {
                required: true,
                type: 'email',
                message: intl.formatMessage({
                  id: 'pages.login.email.required',
                  defaultMessage: 'Please input your email!',
                }),
              },
            ]}
          />
          <div>
            <Link
              to="/user/login"
              style={{
                float: 'right',
                marginBottom: 24,
              }}
            >
              Back to Login
            </Link>
          </div>
        </LoginForm>
      </div>
    </div>
  );
};

export default ForgotPassword;
