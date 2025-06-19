import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import { addUser, getUsers, removeUser, updateUser } from '@/services/ant-design-pro/user';
import UpdateFormDrawer from './components/UpdateFormDrawer';

const UserList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

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
    const hide = message.loading('Adding...');
    try {
      const response = await addUser(fields);
      if (response.data.succeeded !== true) {
        hide();
        message.error(response.data?.message || 'Add failed, please try again!');
      }
      hide();
      message.success('Added successfully');
      return true;
    } catch (error) {
      hide();
      message.error('Add failed, please try again!');
      return false;
    }
  };

  const handleUpdate = async (fields: API.User) => {
    const hide = message.loading('Updating...');
    try {
      const response = await updateUser(currentRow!.id!, fields);

      if (response.data.succeeded !== true) {
        hide();
        message.error(response.data?.message || 'Update failed, please try again!');
        return false;
      }

      hide();
      message.success('Updated successfully!');
      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message || 'Update failed, please try again!');
      return false;
    }
  };

  const handleRemove = async (
    selectedRows: API.User[],
    isDrawer: boolean = false,
  ): Promise<boolean> => {
    const hide = message.loading('Deleting...');
    if (!selectedRows) return false;

    try {
      await Promise.all(selectedRows.map((row) => removeUser(row.id!)));
      hide();
      message.success('Deleted successfully!');
      actionRef?.current?.reloadAndRest?.();

      if (isDrawer) {
        handleUpdateModalOpen(false);
      }

      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message || 'Delete failed, please try again!');
      return false;
    }
  };

  const confirmDelete = (selectedRows: API.User[], isDrawer: boolean = false) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => handleRemove(selectedRows, isDrawer),
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
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              handleUpdateModalOpen(true);
              setIsEditMode(false);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      hideInSearch: true,
    },
    {
      title: 'User Name / Email',
      dataIndex: 'search',
      hideInTable: true,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      hideInSearch: true,
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
            setIsEditMode(true);
            setCurrentRow(record);
          }}
        >
          Edit
        </a>,
        <a
          key="delete"
          onClick={async () => {
            await confirmDelete([record]);
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
              await confirmDelete(selectedRowsState);
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

      <UpdateFormDrawer
        onCancel={() => {
          handleUpdateModalOpen(false);
          setTimeout(() => setCurrentRow(undefined), 300);
        }}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            if (actionRef.current) {
              actionRef.current.reload();
            }
            return true;
          }
          return false;
        }}
        visible={updateModalOpen}
        initialValues={currentRow || {}}
        isEditMode={isEditMode}
        handleDelete={async () => confirmDelete([currentRow!], true)}
      />

      <UpdateFormDrawer
        onSubmit={async (value) => {
          const success = await handleAdd(value as API.RegisterUserRequest);
          if (success) {
            if (actionRef.current) {
              actionRef.current.reload();
            }
            return true;
          }
          return false;
        }}
        onCancel={() => {
          handleModalOpen(false);
        }}
        visible={createModalOpen}
        initialValues={{}}
        isEditMode={true}
        isAddMode={true}
      />
    </PageContainer>
  );
};

export default UserList;
