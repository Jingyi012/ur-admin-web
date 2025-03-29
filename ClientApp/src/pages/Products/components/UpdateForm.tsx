import { Modal, Col, Row, Form, Divider, Button, Tabs } from 'antd';
import { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { ProCard, ProForm } from '@ant-design/pro-components';
import React, { useCallback, useEffect, useState } from 'react';
import ImageSection from '@/components/ImageOperation/ImageSection';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.Products>;

export type UpdateFormModalProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  visible: boolean;
  initialValues: Partial<API.Products>;
  productCategories: API.ProductCategory[];
  isEditMode: boolean;
  handleImageUpload: (productId: number, fileList: any) => Promise<boolean>;
  handleImageDelete: (url: string) => Promise<boolean>;
  handleImageReorder: (productId: number, newOrder: string[]) => Promise<boolean>;
  fetchImages: (productId: number) => Promise<string[]>;
  handleDelete: () => Promise<void>;
};

const { TabPane } = Tabs;

const UpdateFormModal: React.FC<UpdateFormModalProps> = ({
  onCancel,
  onSubmit,
  visible,
  initialValues,
  productCategories,
  isEditMode = false,
  handleImageUpload,
  handleImageDelete,
  handleImageReorder,
  fetchImages,
  handleDelete,
}) => {
  const [form] = Form.useForm();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [imagesEditing, setImagesEditing] = useState<boolean>(false);

  const categoryOptions = productCategories.map((category: { id: number; name: string }) => ({
    label: category.name,
    value: category.id,
  }));

  useEffect(() => {
    if (initialValues) {
      setImageUrls(initialValues.imageUrls || []);
      setIsEditing(isEditMode);
      setImagesEditing(isEditMode);
    }
  }, [initialValues]);

  return (
    <Modal
      title={initialValues.name}
      open={visible}
      onCancel={() => {
        setIsEditing(false);
        onCancel();
      }}
      width={700}
      footer={null}
      destroyOnClose
    >
      {/* Product Details Section */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Product Details" key="1">
          <ProCard
            title="Product Details"
            bordered
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button
                  icon={
                    <EditOutlined
                      style={{ color: isEditing ? '#1890ff' : 'rgba(0, 0, 0, 0.45)' }}
                    />
                  }
                  onClick={() => {
                    if (isEditing) {
                      form.resetFields();
                    }
                    setIsEditing((prev) => !prev);
                  }}
                />
                <Button icon={<DeleteOutlined style={{ color: 'red' }} />} onClick={handleDelete} />
              </div>
            }
          >
            <ProForm
              title="Product Details"
              form={form}
              initialValues={initialValues}
              onFinish={async (values) => {
                await onSubmit(values);
                setIsEditing(false);
              }}
              submitter={
                isEditing
                  ? {
                      searchConfig: {
                        submitText: 'Submit',
                        resetText: 'Cancel',
                      },
                      render: (_, dom) => [
                        <Button key="cancel" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>,
                        dom[1],
                      ],
                    }
                  : false
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <ProFormText
                    name="name"
                    label="Product Name"
                    placeholder="Enter product name"
                    rules={[{ required: true, message: 'Please enter product name' }]}
                    disabled={!isEditing}
                  />
                  <ProFormSelect
                    name="productCategoryId"
                    label="Category"
                    options={categoryOptions}
                    placeholder="Select category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                    disabled={!isEditing}
                  />
                </Col>
                <Col span={12}>
                  <ProFormText
                    name="manufacturer"
                    label="Manufacturer"
                    placeholder="Enter manufacturer"
                    rules={[{ required: true, message: 'Please enter manufacturer' }]}
                    disabled={!isEditing}
                  />
                  <ProFormSelect
                    name="isActive"
                    label="Display"
                    options={[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false },
                    ]}
                    placeholder="Select"
                    rules={[{ required: true, message: 'Please select display status' }]}
                    disabled={!isEditing}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <ProFormTextArea
                    name="description"
                    label="Description"
                    placeholder="Enter description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                    disabled={!isEditing}
                  />
                </Col>
              </Row>
            </ProForm>
          </ProCard>
        </TabPane>

        <TabPane tab="Images" key="2">
          {/* Product Images Section */}
          <ImageSection
            itemId={initialValues.id!}
            title="Product Images"
            imageUrls={imageUrls}
            onUpload={async (itemId, file) => {
              const success = await handleImageUpload(itemId, file);
              if (success) {
                const newImageUrls = await fetchImages(itemId);
                setImageUrls(newImageUrls);
              }
            }}
            onRemove={async (url) => {
              const success = await handleImageDelete(url);
              if (success) {
                const newImageUrls = imageUrls.filter((imageUrl) => imageUrl !== url);
                setImageUrls(newImageUrls);
              }
            }}
            onReorder={(newOrder) => setImageUrls(newOrder)}
            saveReorder={handleImageReorder}
            isEditMode={imagesEditing}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default UpdateFormModal;
