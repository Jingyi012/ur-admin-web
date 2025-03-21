import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, Drawer, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
import AddForm from './components/AddForm';
import { addUser, getUsers, removeUser, updateUser } from '@/services/ant-design-pro/user';

const UserList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.User>();
  const [selectedRowsState, setSelectedRows] = useState<API.User[]>([]);

  const [newsList, setUserList] = useState<API.User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (params: { pageNumber?: number; pageSize?: number; search?: string }) => {
    try {
      setLoading(true);
      const response = await getUsers({
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
        ...params,
      });

      setUserList(response?.data.data || []);

      return {
        data: response?.data.data || [],
        success: response?.data.succeeded || false,
        total: response?.data.totalCount || 0,
      };
    } catch {
      message.error('Failed to fetch users data.');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (fields: API.RegisterUserRequest) => {
    const hide = message.loading('Adding');
    try {
      const response = await addUser(fields);
      if (response.data.succeeded !== true) {
        hide();
        message.error('Adding failed, please try again!');
      }
      hide();
      message.success('Added successfully');
      return true;
    } catch (error) {
      hide();
      message.error('Adding failed, please try again!');
      return false;
    }
  };

  const handleUpdate = async (fields: API.User) => {
    const hide = message.loading('Updating');
    try {
      const response = await updateUser(currentRow!.id!, fields);

      if (response.data.succeeded !== true) {
        hide();
        message.error('Update failed, please try again!');
        return false;
      }

      hide();
      message.success('Update is successful');
      return true;
    } catch (error) {
      hide();
      message.error('Update failed, please try again!');
      return false;
    }
  };

  const handleRemove = async (selectedRows: API.User[]) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        const hide = message.loading('Deleting');
        if (!selectedRows) return true;
        try {
          await Promise.all(selectedRows.map((row) => removeUser(row.id!)));
          hide();
          message.success('Deleted successfully');
          actionRef.current?.reloadAndRest?.();
          return true;
        } catch (error) {
          hide();
          message.error('Delete failed, please try again');
          return false;
        }
      },
    });
  };

  const columns: ProColumns<API.User>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (_, row) => (
        <div>{row.roles?.map((role, index) => <div key={index}>{role}</div>) || '-'}</div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          Update
        </a>,
        <a
          key="delete"
          onClick={async () => {
            await handleRemove([record]);
          }}
          style={{ color: 'red' }}
        >
          Delete
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.User, API.PageParams>
        headerTitle="Users List"
        actionRef={actionRef}
        rowKey="id"
        loading={loading}
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        dataSource={newsList}
        request={(params: any) =>
          fetchData({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            search: params.search,
          })
        }
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="item" />
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}
      <AddForm
        onCancel={() => handleModalOpen(false)}
        onSubmit={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        visible={createModalOpen}
      />

      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        visible={updateModalOpen}
        initialValues={currentRow || {}}
      />

      <Drawer
        width={700}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.userName && (
          <ProDescriptions<API.User>
            column={1}
            title={currentRow?.userName}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.User>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default UserList;
