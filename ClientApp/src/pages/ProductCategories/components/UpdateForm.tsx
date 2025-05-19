import { ModalForm, ProFormText, ProFormUploadButton } from '@ant-design/pro-components';
import { Form, UploadFile, Image } from 'antd';
import React, { useState } from 'react';

interface UpdateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: any) => Promise<boolean>;
  initialValues?: any;
  title: string;
  imageFile: UploadFile | undefined;
  setImageFile: (file: UploadFile | undefined) => void;
}

const UpdateForm: React.FC<UpdateFormProps> = ({
  open,
  onOpenChange,
  onFinish,
  initialValues,
  title,
  imageFile,
  setImageFile,
}) => {
  const [form] = Form.useForm();
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

  return (
    <>
      <ModalForm
        title={title}
        open={open}
        form={form}
        onOpenChange={onOpenChange}
        onFinish={onFinish}
        initialValues={initialValues}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="name"
          label="Category Name"
          rules={[{ required: true, message: 'Please input category name' }]}
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
                onVisibleChange: (visible) => setPreviewVisible(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
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
          rules={[{ required: true, message: 'Please upload product category image' }]}
        />
      </ModalForm>

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewVisible,
            onVisibleChange: (visible) => setPreviewVisible(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default UpdateForm;
