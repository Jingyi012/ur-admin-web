import { Col, Row, Divider, Button, UploadFile, Form } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  DrawerForm,
  ProFormDatePicker,
  ProForm,
} from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ImageUploader from '@/components/ImageOperation/ImageUploader';
import QuillEditor from '@/components/RichTextEditor/QuillEditor';

export type FormValueType = Partial<API.News>;

export type UpdateFormDrawerProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType, fileList: UploadFile[]) => Promise<boolean>;
  visible: boolean;
  initialValues: Partial<API.News>;
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

  const [content, setContent] = useState('');

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
      title={isAddMode ? 'Add News' : initialValues.title}
      open={visible}
      width={700}
      form={form}
      onFinish={async (values) => {
        const success = await onSubmit(values, fileList);
        if (success) {
          setSavedFileList(fileList);
          setIsEditing(false);
          setContent('');
          onCancel();
        }
      }}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setContent('');
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
                    setContent(initialValues.description ?? '');
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
      {/* News Details Section */}
      <ProCard title="News Details" bordered collapsible>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              name="title"
              label="News Title"
              placeholder="Please enter a title"
              rules={[
                { required: true, message: 'Please enter a title' },
                {
                  pattern: /^(?!\s*$).+/,
                  message: 'News title cannot be empty or contain only spaces',
                },
              ]}
              disabled={!isEditing}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="date"
              label="Publish Date"
              width="100%"
              rules={[{ required: true, message: 'Please select a date' }]}
              transform={(value: any) => ({
                date: value ? new Date(value).toISOString() : null,
              })}
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
            <ProForm.Item name="description" label="News Description">
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

      {/* News Images Section */}
      <ImageUploader
        title={'News Images'}
        fileList={fileList}
        onChange={setFileList}
        isEditMode={isEditing}
      />
    </DrawerForm>
  );
};

export default UpdateFormDrawer;
