import { LockOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, Helmet, history, useIntl, useLocation } from '@umijs/max';
import { Button, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import Settings from '../../../../config/defaultSettings';
import { resetPassword } from '@/services/ant-design-pro/auth';

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

const ResetPassword: React.FC = () => {
  const { styles } = useStyles();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get('token');
    const emailParam = query.get('email');
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
    } else {
      message.error('Invalid or missing reset token and email.');
      history.push('/user/login');
    }
  }, [location]);

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!token || !email) {
      message.error('Missing reset token or email.');
      return;
    }
    setLoading(true);
    try {
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match.');
        setLoading(false);
        return;
      }
      const response = await resetPassword({
        password: values.password,
        confirmPassword: values.confirmPassword,
        email,
        token: token,
      });
      if (response.status === 200) {
        message.success('Password reset successfully. Please log in.');
        history.push('/user/login');
      } else {
        message.error('Failed to reset password.');
      }
    } catch (error) {
      message.error('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.reset-password',
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
            await handleSubmit(values as { password: string; confirmPassword: string });
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
                  id: 'pages.resetPassword.submit',
                })}
              </Button>
            ),
          }}
        >
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.resetPassword.password.placeholder',
            })}
            rules={[
              {
                required: true,
                message: <FormattedMessage id="pages.resetPassword.password.required" />,
              },
            ]}
          />
          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.resetPassword.confirmPassword.placeholder',
              defaultMessage: 'Confirm Password',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.resetPassword.confirmPassword.required"
                    defaultMessage="Please confirm your password!"
                  />
                ),
              },
            ]}
          />
        </LoginForm>
      </div>
    </div>
  );
};

export default ResetPassword;
