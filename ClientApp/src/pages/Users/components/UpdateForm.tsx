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
} & Partial<API.User>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  visible: boolean;
  initialValues: Partial<API.User>;
};

const UpdateForm: React.FC<UpdateFormProps> = ({ onCancel, onSubmit, visible, initialValues }) => {
  const [form] = Form.useForm();

  return (
    <ModalForm
      title={'Edit Users'}
      open={visible}
      initialValues={initialValues}
      form={form}
      modalProps={{
        onCancel: () => onCancel(),
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

export default UpdateForm;
