import React, { useState } from 'react';
import { UploadFile, Image } from 'antd';
import { ProCard, ProFormUploadButton } from '@ant-design/pro-components';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface ImageUploaderProps {
  title: string;
  fileList: UploadFile[];
  onChange: (updatedList: UploadFile[]) => void;
  isEditMode?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, fileList, onChange, isEditMode }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
      enabled: isEditMode,
    }),
  );
  const dsensors = useSensors();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>();

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    onChange(fileList);
  };

  const handleRemove = (file: UploadFile) => {
    onChange(fileList.filter((item) => item.uid !== file.uid));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fileList.findIndex((file) => file.uid === active.id);
      const newIndex = fileList.findIndex((file) => file.uid === over.id);
      const updatedList = arrayMove(fileList, oldIndex, newIndex);
      onChange(updatedList);
    }
  };

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.originFileObj && URL.createObjectURL(file.originFileObj)));
    setPreviewVisible(true);
  };

  return (
    <ProCard
      title={title}
      bordered
      collapsible
      tooltip={isEditMode ? 'Drag images to reorder (First is the main display)' : undefined}
    >
      <DndContext
        sensors={isEditMode ? sensors : dsensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fileList.map((file) => file.uid)} strategy={rectSortingStrategy}>
          <ProFormUploadButton
            fieldProps={{
              fileList,
              beforeUpload: () => false,
              onRemove: handleRemove,
              onChange: handleFileChange,
              onPreview: handlePreview,
              listType: 'picture-card',
              multiple: true,
              accept: 'image/*',
              itemRender: (originNode, file) => (
                <SortableItem id={file.uid} style={{ width: '102px', height: '102px' }}>
                  {originNode}
                </SortableItem>
              ),
            }}
            title="Upload Image"
            disabled={!isEditMode}
          />
        </SortableContext>
      </DndContext>
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
    </ProCard>
  );
};

export default ImageUploader;
