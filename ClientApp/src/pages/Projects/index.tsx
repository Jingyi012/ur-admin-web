import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, message, Modal, Tag, UploadFile } from 'antd';
import React, { useRef, useState } from 'react';
import {
  addProject,
  getProjects,
  removeProject,
  updateProject,
} from '@/services/ant-design-pro/project';
import UpdateFormDrawer from './components/UpdateFormDrawer';
import {
  addProjectImages,
  projectImageReorder,
  removeProjectImage,
} from '@/services/ant-design-pro/projectImage';
import { formatDate } from '@/helper/dateFormatHelper';

const ProjectsList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Projects>();
  const [selectedRowsState, setSelectedRows] = useState<API.Projects[]>([]);
  const [projectList, setProjectList] = useState<API.Projects[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

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
        isPaginated: true,
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

  const handleImageUpload = async (projectId: number, fileList: any) => {
    const hide = message.loading('Upload images...');
    try {
      setLoading(true);
      const response = await addProjectImages(projectId, fileList);
      if (!response.data.succeeded) {
        hide();
        message.error(response.data?.message || 'Image upload failed, please try again!');
        return false;
      }
      hide();
      if (actionRef.current) {
        actionRef.current.reload();
      }
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Image upload failed, please try again!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (fields: API.Projects, fileList: any) => {
    const hide = message.loading('Adding project...');
    try {
      const response = await addProject(fields);
      if (!response.data.succeeded) {
        hide();
        message.error(response.data?.message || 'Project add failed, please try again!');
        return false;
      }

      const projectId = response.data.data;
      let imageUploadSuccess = true;

      if (fileList.length > 0) {
        imageUploadSuccess = await handleImageUpload(projectId, fileList);
      }

      hide();

      if (imageUploadSuccess) {
        message.success('Project added successfully!');
      } else {
        message.warning(
          'Project added, but image upload failed. Please upload images in update form.',
        );
      }

      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message || 'An error occurred while adding the project. Please try again!');
      return false;
    }
  };

  const removeImages = async (fileList: UploadFile[]) => {
    const deletedImages =
      currentRow?.imageUrls?.filter((url) => !fileList.some((file) => file.url === url)) || [];

    if (deletedImages.length === 0) return;

    const responses = await Promise.allSettled(
      deletedImages.map((url) => removeProjectImage({ imageUrl: url })),
    );

    const failedResponses = responses.some(
      (res) => res.status === 'rejected' || (res.value && !res.value.data?.succeeded),
    );

    if (failedResponses) throw new Error('Image removal failed, please try again!');
  };

  const uploadNewImages = async (projectId: number, fileList: UploadFile[]) => {
    const newImages = fileList.filter((file) => !file.url) as UploadFile[];

    if (newImages.length === 0) return [];

    const response = await addProjectImages(projectId, newImages);
    if (!response.data.succeeded) throw new Error('Image upload failed, please try again!');

    return response.data.data;
  };

  const reorderImages = async (
    projectId: number,
    fileList: UploadFile[],
    uploadedUrls: string[],
    initialImages: string[] = [],
  ) => {
    const finalImageOrder = fileList
      .map((file) => file.url || uploadedUrls.shift())
      .filter(Boolean) as string[];

    if (
      finalImageOrder.length === 0 ||
      JSON.stringify(finalImageOrder) === JSON.stringify(initialImages)
    ) {
      return;
    }

    const imagesOrder = finalImageOrder.map((url, index) => ({
      imageUrl: url,
      order: index + 1,
    }));

    const response = await projectImageReorder({ projectId, images: imagesOrder });
    if (!response.data.succeeded) throw new Error('Image reorder failed, please try again!');
  };

  const updateProjectDetails = async (projectId: number, fields: API.Projects) => {
    const response = await updateProject(projectId, fields);
    if (!response.data.succeeded) throw new Error('Project update failed, please try again!');
  };

  const handleUpdate = async (fields: API.Projects, fileList: UploadFile[]) => {
    const hide = message.loading('Updating...');
    const projectId = currentRow!.id!;

    try {
      await removeImages(fileList);
      const uploadedUrls = await uploadNewImages(projectId, fileList);
      await reorderImages(projectId, fileList, uploadedUrls, currentRow?.imageUrls || []);
      await updateProjectDetails(projectId, fields);

      message.success('Updated successfully!');
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Update failed, please try again!');
      return false;
    } finally {
      hide();
    }
  };

  const handleRemove = async (
    selectedRows: API.Projects[],
    isDrawer: boolean = false,
  ): Promise<boolean> => {
    const hide = message.loading('Deleting...');
    if (!selectedRows) return false;

    try {
      await Promise.all(selectedRows.map((row) => removeProject(row.id!)));
      hide();
      message.success('Deleted successfully!');
      actionRef?.current?.reloadAndRest?.();

      if (isDrawer) {
        handleUpdateModalOpen(false);
      }

      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message || 'Delete failed, please try again!');
      return false;
    }
  };

  const confirmDelete = (selectedRows: API.Projects[], isDrawer: boolean = false) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => handleRemove(selectedRows, isDrawer),
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
      title: 'Project Date',
      dataIndex: 'date',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, row) => {
        if (!row.date) return '-';
        return formatDate(row.date);
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
      title: 'Images',
      dataIndex: 'imageUrls',
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
        pagination={{ pageSize: 20 }}
        request={(params: any) =>
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
          const success = await handleUpdate(value as API.Projects, fileList);
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
          const success = await handleAdd(value as API.Projects, fileList);
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

export default ProjectsList;
