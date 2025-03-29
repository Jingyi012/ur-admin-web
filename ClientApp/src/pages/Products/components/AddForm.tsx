import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Col, Form, Row, UploadFile } from 'antd';
import React, { useState } from 'react';
import ImageUploadWithSort from '@/components/ImageOperation/ImageUploadWithSort';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.Products>;

export type AddFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType, fileList: UploadFile[]) => Promise<void>;
  visible: boolean;
  productCategories: API.ProductCategory[];
};

const AddForm: React.FC<AddFormProps> = ({ onCancel, onSubmit, visible, productCategories }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const categoryOptions = productCategories.map((category: { id: number; name: string }) => ({
    label: category.name,
    value: category.id,
  }));

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <ModalForm
      title="Add Products"
      open={visible}
      form={form}
      modalProps={{
        onCancel: () => handleCancel(),
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        await onSubmit(values, fileList);
      }}
      initialValues={{ isActive: true }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <ProFormText
            name="name"
            label="Product Name"
            placeholder="Please enter a product name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          />
          <ProFormSelect
            name="productCategoryId"
            label="Category"
            options={categoryOptions}
            placeholder="Please select"
            rules={[{ required: true, message: 'Please select a category' }]}
          />
          <ProFormText
            name="manufacturer"
            label="Manufacturer"
            placeholder="Please enter the manufacturer"
            rules={[{ required: true, message: 'Please enter the manufacturer' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="isActive"
            label="Display"
            options={[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ]}
            placeholder="Please select"
            rules={[{ required: true, message: 'Please select display status' }]}
          />
          <ImageUploadWithSort fileList={fileList} onFileChange={setFileList} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <ProFormTextArea
            name="description"
            label="Description"
            placeholder="Please enter a description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default AddForm;
