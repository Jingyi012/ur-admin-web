import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, message, Modal, Tag, UploadFile } from 'antd';
import React, { useRef, useState } from 'react';
import { addNews, getNews, removeNews, updateNews } from '@/services/ant-design-pro/news';
import {
  addNewsImages,
  newsImageReorder,
  removeNewsImage,
} from '@/services/ant-design-pro/newsImage';
import UpdateFormDrawer from './components/UpdateFormDrawer';
import { formatDate } from '@/helper/dateFormatHelper';

const NewsList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.News>();
  const [selectedRowsState, setSelectedRows] = useState<API.News[]>([]);

  const [newsList, setNewsList] = useState<API.News[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (params: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    year?: number;
    isActive?: boolean;
  }) => {
    try {
      setLoading(true);
      const response = await getNews({
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
        ...params,
      });

      setNewsList(response?.data.data || []);

      return {
        data: response?.data.data || [],
        success: response?.data.succeeded || false,
        total: response?.data.totalCount || 0,
      };
    } catch {
      message.error('Failed to fetch news data.');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (newsId: number, fileList: any) => {
    const hide = message.loading('Upload images...');
    try {
      setLoading(true);
      const response = await addNewsImages(newsId, fileList);
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

  const handleAdd = async (fields: API.News, fileList: any) => {
    const hide = message.loading('Adding news...');
    try {
      const response = await addNews(fields);
      if (!response.data.succeeded) {
        hide();
        message.error('News creation failed, please try again!');
        return false;
      }

      const newsId = response.data.data;
      let imageUploadSuccess = true;

      if (fileList.length > 0) {
        imageUploadSuccess = await handleImageUpload(newsId, fileList);
      }

      hide();

      if (imageUploadSuccess) {
        message.success('News added successfully!');
      } else {
        message.warning(
          'News added, but image upload failed. Please upload images in update form.',
        );
      }

      return true;
    } catch (error) {
      hide();
      message.error('An error occurred while adding the news. Please try again!');
      return false;
    }
  };

  const removeImages = async (fileList: UploadFile[]) => {
    const deletedImages =
      currentRow?.imageUrls?.filter((url) => !fileList.some((file) => file.url === url)) || [];

    if (deletedImages.length === 0) return;

    const responses = await Promise.allSettled(
      deletedImages.map((url) => removeNewsImage({ imageUrl: url })),
    );

    const failedResponses = responses.some(
      (res) => res.status === 'rejected' || (res.value && !res.value.data?.succeeded),
    );

    if (failedResponses) throw new Error('Image removal failed, please try again!');
  };

  const uploadNewImages = async (newsId: number, fileList: UploadFile[]) => {
    const newImages = fileList.filter((file) => !file.url) as UploadFile[];

    if (newImages.length === 0) return [];

    const response = await addNewsImages(newsId, newImages);
    if (!response.data.succeeded) throw new Error('Image upload failed, please try again!');

    return response.data.data;
  };

  const reorderImages = async (
    newsId: number,
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

    const response = await newsImageReorder({ newsId, images: imagesOrder });
    if (!response.data.succeeded) throw new Error('Image reorder failed, please try again!');
  };

  const updateNewsDetails = async (newsId: number, fields: API.News) => {
    const response = await updateNews(newsId, fields);
    if (!response.data.succeeded) throw new Error('News update failed, please try again!');
  };

  const handleUpdate = async (fields: API.News, fileList: UploadFile[]) => {
    const hide = message.loading('Updating...');
    const newsId = currentRow!.id!;
    console.log(fields);
    try {
      await removeImages(fileList);
      const uploadedUrls = await uploadNewImages(newsId, fileList);
      await reorderImages(newsId, fileList, uploadedUrls, currentRow?.imageUrls || []);
      await updateNewsDetails(newsId, fields);

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
    selectedRows: API.News[],
    isDrawer: boolean = false,
  ): Promise<boolean> => {
    const hide = message.loading('Deleting...');
    if (!selectedRows) return false;

    try {
      await Promise.all(selectedRows.map((row) => removeNews(row.id!)));
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

  const confirmDelete = (selectedRows: API.News[], isDrawer: boolean = false) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => handleRemove(selectedRows, isDrawer),
    });
  };

  const columns: ProColumns<API.News>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
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
      title: 'Year',
      dataIndex: 'year',
      hideInTable: true,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        optionFilterProp: 'children',
      },
      request: async () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: currentYear - 2015 + 1 }, (_, i) => ({
          label: `${currentYear - i}`,
          value: currentYear - i,
        }));
      },
      renderFormItem: (_, { type, defaultRender }) => {
        if (type === 'form') return null;
        return defaultRender(_);
      },
    },
    {
      title: 'Publish Date',
      dataIndex: 'date',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, row) => {
        if (!row.date) return '-';
        return formatDate(row.date);
      },
    },
    {
      title: 'Image',
      dataIndex: 'imageUrls',
      hideInForm: true,
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
      <ProTable<API.News, API.PageParams>
        headerTitle="News List"
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
        pagination={{ pageSize: 20 }}
        request={(params: any) =>
          fetchData({
            pageNumber: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
            title: params.title,
            year: params.year,
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
          const success = await handleUpdate(value as API.News, fileList);
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
        isEditMode={isEditMode}
        handleDelete={async () => confirmDelete([currentRow!], true)}
      />

      {/* Add Form*/}
      <UpdateFormDrawer
        onSubmit={async (value, fileList) => {
          const success = await handleAdd(value as API.News, fileList);
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

export default NewsList;
