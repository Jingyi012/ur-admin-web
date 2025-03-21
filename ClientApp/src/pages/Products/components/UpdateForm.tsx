import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.Products>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  visible: boolean;
  initialValues: Partial<API.Products>;
  productCategories: API.ProductCategory[];
};

const UpdateForm: React.FC<UpdateFormProps> = ({
  onCancel,
  onSubmit,
  visible,
  initialValues,
  productCategories,
}) => {
  const [form] = Form.useForm();

  const categoryOptions = productCategories.map((category: { id: number; name: string }) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <ModalForm
      title={'Edit Products'}
      open={visible}
      initialValues={initialValues}
      form={form}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        await onSubmit(values);
      }}
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
          <ProFormUploadButton
            name="image"
            label="Upload Image"
            max={1}
            fieldProps={{
              name: 'file',
              listType: 'picture-card',
            }}
            action="/upload.do"
            title="Upload Image"
            style={{ width: '100%' }}
          />
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

export default UpdateForm;
