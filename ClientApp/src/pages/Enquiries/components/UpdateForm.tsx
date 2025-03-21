import { getUserOptions } from '@/services/ant-design-pro/user';
import { ModalForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.Enquiry>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<API.Enquiry>;
};

const UpdateForm: React.FC<UpdateFormProps> = ({ onCancel, onSubmit, updateModalOpen, values }) => {
  const [userList, setUserList] = useState<API.User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await getUserOptions();
      setUserList(response?.data.data || []);
    } catch {
      message.error('Failed to fetch users data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  return (
    <ModalForm
      title="Update Enquiry"
      open={updateModalOpen}
      initialValues={values}
      loading={loading}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        await onSubmit(values);
      }}
    >
      <ProFormSelect
        name="status"
        label="Status"
        valueEnum={{
          0: 'Pending',
          1: 'Ongoing',
          2: 'Resolved',
          3: 'Closed',
        }}
        placeholder="Select a status"
        rules={[{ required: true, message: 'Please select a status' }]}
      />
      <ProFormSelect
        name="assignedTo"
        label="Assigned To"
        options={userList.map((user) => ({ value: user.id, label: user.name }))}
        placeholder="Select a user"
        showSearch
        rules={[{ required: true, message: 'Please select a user' }]}
      />
      <ProFormTextArea name="remarks" label="Remarks" placeholder="Enter remarks" />
    </ModalForm>
  );
};

export default UpdateForm;
