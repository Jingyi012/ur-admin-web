import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Image } from 'antd';
import React, { useRef, useState } from 'react';
import {
  getProductCategoryList,
  createProductCategory,
  updateProductCategory,
  removeProductCategory,
} from '@/services/ant-design-pro/productCategory';
import UpdateFormDrawer from './components/UpdateFormDrawer';
import { UploadFile } from 'antd/lib';

const ProductCategoryList: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();

  // Fetch product categories
  const fetchData = async (params: { pageNumber?: number; pageSize?: number; name?: string }) => {
    setLoading(true);
    try {
      const response = await getProductCategoryList({
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
      });
      return {
        data: response?.data?.data || [],
        success: response?.data?.succeeded || false,
        total: response?.data?.totalCount || 0,
      };
    } catch {
      message.error('Failed to fetch product categories.');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Create
  const handleAdd = async (fields: any, imageFile: UploadFile | undefined) => {
    const hide = message.loading('Adding...');
    try {
      const response = await createProductCategory({
        ...fields,
        imageFile,
      });
      hide();
      if (response.data?.succeeded) {
        message.success('Added successfully!');
        setCreateModalOpen(false);
        actionRef.current?.reload();
        return true;
      }
      message.error(response.data?.message || 'Add failed, please try again!');
      return false;
    } catch (err: any) {
      hide();
      message.error(err?.response?.data?.message || 'Add failed, please try again!');
      return false;
    }
  };

  // Update
  const handleUpdate = async (fields: any, imageFile: UploadFile | undefined) => {
    const hide = message.loading('Updating...');
    try {
      const response = await updateProductCategory(currentRow.id, {
        ...fields,
        imageFile,
      });
      hide();
      if (response.data?.succeeded) {
        message.success('Updated successfully!');
        setUpdateModalOpen(false);
        setCurrentRow(undefined);
        actionRef.current?.reload();
        return true;
      }
      message.error(response.data?.message || 'Update failed, please try again!');
      return false;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message || 'Update failed, please try again!');
      return false;
    }
  };

  // Delete
  const handleRemove = async (selectedRows: any[],
    isDrawer: boolean = false) => {
    const hide = message.loading('Deleting...');
    if (!selectedRows) return false;
    try {
      const results = await Promise.all(selectedRows.map((row) => removeProductCategory(row.id)));
      hide();
      // Check each result for success
      const failed = results.find((res) => !res.data?.succeeded);
      if (failed) {
        message.error(failed.data?.message || 'Delete failed, please try again!');
        return false;
      }
      message.success('Deleted successfully!');
      actionRef.current?.reloadAndRest?.();
      setSelectedRows([]);

      if (isDrawer) {
        setUpdateModalOpen(false);
      }

      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message || 'Delete failed, please try again!');
      return false;
    }
  };

  const confirmDelete = (selectedRows: API.ProductCategory[], isDrawer: boolean = false) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this category?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => handleRemove(selectedRows, isDrawer),
    });
  };

  // Columns
  const columns: ProColumns<any>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      hideInSearch: true,
      render: (_, record) =>
        record.imageUrl ? (
          <Image
            alt="category"
            src={record.imageUrl}
            width={160}
            height="auto"
            style={{
              objectFit: 'cover',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Action',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setUpdateModalOpen(true);
            setIsEditMode(true);
          }}
        >
          Edit
        </a>,
        <a
          key="delete"
          style={{ color: 'red' }}
          onClick={() =>
            Modal.confirm({
              title: 'Confirm Deletion',
              content: 'Are you sure you want to delete this category?',
              okText: 'Yes',
              cancelText: 'No',
              onOk: () => handleRemove([record]),
            })
          }
        >
          Delete
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="Product Categories"
        actionRef={actionRef}
        rowKey="id"
        loading={loading}
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalOpen(true);
            }}
          >
            <PlusOutlined /> New
          </Button>,
        ]}
        pagination={{ pageSize: 20 }}
        request={(params: any) =>
          fetchData({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
          })
        }
        columns={columns}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
      />

      <UpdateFormDrawer
        onSubmit={async (value, file) => {
          const success = await handleAdd(value as API.ProductCategory, file);
          if (success) {
            if (actionRef.current) {
              actionRef.current.reload();
            }
            return true;
          }
          return false;
        }}
        onCancel={() => {
          setCreateModalOpen(false);
        }}
        visible={createModalOpen}
        initialValues={{}}
        isEditMode={true}
        isAddMode={true}
      />

      <UpdateFormDrawer
        onCancel={() => {
          setUpdateModalOpen(false);
          setTimeout(() => setCurrentRow(undefined), 300);
        }}
        onSubmit={async (value, file) => {
          const success = await handleUpdate(value, file);
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

      {selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Selected <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> items
            </div>
          }
        >
          <Button
            onClick={() =>
              Modal.confirm({
                title: 'Confirm Batch Deletion',
                content: 'Are you sure you want to delete selected categories?',
                okText: 'Yes',
                cancelText: 'No',
                onOk: () => handleRemove(selectedRows),
              })
            }
          >
            Batch deletion
          </Button>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default ProductCategoryList;
