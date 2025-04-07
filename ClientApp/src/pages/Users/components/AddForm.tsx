import { ROLE } from '@/enum/RoleEnum';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Col, Form } from 'antd';
import React from 'react';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.RegisterUserRequest>;

export type AddFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  visible: boolean;
};

const AddForm: React.FC<AddFormProps> = ({ onCancel, onSubmit, visible }) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <ModalForm
      title="Add User"
      open={visible}
      form={form}
      modalProps={{
        onCancel: () => handleCancel(),
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        await onSubmit(values);
      }}
    >
      <Col>
        <ProFormText
          name="email"
          label="Email"
          placeholder="Please enter email"
          rules={[
            { required: true, message: 'Please enter email' },
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
          ]}
        />
        <ProFormText
          name="userName"
          label="User Name"
          placeholder="Please enter user name"
          rules={[
            { required: true, message: 'Please enter user name' },
            {
              min: 6,
              message: 'User name must be at least 3 characters long',
            },
            {
              max: 20,
              message: 'User name cannot exceed 20 characters',
            },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: 'User name can only contain letters, numbers, and underscores',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          label="Password"
          placeholder="Please enter password"
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 8, message: 'Password must be at least 8 characters long' },
            {
              pattern: /[A-Z]/,
              message: 'Password must contain at least one uppercase letter',
            },
            {
              pattern: /[0-9]/,
              message: 'Password must contain at least one number',
            },
            {
              pattern: /[!@#$%^&*(),.?":{}|<>]/,
              message: 'Password must contain at least one special character',
            },
          ]}
        />
        <ProFormSelect
          name="roles"
          label="Roles"
          mode="multiple"
          options={[
            { label: 'User', value: ROLE.Basic },
            { label: 'Admin', value: ROLE.Admin },
            { label: 'Super Admin', value: ROLE.SuperAdmin },
          ]}
          placeholder="Select roles"
          rules={[{ required: true, message: 'Please select at least one role' }]}
        />
      </Col>
    </ModalForm>
  );
};

export default AddForm;
