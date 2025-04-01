import { Col, Row, Divider, Button, UploadFile, Form } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  DrawerForm,
  ProFormDatePicker,
  ProFormDigit,
} from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ImageUploader from '@/components/ImageOperation/ImageUploader';

export type FormValueType = Partial<API.Projects>;

export type UpdateFormDrawerProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType, fileList: UploadFile[]) => Promise<boolean>;
  visible: boolean;
  initialValues: Partial<API.Projects>;
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [savedFileList, setSavedFileList] = useState<UploadFile[]>([]);

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
    } else {
      form.resetFields();
      setFileList([]);
      setSavedFileList([]);
      setIsEditing(true);
    }
  }, [initialValues, isAddMode]);

  return (
    <DrawerForm
      title={isAddMode ? 'Add Project' : initialValues.name}
      open={visible}
      width={700}
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
      {/* Project Details Section */}
      <ProCard title="Project Details" bordered collapsible>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              name="name"
              label="Project Name"
              placeholder="Please enter a project name"
              rules={[
                { required: true, message: 'Please enter project name' },
                {
                  pattern: /^(?!\s*$).+/,
                  message: 'Project name cannot be empty or contain only spaces',
                },
              ]}
              disabled={!isEditing}
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
              disabled={!isEditing}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormDigit
              name="latitude"
              label="Latitude"
              placeholder="Please enter the latitude"
              rules={[
                { required: true, message: 'Please enter the latitude' },
                {
                  type: 'number',
                  min: -90,
                  max: 90,
                  message: 'Latitude must be between -90 and 90',
                },
              ]}
              disabled={!isEditing}
            />
          </Col>
          <Col span={12}>
            <ProFormDigit
              name="longitude"
              label="Longitude"
              placeholder="Please enter the longitude"
              rules={[
                { required: true, message: 'Please enter the longitude' },
                {
                  type: 'number',
                  min: -180,
                  max: 180,
                  message: 'Longitude must be between -180 and 180',
                },
              ]}
              disabled={!isEditing}
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
              initialValue={true}
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
              rules={[{ required: false, message: 'Please enter description' }]}
              disabled={!isEditing}
            />
          </Col>
        </Row>
      </ProCard>

      <Divider />

      {/* Project Images Section */}
      <ImageUploader
        title={'Project Images'}
        fileList={fileList}
        onChange={setFileList}
        isEditMode={isEditing}
      />
    </DrawerForm>
  );
};

export default UpdateFormDrawer;
