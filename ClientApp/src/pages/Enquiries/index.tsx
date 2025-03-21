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
import { getEnquiries, updateEnquiry } from '@/services/ant-design-pro/enquiry';
import { removeNews } from '@/services/ant-design-pro/news';
import { EnquiryStatus, EnquiryType, getEnquiryTypeName } from '@/enum/EnquiryEnum';

const EnquiryList: React.FC = () => {
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Enquiry>();
  const [selectedRowsState, setSelectedRows] = useState<API.Enquiry[]>([]);
  const [enquiryList, setEnquiryList] = useState<API.Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const intl = useIntl();

  const fetchData = async (params: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    type?: EnquiryType;
    status?: EnquiryStatus;
    assignedTo?: string;
  }) => {
    try {
      setLoading(true);
      const response = await getEnquiries({
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
        ...params,
      });

      setEnquiryList(response?.data.data || []);

      return {
        data: response?.data.data || [],
        success: response?.data.succeeded || false,
        total: response?.data.totalCount || 0,
      };
    } catch {
      message.error('Failed to fetch enquiry data.');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (fields: Partial<API.Enquiry>) => {
    const hide = message.loading('Updating');
    try {
      const response = await updateEnquiry(fields.id!, fields);
      if (response.data.succeeded !== true) {
        hide();
        message.error('Update failed, please try again!');
        return false;
      }

      hide();
      message.success('Configuration is successful');
      return true;
    } catch (error) {
      hide();
      message.error('Configuration failed, please try again!');
      return false;
    }
  };

  const handleRemove = async (selectedRows: API.Enquiry[]) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        const hide = message.loading('Deleting');
        if (!selectedRows) return true;
        try {
          await Promise.all(selectedRows.map((row) => removeNews(row.id!)));
          hide();
          message.success('Deleted successfully');
          return true;
        } catch (error) {
          hide();
          message.error('Delete failed, please try again');
          return false;
        }
      },
    });
  };

  const columns: ProColumns<API.Enquiry>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Customer Name',
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
      title: 'Company Name',
      dataIndex: 'companyName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Enquiry Type',
      dataIndex: 'type',
      render: (_, row) => {
        return getEnquiryTypeName(row.type);
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: 'Pending',
          status: 'Default',
        },
        1: {
          text: 'Ongoing',
          status: 'Processing',
        },
        2: {
          text: 'Resolved',
          status: 'Success',
        },
        3: {
          text: 'Closed',
          status: 'Error',
        },
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created',
      valueType: 'dateTime',
      hideInTable: true,
    },
    {
      title: 'Last Updated Time',
      sorter: true,
      dataIndex: 'lastModified',
      valueType: 'dateTime',
    },
    {
      title: 'Action',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          Update
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Enquiry, API.PageParams>
        headerTitle="Enquiry List"
        actionRef={actionRef}
        rowKey="id"
        loading={loading}
        search={{
          labelWidth: 'auto',
        }}
        dataSource={enquiryList}
        request={(params: any) =>
          fetchData({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            name: params.name,
            companyName: params.companyName,
            email: params.email,
            phone: params.phone,
            type: params.type,
            status: params.status,
            assignedTo: params.assignedTo,
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
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          <Button type="primary">Batch status update</Button>
        </FooterToolbar>
      )}

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
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.Enquiry>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.Enquiry>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default EnquiryList;
