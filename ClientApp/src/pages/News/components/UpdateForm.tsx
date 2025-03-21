import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Col, Form, Row } from 'antd';
import JoditEditor from 'jodit-react';
import React, { useEffect, useRef, useState } from 'react';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.News>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  visible: boolean;
  initialValues: Partial<API.News>;
};

const UpdateForm: React.FC<UpdateFormProps> = ({ onCancel, onSubmit, visible, initialValues }) => {
  const [content, setContent] = useState(initialValues.description || '');
  const [form] = Form.useForm();
  const editor = useRef(null);

  useEffect(() => {
    setContent(initialValues.description || '');
  }, [initialValues]);

  return (
    <ModalForm
      title={'Edit News'}
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
            name="title"
            label="News Title"
            placeholder="Please enter a title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          />
          <ProFormDatePicker
            name="date"
            label="Publish Date"
            width="100%"
            rules={[{ required: true, message: 'Please select a date' }]}
            transform={(value: any) => ({
              date: value ? new Date(value).toISOString() : null,
            })}
          />
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
          />
        </Col>
      </Row>
      <ProForm.Item name="description" label="News Description">
        <JoditEditor
          ref={editor}
          value={content}
          tabIndex={1}
          onBlur={(newContent) => setContent(newContent)}
        />
      </ProForm.Item>
    </ModalForm>
  );
};

export default UpdateForm;
