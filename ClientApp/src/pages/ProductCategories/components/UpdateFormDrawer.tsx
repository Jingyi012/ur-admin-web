import { Button, Form, UploadFile, Image } from 'antd';
import { ProFormText, DrawerForm, ProFormUploadButton } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

export type FormValueType = Partial<API.ProductCategory>;

export type UpdateFormDrawerProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType, file: UploadFile | undefined) => Promise<boolean>;
  visible: boolean;
  initialValues: Partial<API.ProductCategory>;
  isEditMode?: boolean;
  isAddMode?: boolean;
  handleDelete?: () => Promise<void>;
};

const UpdateFormDrawer: React.FC<UpdateFormDrawerProps> = ({
  onCancel,
  onSubmit,
  visible,
  initialValues,
  isEditMode = false,
  isAddMode = false,
  handleDelete,
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<UploadFile | undefined>(undefined);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>();

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setImageFile(fileList.length > 0 ? fileList[0] : undefined);
  };

  const handleRemove = () => {
    setImageFile(undefined);
  };

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.originFileObj && URL.createObjectURL(file.originFileObj)));
    setPreviewVisible(true);
  };
  useEffect(() => {
    if (!isAddMode && initialValues) {
      setIsEditing(isEditMode);
    } else {
      setIsEditing(true);
    }
  }, [initialValues, isAddMode]);

  return (
    <DrawerForm
      title={isAddMode ? 'Add Product Category' : initialValues.name}
      open={visible}
      width={500}
      form={form}
      onFinish={async (values) => {
        const success = await onSubmit(values, imageFile ? imageFile : undefined);
        if (success) {
          setIsEditing(false);
          setImageFile(undefined);
          onCancel();
        }
      }}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setImageFile(undefined);
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
                    setImageFile(undefined);
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
      <ProCard title="Product Category Details" bordered collapsible>
        <ProFormText
          name="name"
          label="Category Name"
          rules={[{ required: true, message: 'Please input category name' }]}
          disabled={!isEditing}
        />

        {initialValues?.imageUrl ? (
          <Form.Item label="Existing Image">
            <Image
              src={initialValues.imageUrl}
              width={100}
              height={100}
              style={{
                objectFit: 'cover',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              preview={{
                visible: previewVisible,
                onVisibleChange: (visible: any) => setPreviewVisible(visible),
                afterOpenChange: (visible: any) => !visible && setPreviewImage(''),
              }}
            />
          </Form.Item>
        ) : null}

        <ProFormUploadButton
          name="image"
          label="New Image"
          max={1}
          fieldProps={{
            beforeUpload: () => false,
            onRemove: handleRemove,
            onChange: handleFileChange,
            onPreview: handlePreview,
            fileList: imageFile ? [imageFile] : [],
            accept: 'image/*',
            listType: 'picture-card',
            showUploadList: {
              showPreviewIcon: true,
              showRemoveIcon: true,
            },
          }}
          title={'Upload Image'}
          transform={() => ({})}
          rules={
            initialValues?.imageUrl
              ? []
              : [{ required: true, message: 'Please upload product category image' }]
          }
          disabled={!isEditing}
        />
        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewVisible,
              onVisibleChange: (visible: boolean | ((prevState: boolean) => boolean)) => setPreviewVisible(visible),
              afterOpenChange: (visible: any) => !visible && setPreviewImage(''),
            }}
            src={previewImage}
          />
        )}
      </ProCard>
    </DrawerForm>
  );
};

export default UpdateFormDrawer;
