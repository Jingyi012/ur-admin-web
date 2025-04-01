import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, message, Modal, Tag, UploadFile } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  addProduct,
  getProductCategory,
  getProducts,
  removeProduct,
  updateProduct,
} from '@/services/ant-design-pro/product';
import {
  addProductImages,
  productImageReorder,
  removeProductImage,
} from '@/services/ant-design-pro/productImage';
import UpdateFormDrawer from './components/UpdateFormDrawer';

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

  const handleAdd = async (fields: API.Products, fileList: any) => {
    const hide = message.loading('Adding product...');
    try {
      const response = await addProduct(fields);
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
      message.error('An error occurred while adding the product. Please try again!');
      return false;
    }
  };

  const removeImages = async (fileList: UploadFile[]) => {
    const deletedImages =
      currentRow?.imageUrls?.filter((url) => !fileList.some((file) => file.url === url)) || [];

    if (deletedImages.length === 0) return;

    const responses = await Promise.allSettled(
      deletedImages.map((url) => removeProductImage({ imageUrl: url })),
    );

    const failedResponses = responses.some(
      (res) => res.status === 'rejected' || (res.value && !res.value.data?.succeeded),
    );

    if (failedResponses) throw new Error('Image removal failed, please try again!');
  };

  const uploadNewImages = async (productId: number, fileList: UploadFile[]) => {
    const newImages = fileList.filter((file) => !file.url) as UploadFile[];

    if (newImages.length === 0) return [];

    const response = await addProductImages(productId, newImages);
    if (!response.data.succeeded) throw new Error('Image upload failed, please try again!');

    return response.data.data;
  };

  const reorderImages = async (
    productId: number,
    fileList: UploadFile[],
    uploadedUrls: string[],
    initialImages: string[] = [],
  ) => {
    const finalImageOrder = fileList
      .map((file) => file.url || uploadedUrls.shift())
      .filter(Boolean) as string[];

    if (JSON.stringify(finalImageOrder) === JSON.stringify(initialImages)) {
      return;
    }

    const imagesOrder = finalImageOrder.map((url, index) => ({
      imageUrl: url,
      order: index + 1,
    }));

    const response = await productImageReorder({ productId, images: imagesOrder });
    if (!response.data.succeeded) throw new Error('Image reorder failed, please try again!');
  };

  const updateProductDetails = async (productId: number, fields: API.Products) => {
    const response = await updateProduct(productId, fields);
    if (!response.data.succeeded) throw new Error('Product update failed, please try again!');
  };

  const handleUpdate = async (fields: API.Products, fileList: UploadFile[]) => {
    const hide = message.loading('Updating...');
    const productId = currentRow!.id!;

    try {
      await removeImages(fileList);
      const uploadedUrls = await uploadNewImages(productId, fileList);
      await reorderImages(productId, fileList, uploadedUrls, currentRow?.imageUrls || []);
      await updateProductDetails(productId, fields);

      message.success('Update successful');
      return true;
    } catch (error: any) {
      message.error(error.message || 'Update failed, please try again!');
      return false;
    } finally {
      hide();
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
        return record.isActive ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>;
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
        key={currentRow?.id ?? Date.now()}
        onSubmit={async (value, fileList) => {
          const success = await handleUpdate(value as API.Products, fileList);
          if (success) {
            if (actionRef.current) {
              actionRef.current.reload();
            }
            return true;
          }
          return false;
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          setTimeout(() => setCurrentRow(undefined), 300);
        }}
        visible={updateModalOpen}
        initialValues={currentRow || {}}
        productCategories={productCategory}
        isEditMode={isEditMode}
        handleDelete={async () => confirmDelete([currentRow!], true)}
      />

      {/* Add Form*/}
      <UpdateFormDrawer
        onSubmit={async (value, fileList) => {
          const success = await handleAdd(value as API.Products, fileList);
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
        productCategories={productCategory}
        isEditMode={true}
        isAddMode={true}
      />
    </PageContainer>
  );
};

export default ProductsList;
