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
import React, { useEffect, useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
import AddForm from './components/AddForm';
import {
  addProduct,
  getProductCategory,
  getProducts,
  removeProduct,
  updateProduct,
} from '@/services/ant-design-pro/product';

const ProductsList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Products>();
  const [selectedRowsState, setSelectedRows] = useState<API.Products[]>([]);
  const [productList, setProductList] = useState<API.Products[]>([]);
  const [productCategory, setProductCategory] = useState<API.ProductCategory[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const intl = useIntl();

  const fetchData = async (params: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    productCategoryId?: number;
    manufacturer?: string;
    isActive?: boolean;
  }) => {
    try {
      setLoading(true);
      const response = await getProducts({
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
        ...params,
      });

      setProductList(response?.data.data || []);

      return {
        data: response?.data.data || [],
        success: response?.data.succeeded || false,
        total: response?.data.totalCount || 0,
      };
    } catch {
      message.error('Failed to fetch products data.');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCategory = async () => {
    try {
      setLoading(true);
      const response = await getProductCategory();
      setProductCategory(response?.data.data || []);
    } catch {
      message.error('Failed to fetch product category.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (fields: API.Products) => {
    const hide = message.loading('Adding');
    try {
      const response = await addProduct(fields);
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

  const handleUpdate = async (fields: API.Products) => {
    const hide = message.loading('Updating');
    try {
      const response = await updateProduct(currentRow!.id!, fields);

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

  const handleRemove = async (selectedRows: API.Products[]) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        const hide = message.loading('Deleting');
        if (!selectedRows) return true;
        try {
          await Promise.all(selectedRows.map((row) => removeProduct(row.id!)));
          hide();
          message.success('Deleted successfully');
          actionRef?.current?.reloadAndRest?.();
          return true;
        } catch (error) {
          hide();
          message.error('Delete failed, please try again');
          return false;
        }
      },
    });
  };

  const columns: ProColumns<API.Products>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Product Name',
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
      title: 'Images',
      dataIndex: 'images',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: 'Category',
      dataIndex: 'productCategoryId',
      render: (_, row) => {
        const category = productCategory.find((c) => c.id === row.productCategoryId);
        return category ? category.name : 'Other';
      },
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
    },
    {
      title: 'Display',
      dataIndex: 'isActive',
      valueEnum: {
        true: { text: 'Yes', status: 'Success' },
        false: { text: 'No', status: 'Error' },
      },
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

  useEffect(() => {
    fetchProductCategory();
    fetchData({ pageNumber: 1, pageSize: 20 });
  }, []);

  return (
    <PageContainer>
      <ProTable<API.Products, API.PageParams>
        headerTitle="Products List"
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
        dataSource={productList}
        request={(params: any) =>
          fetchData({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            name: params.name,
            productCategoryId: params.productCategoryId,
            manufacturer: params.manufacturer,
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
          const success = await handleAdd(value as API.Products);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        visible={createModalOpen}
        productCategories={productCategory}
      />

      <UpdateForm
        key={currentRow?.id ?? Date.now()}
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
        productCategories={productCategory}
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
          <ProDescriptions<API.Products>
            column={1}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.Products>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ProductsList;
