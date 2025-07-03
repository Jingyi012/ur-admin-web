import { getEnquiryTypeName } from '@/enum/EnquiryEnum';
import { Tag, Divider, Descriptions, Button, Form, message, Drawer, Typography } from 'antd';
import { ProCard, DrawerForm } from '@ant-design/pro-components';
import { EditOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';
import { ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { useEffect, useState } from 'react';
import { getUserSelections } from '@/services/ant-design-pro/user';
import { getEnquiryHistory } from '@/services/ant-design-pro/enquiry';
import { formatDateTime } from '@/helper/dateFormatHelper';
const { Text } = Typography;
export type ViewDetailsDrawerProps = {
  onCancel: () => void;
  visible: boolean;
  initialValues: Partial<API.Enquiry>;
  onSubmit: (values: Partial<API.Enquiry>) => Promise<boolean>;
  isEditMode: boolean;
};

const ViewDetails: React.FC<ViewDetailsDrawerProps> = ({
  onCancel,
  visible,
  initialValues,
  onSubmit,
  isEditMode,
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userList, setUserList] = useState<API.User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<API.EnquiryHistory[]>([]);

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await getUserSelections();
      setUserList(response?.data.data || []);
    } catch {
      message.error('Failed to fetch users data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiryHistory = async () => {
    try {
      setLoading(true);
      const response = await getEnquiryHistory(initialValues.id!);
      setHistoryList(response?.data.data || []);
    } catch {
      message.error('Failed to fecth history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userList.length === 0) {
      fetchUserList();
    }
  }, [isEditing]);

  const getStatusTag = (status?: number) => {
    const statusMap = {
      0: { text: 'Pending', color: 'default' },
      1: { text: 'In Progress', color: 'processing' },
      2: { text: 'Resolved', color: 'success' },
      3: { text: 'Closed', color: 'error' },
    };

    if (status === undefined) return '-';
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      text: 'Unknown',
      color: 'default',
    };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  useEffect(() => {
    if (initialValues) {
      setIsEditing(isEditMode);
    }
  }, [initialValues]);

  return (
    <DrawerForm
      loading={loading}
      form={form}
      title={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>{initialValues.name || 'Enquiry Details'}</span>
          {initialValues ? getStatusTag(initialValues.status) : ''}
        </div>
      }
      open={visible}
      width={800}
      onFinish={async (values) => {
        const success = await onSubmit({
          id: initialValues.id,
          ...values,
        });
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
      initialValues={initialValues}
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
        extra: (
          <>
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => {
                setIsHistoryOpen(true);
                fetchEnquiryHistory();
              }}
            />

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
          </>
        ),
      }}
    >
      {/* 1. Customer Information (Always Read-only) */}
      <ProCard title="Customer Information" bordered>
        <Descriptions column={2}>
          <Descriptions.Item label="Customer Name">{initialValues.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Company Name">
            {initialValues.companyName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {initialValues.email ? (
              <a href={`mailto:${initialValues.email}`}>{initialValues.email}</a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">{initialValues.phone || '-'}</Descriptions.Item>
        </Descriptions>
      </ProCard>

      <Divider />

      {/* 2. Enquiry Details */}
      <ProCard title="Enquiry Details" bordered>
        <Descriptions column={2}>
          <Descriptions.Item label="Enquiry Type">
            {getEnquiryTypeName(initialValues.type)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {isEditing ? (
              <ProFormSelect
                name="status"
                label={null}
                options={[
                  { value: 0, label: 'Pending' },
                  { value: 1, label: 'In Progress' },
                  { value: 2, label: 'Resolved' },
                  { value: 3, label: 'Closed' },
                ]}
              />
            ) : (
              getStatusTag(initialValues.status)
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDateTime(initialValues.created)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {formatDateTime(initialValues.lastModified)}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions column={1} style={{ marginTop: 16 }}>
          {(initialValues.message || '-').split('\n').map((line, index) => {
            const [label, ...rest] = line.split(':');
            if (rest.length > 0) {
              let value = rest.join(':').trim();
              const trimmedLabel = label.trim();
              if (trimmedLabel === 'Preferred Date & Time') {
                value = formatDateTime(value);
              }
              return (
                <Descriptions.Item key={`desc-${index}`} label={trimmedLabel}>
                  {value}
                </Descriptions.Item>
              );
            }

            return (
              <Descriptions.Item key={`desc-${index}`} label="Note">
                {line}
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      </ProCard>

      <Divider />

      {/* 3. Admin Section */}
      <ProCard title="Administration" bordered>
        {isEditing ? (
          <>
            <ProFormSelect
              name="assignedTo"
              label="Assigned To"
              options={userList.map((user) => ({
                label: user.userName,
                value: user.id,
              }))}
              placeholder="Select a user"
              showSearch
              rules={[{ required: true, message: 'Please select a user' }]}
            />
            <ProFormTextArea
              name="remarks"
              label="Remarks"
              placeholder="Add any additional notes"
              fieldProps={{ rows: 3 }}
            />
          </>
        ) : (
          <Descriptions column={1}>
            <Descriptions.Item label="Assigned To">
              {userList.find(user => user.id === initialValues.assignedTo)?.userName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Remarks">{initialValues.remarks || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </ProCard>
      <Drawer
        title="Enquiry History"
        open={isHistoryOpen}
        loading={loading}
        onClose={() => setIsHistoryOpen(false)}
        width={500}
      >
        <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>
          {historyList?.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: '#fff',
              }}
            >
              {/* Header: Timestamp + User */}
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}
              >
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {item.lastModified ? new Date(item.lastModified).toLocaleString() : '-'}
                </Text>
                <Divider type="vertical" style={{ margin: 0 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                  <Text strong style={{ fontSize: 13 }}>
                    {item.lastModifiedBy || 'System'}
                  </Text>
                </div>
              </div>

              {/* Changes */}
              <div style={{ marginLeft: '8px' }}>
                {/* Status */}
                {item.status !== undefined && (
                  <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Status:
                    </Text>
                    <div style={{ marginLeft: '4px' }}>{getStatusTag(item.status)}</div>
                  </div>
                )}

                {/* Assigned To */}
                {item.assignedTo && (
                  <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Assigned To:
                    </Text>
                    <Text strong style={{ marginLeft: '4px', fontSize: 13 }}>
                      {item.assignedTo}
                    </Text>
                  </div>
                )}

                {/* Remarks */}
                {item.remarks && (
                  <div style={{ display: 'flex' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Remarks:
                    </Text>
                    <Text italic style={{ marginLeft: '4px', fontSize: 13 }}>
                      &quot;{item.remarks}&quot;
                    </Text>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </DrawerForm>
  );
};

export default ViewDetails;
