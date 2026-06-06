import { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import styled from 'styled-components';
import LockOutlined from '@ant-design/icons/LockOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--gray-2);
  padding: 24px;
`;

const Panel = styled.div`
  width: min(420px, 100%);
  background: var(--gray-1);
  border: 1px solid var(--gray-4);
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
`;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: { adid: string; password: string }) => {
    setError('');
    setSubmitting(true);
    try {
      await login(values.adid, values.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Panel>
        <div className="mb-6">
          <Logo />
          <Typography.Title level={4} className="mt-5 mb-1">
            Sign in
          </Typography.Title>
          <Typography.Text className="gray-7">
            Use your ADID and password.
          </Typography.Text>
        </div>
        {error && (
          <Alert className="mb-4" type="error" message={error} showIcon />
        )}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="ADID"
            name="adid"
            rules={[{ required: true, message: 'Enter your ADID' }]}
          >
            <Input
              autoFocus
              autoComplete="username"
              prefix={<UserOutlined />}
              onInput={(event) => {
                const input = event.currentTarget;
                input.value = input.value.toUpperCase();
              }}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Enter your password' }]}
          >
            <Input.Password
              autoComplete="current-password"
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Sign in
          </Button>
        </Form>
      </Panel>
    </Page>
  );
}
