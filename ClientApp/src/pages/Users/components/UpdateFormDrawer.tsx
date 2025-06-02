import { Button, Form } from 'antd';
import { ProFormSelect, ProFormText, DrawerForm } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ROLE } from '@/enum/RoleEnum';

export type FormValueType = Partial<API.User>;

export type UpdateFormDrawerProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<boolean>;
  visible: boolean;
  initialValues: Partial<API.User>;
  isEditMode?: boolean;
  isAddMode?: boolean;
  handleDelete?: () => Promise<void>;
};

const UpdateFormDrawer: React.FC<UpdateFormDrawerProps> = ({
  onCancel,
  onSubmit,
  visible,
  initialValues,
  isEditMode = false,
  isAddMode = false,
  handleDelete,
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (!isAddMode && initialValues) {
      setIsEditing(isEditMode);
    } else {
      setIsEditing(true);
    }
  }, [initialValues, isAddMode]);

  return (
    <DrawerForm
      title={isAddMode ? 'Add User' : initialValues.userName}
      open={visible}
      width={500}
      form={form}
      onFinish={async (values) => {
        const success = await onSubmit(values);
        if (success) {
          setIsEditing(false);
          onCancel();
        }
      }}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          onCancel();
        }
      }}
      submitter={
        isEditing
          ? {
              searchConfig: {
                submitText: 'Submit',
              },
            }
          : false
      }
      drawerProps={{
        destroyOnClose: true,
        extra: !isAddMode && (
          <>
            <Button
              type="text"
              icon={
                <EditOutlined style={{ color: isEditing ? '#1890ff' : 'rgba(0, 0, 0, 0.45)' }} />
              }
              onClick={() => {
                setIsEditing((prev) => {
                  if (prev) {
                    form.resetFields();
                  }
                  return !prev;
                });
              }}
            />
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: 'red' }} />}
              onClick={handleDelete}
            />
          </>
        ),
      }}
      initialValues={initialValues}
    >
      <ProCard title="User Details" bordered collapsible>
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
          disabled={!isEditing}
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
          disabled={!isEditing}
        />
        {isAddMode && (
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
            disabled={!isEditing}
          />
        )}

        <ProFormSelect
          name="roles"
          label="Roles"
          mode="multiple"
          options={[
            { label: 'User', value: ROLE.Basic },
            { label: 'Admin', value: ROLE.Admin },
            // { label: 'Super Admin', value: ROLE.SuperAdmin },
          ]}
          placeholder="Select roles"
          rules={[{ required: true, message: 'Please select at least one role' }]}
          disabled={!isEditing}
        />
      </ProCard>
    </DrawerForm>
  );
};

export default UpdateFormDrawer;
