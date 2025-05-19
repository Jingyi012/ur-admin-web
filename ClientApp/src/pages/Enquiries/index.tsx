import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, message, Modal, Select } from 'antd';
import React, { useRef, useState } from 'react';
import { getEnquiries, removeEnquiry, updateEnquiry } from '@/services/ant-design-pro/enquiry';
import { EnquiryStatus, EnquiryType } from '@/enum/EnquiryEnum';
import ViewDetails from './components/ViewDetails';

const EnquiryList: React.FC = () => {
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Enquiry>();
  const [selectedRowsState, setSelectedRows] = useState<API.Enquiry[]>([]);
  const [enquiryList, setEnquiryList] = useState<API.Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      const response = await updateEnquiry(currentRow!.id!, fields);
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
          await Promise.all(selectedRows.map((row) => removeEnquiry(row.id!)));
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

  const handleBatchStatusUpdate = async (selectedRows: API.Enquiry[]) => {
    let selectedStatus: EnquiryStatus | undefined;
    Modal.confirm({
      title: 'Confirm Status Update',
      content: (
        <div>
          <p>Select new status for the selected items:</p>
          <Select
            style={{ width: '100%' }}
            placeholder="Select status"
            onChange={(value) => (selectedStatus = value)}
            options={[
              { label: 'Pending', value: EnquiryStatus.Pending },
              { label: 'In Progress', value: EnquiryStatus.InProgress },
              { label: 'Resolved', value: EnquiryStatus.Resolved },
              { label: 'Closed', value: EnquiryStatus.Closed },
            ]}
          />
        </div>
      ),
      okText: 'Update',
      cancelText: 'Cancel',
      onOk: async () => {
        if (!selectedStatus) {
          message.warning('Please select a status before updating.');
          return Promise.reject();
        }
        const hide = message.loading('Updating Status');
        try {
          await Promise.all(
            selectedRows.map((row) =>
              updateEnquiry(row.id!, {
                status: selectedStatus,
                assignedTo: row.assignedTo,
                remarks: row.remarks,
              }),
            ),
          );
          hide();
          message.success('Statuses updated successfully');
          actionRef.current?.reloadAndRest?.();
          return true;
        } catch (error) {
          hide();
          message.error('Update failed, please try again');
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
      hideInDescriptions: true,
    },
    {
      title: 'Customer Name',
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              handleUpdateModalOpen(true);
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
      valueType: 'select',
      valueEnum: {
        0: { text: 'Product Enquiry' },
        1: { text: 'Consultancy Site Survey' },
        2: { text: 'Design' },
        3: { text: 'Repair & Maintenance' },
        4: { text: 'Other' },
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
          text: 'In Progress',
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
      hideInSearch: true,
    },
    {
      title: 'Last Updated Time',
      dataIndex: 'lastModified',
      valueType: 'dateTime',
      hideInSearch: true,
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
            setIsEditMode(true);
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
        pagination={{ pageSize: 20, showSizeChanger: true }}
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
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              await handleBatchStatusUpdate(selectedRowsState);
              setSelectedRows([]);
            }}
          >
            Batch status update
          </Button>
        </FooterToolbar>
      )}

      <ViewDetails
        onCancel={() => {
          handleUpdateModalOpen(false);
          setIsEditMode(false);
          setTimeout(() => setCurrentRow(undefined), 300);
        }}
        visible={updateModalOpen}
        initialValues={currentRow || {}}
        isEditMode={isEditMode}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setIsEditMode(false);
            setTimeout(() => setCurrentRow(undefined), 300);
            if (actionRef.current) {
              actionRef.current.reload();
            }
            return true;
          }
          return false;
        }}
      />
    </PageContainer>
  );
};

export default EnquiryList;
