import { Col, Row, Divider, Button, UploadFile, Form } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  DrawerForm,
  ProForm,
} from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ImageUploader from '@/components/ImageOperation/ImageUploader';
import QuillEditor from '@/components/RichTextEditor/QuillEditor';

export type FormValueType = Partial<API.Products>;

export type UpdateFormDrawerProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType, fileList: UploadFile[]) => Promise<boolean>;
  visible: boolean;
  initialValues: Partial<API.Products>;
  productCategories: API.ProductCategory[];
  isEditMode?: boolean;
  isAddMode?: boolean;
  handleDelete?: () => Promise<void>;
};

const UpdateFormDrawer: React.FC<UpdateFormDrawerProps> = ({
  onCancel,
  onSubmit,
  visible,
  initialValues,
  productCategories,
  isEditMode = false,
  isAddMode = false,
  handleDelete,
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [savedFileList, setSavedFileList] = useState<UploadFile[]>([]);

  const [content, setContent] = useState('');

  const categoryOptions = productCategories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  useEffect(() => {
    if (!isAddMode && initialValues) {
      const existingImageUrls = initialValues.imageUrls || [];

      const existingFileList: UploadFile[] = existingImageUrls.map((url, index) => ({
        uid: `${index}`,
        name: `Image-${index + 1}`,
        status: 'done',
        url,
      }));
      setFileList(existingFileList);
      setSavedFileList(existingFileList);
      setIsEditing(isEditMode);
      setContent(initialValues.description || '');
    } else {
      setFileList([]);
      setSavedFileList([]);
      setIsEditing(true);
    }
  }, [initialValues, isAddMode]);

  return (
    <DrawerForm
      title={isAddMode ? 'Add Product' : initialValues.name}
      open={visible}
      width={800}
      form={form}
      onFinish={async (values) => {
        const success = await onSubmit(values, fileList);
        if (success) {
          setSavedFileList(fileList);
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
        extra: !isAddMode && (
          <>
            <Button
              type="text"
              icon={
                <EditOutlined style={{ color: isEditing ? '#1890ff' : 'rgba(0, 0, 0, 0.45)' }} />
              }
              onClick={() => {
                setIsEditing((prev) => {
                  if (prev) {
                    form.resetFields();
                    setFileList(savedFileList);
                  }
                  return !prev;
                });
              }}
            />
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: 'red' }} />}
              onClick={handleDelete}
            />
          </>
        ),
      }}
      initialValues={initialValues}
    >
      {/* Product Details Section */}
      <ProCard title="Product Details" bordered collapsible>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              name="name"
              label="Product Name"
              placeholder="Please enter product name"
              rules={[
                { required: true, message: 'Please enter product name' },
                {
                  pattern: /^(?!\s*$).+/,
                  message: 'Project name cannot be empty or contain only spaces',
                },
              ]}
              disabled={!isEditing}
            />
            <ProFormSelect
              name="productCategoryId"
              label="Category"
              options={categoryOptions}
              placeholder="Please select a category"
              rules={[{ required: true, message: 'Please select a category' }]}
              disabled={!isEditing}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              name="manufacturer"
              label="Manufacturer"
              placeholder="Please enter manufacturer"
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
              placeholder="Please select display status"
              rules={[{ required: true, message: 'Please select display status' }]}
              initialValue={true}
              disabled={!isEditing}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <ProForm.Item name="description" label="Description">
              <QuillEditor
                value={content}
                onChange={(newContent) => setContent(newContent)}
                isEditMode={isEditing}
              />
            </ProForm.Item>
          </Col>
        </Row>
      </ProCard>

      <Divider />

      {/* Product Images Section */}
      <ImageUploader
        title={'Product Images'}
        fileList={fileList}
        onChange={setFileList}
        isEditMode={isEditing}
      />
    </DrawerForm>
  );
};

export default UpdateFormDrawer;
