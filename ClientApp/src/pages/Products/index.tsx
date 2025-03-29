import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import AddForm from './components/AddForm';
import {
  addProduct,
  getProductCategory,
  getProducts,
  removeProduct,
  updateProduct,
} from '@/services/ant-design-pro/product';
import {
  addProductImages,
  getProductImagesById,
  productImageReorder,
  removeProductImage,
} from '@/services/ant-design-pro/productImage';
import UpdateFormDrawer from './components/UpdateFormDrawer';
import UpdateFormModal from './components/UpdateForm';

const ProductsList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

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

  const fetchImages = async (productId: number) => {
    try {
      setLoading(true);
      const response = await getProductImagesById(productId);
      return response?.data.data || [];
    } catch {
      message.error('Failed to fetch product images.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (productId: number, fileList: any) => {
    const hide = message.loading('Upload images...');
    try {
      setLoading(true);
      const response = await addProductImages(productId, fileList);
      if (!response.data.succeeded) {
        hide();
        message.error('Image upload failed, please try again!');
        return false;
      }
      hide();
      if (actionRef.current) {
        actionRef.current.reload();
      }
      return true;
    } catch (error) {
      message.error('Image upload failed, please try again!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = async (imageUrl: string) => {
    const hide = message.loading('Remove images...');
    try {
      setLoading(true);
      const response = await removeProductImage({ imageUrl });
      if (!response.data.succeeded) {
        hide();
        message.error('Image removal failed, please try again!');
        return false;
      }
      hide();
      if (actionRef.current) {
        actionRef.current.reload();
      }
      message.success('Remove successful');
      return true;
    } catch (error) {
      message.error('Image removal failed, please try again!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleImageReorder = async (productId: number, imageUrls: string[]) => {
    const hide = message.loading('Reorder images...');
    try {
      const images = imageUrls.map((url, index) => ({ imageUrl: url, order: index + 1 }));

      const response = await productImageReorder({ productId, images });
      if (!response.data.succeeded) {
        hide();
        message.error('Image reorder failed, please try again!');
        return false;
      }
      hide();
      if (actionRef.current) {
        actionRef.current.reload();
      }
      message.success('Reorder successful');
      return true;
    } catch (error) {
      message.error('Image reorder failed, please try again!');
      return false;
    }
  };

  const handleAdd = async (fields: API.Products, fileList: any) => {
    const hide = message.loading('Adding product...');
    try {
      const { images, ...productData } = fields;

      const response = await addProduct(productData);
      if (!response.data.succeeded) {
        hide();
        message.error('Product creation failed, please try again!');
        return false;
      }

      const productId = response.data.data;
      let imageUploadSuccess = true;

      if (fileList.length > 0) {
        imageUploadSuccess = await handleImageUpload(productId, fileList);
      }

      hide();

      if (imageUploadSuccess) {
        message.success('Product added successfully!');
      } else {
        message.warning(
          'Product added, but image upload failed. Please upload images in update form.',
        );
      }

      return true;
    } catch (error) {
      hide();
      console.error('Product Addition Error:', error);
      message.error('An error occurred while adding the product. Please try again!');
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

  const handleRemove = async (
    selectedRows: API.Products[],
    isDrawer: boolean = false,
  ): Promise<boolean> => {
    const hide = message.loading('Deleting...');
    if (!selectedRows) return false;

    try {
      await Promise.all(selectedRows.map((row) => removeProduct(row.id!)));
      hide();
      message.success('Deleted successfully');
      actionRef?.current?.reloadAndRest?.();

      if (isDrawer) {
        handleUpdateModalOpen(false);
      }

      return true;
    } catch (error) {
      hide();
      message.error('Delete failed, please try again');
      return false;
    }
  };

  const confirmDelete = (selectedRows: API.Products[], isDrawer: boolean = false) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => handleRemove(selectedRows, isDrawer),
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
      title: 'Images',
      dataIndex: 'imageUrls',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Category',
      dataIndex: 'productCategoryId',
      valueEnum: Object.fromEntries(productCategory.map((c) => [c.id, { text: c.name }])),
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
            setIsEditMode(true);
            setCurrentRow(record);
          }}
        >
          Update
        </a>,
        <a
          key="delete"
          onClick={async () => {
            confirmDelete([record]);
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
        onSubmit={async (value, fileList) => {
          const success = await handleAdd(value as API.Products, fileList);
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

      <UpdateFormDrawer
        key={currentRow?.id ?? Date.now()}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          setTimeout(() => setCurrentRow(undefined), 300);
        }}
        visible={updateModalOpen}
        initialValues={currentRow || {}}
        productCategories={productCategory}
        isEditMode={isEditMode}
        handleImageUpload={handleImageUpload}
        handleImageDelete={handleImageRemove}
        handleImageReorder={handleImageReorder}
        fetchImages={fetchImages}
        handleDelete={async () => confirmDelete([currentRow!], true)}
      />
    </PageContainer>
  );
};

export default ProductsList;
