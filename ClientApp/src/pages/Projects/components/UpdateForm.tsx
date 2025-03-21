import {
  ModalForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Col, Form, Row } from 'antd';
import React from 'react';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.Projects>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  visible: boolean;
  initialValues: Partial<API.Projects>;
};

const UpdateForm: React.FC<UpdateFormProps> = ({ onCancel, onSubmit, visible, initialValues }) => {
  const [form] = Form.useForm();

  return (
    <ModalForm
      title={'Edit Projects'}
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
            label="Project Name"
            placeholder="Please enter a project name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormDatePicker
            name="date"
            label="Project Date"
            rules={[{ required: true, message: 'Please select a date' }]}
            width="100%"
            transform={(value: any) => ({
              date: value ? new Date(value).toISOString() : null,
            })}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <ProFormDigit
            name="latitude"
            label="Latitude"
            placeholder="Please enter the latitude"
            rules={[{ required: true, message: 'Please enter the latitude' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormDigit
            name="longitude"
            label="Longitude"
            placeholder="Please enter the longitude"
            rules={[{ required: true, message: 'Please enter the longitude' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
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
        </Col>
        <Col span={12}>
          {/* <ProFormUploadButton
            name="image"
            label="Upload Image"
            max={1}
            fieldProps={{
              name: 'file',
              listType: 'picture-card',
            }}
            action="/upload.do"
            title="Upload Image"
          /> */}
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
