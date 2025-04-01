import React from 'react';
import { UploadFile } from 'antd';
import { ProCard, ProFormUploadButton } from '@ant-design/pro-components';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem'; // Import your SortableItem component

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

  return (
    <ProCard title={title} bordered collapsible>
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
    </ProCard>
  );
};

export default ImageUploader;
