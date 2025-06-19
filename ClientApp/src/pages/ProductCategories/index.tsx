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
import UpdateForm from './components/UpdateForm';

const ProductCategoryList: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();
  const [imageFile, setImageFile] = useState<any>();

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
  const handleAdd = async (fields: any) => {
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
        setImageFile(undefined);
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
  const handleUpdate = async (fields: any) => {
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
        setImageFile(undefined);
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
  const handleRemove = async (rows: any[]) => {
    const hide = message.loading('Deleting...');
    try {
      const results = await Promise.all(rows.map((row) => removeProductCategory(row.id)));
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
      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message || 'Delete failed, please try again!');
      return false;
    }
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
            setImageFile(undefined);
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
              setImageFile(undefined);
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

      {/* Create Modal */}
      <UpdateForm
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (values) => handleAdd(values)}
        title="Create Product Category"
        imageFile={imageFile}
        setImageFile={setImageFile}
      />

      {/* Update Modal */}
      <UpdateForm
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        onFinish={async (values) => handleUpdate(values)}
        initialValues={currentRow}
        title="Update Product Category"
        imageFile={imageFile}
        setImageFile={setImageFile}
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
