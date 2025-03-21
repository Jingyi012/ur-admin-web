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
          rules={[{ required: true, message: 'Please enter email' }]}
        />
        <ProFormText
          name="userName"
          label="User Name"
          placeholder="Please enter user name"
          rules={[{ required: true, message: 'Please enter user name' }]}
        />
        <ProFormText.Password
          name="password"
          label="Password"
          placeholder="Please enter password"
          rules={[{ required: true, message: 'Please enter a password' }]}
        />
        <ProFormText.Password
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Please enter confirm password"
          rules={[
            { required: true, message: 'Please enter confirm password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
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
