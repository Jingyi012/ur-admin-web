import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
import AddForm from './components/AddForm';
import {
  addProject,
  getProjects,
  removeProject,
  updateProject,
} from '@/services/ant-design-pro/project';

const ProjectsList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Projects>();
  const [selectedRowsState, setSelectedRows] = useState<API.Projects[]>([]);
  const [projectList, setProjectList] = useState<API.Projects[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const intl = useIntl();

  const fetchData = async (params: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    isActive?: boolean;
  }) => {
    try {
      setLoading(true);
      const response = await getProjects({
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
        isAdmin: true,
        ...params,
      });

      setProjectList(response?.data.data || []);

      return {
        data: response?.data.data || [],
        success: response?.data.succeeded || false,
        total: response?.data.totalCount || 0,
      };
    } catch {
      message.error('Failed to fetch projects data.');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (fields: API.Projects) => {
    const hide = message.loading('Adding');
    try {
      const response = await addProject(fields);
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

  const handleUpdate = async (fields: API.Projects) => {
    const hide = message.loading('Updating');
    try {
      const response = await updateProject(currentRow!.id!, fields);

      if (response.data.succeeded !== true) {
        hide();
        message.error('Update failed, please try again!');
        return false;
      }

      hide();
      message.success('Update successful');
      return true;
    } catch (error) {
      hide();
      message.error('Update failed, please try again!');
      return false;
    }
  };

  const handleRemove = async (selectedRows: API.Projects[]) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        const hide = message.loading('Deleting');
        if (!selectedRows) return true;
        try {
          await Promise.all(selectedRows.map((row) => removeProject(row.id!)));
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

  const columns: ProColumns<API.Projects>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: 'Project Date',
      dataIndex: 'date',
      valueType: 'dateTime',
      sorter: true,
      render: (_, row) => {
        if (!row.date) return '-';
        const date = new Date(row.date);
        return date.toLocaleDateString('en-CA');
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Latitude',
      dataIndex: 'latitude',
      hideInSearch: true,
    },
    {
      title: 'Longitude',
      dataIndex: 'longitude',
      hideInSearch: true,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Display',
      dataIndex: 'isActive',
      render: (_, record) => {
        return record.isActive ? 'Yes' : 'No';
      },
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
      <ProTable<API.Projects, API.PageParams>
        headerTitle="Projects List"
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
        dataSource={projectList}
        request={(params) =>
          fetchData({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            name: params.name,
            isActive: params.isActive,
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
          const success = await handleAdd(value as API.Projects);
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
        {currentRow?.name && (
          <ProDescriptions<API.Projects>
            column={1}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.Projects>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ProjectsList;
