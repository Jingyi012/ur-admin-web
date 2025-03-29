import React, { useState } from 'react';
import { UploadFile } from 'antd';
import { ProFormUploadButton } from '@ant-design/pro-components';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem'; // Import your SortableItem component

interface ImageUploadWithSortProps {
  fileList: UploadFile[];
  onFileChange: (fileList: UploadFile[]) => void;
}

const ImageUploadWithSort: React.FC<ImageUploadWithSortProps> = ({ fileList, onFileChange }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    onFileChange(fileList);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fileList.findIndex((file) => file.uid === active.id);
      const newIndex = fileList.findIndex((file) => file.uid === over.id);
      const updatedList = arrayMove(fileList, oldIndex, newIndex);
      onFileChange(updatedList);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fileList.map((file) => file.uid)} strategy={rectSortingStrategy}>
        <ProFormUploadButton
          name="images"
          label="Upload Images"
          fieldProps={{
            fileList,
            listType: 'picture-card',
            multiple: true,
            beforeUpload: () => false,
            onChange: handleFileChange,
            itemRender: (originNode, file) => (
              <SortableItem id={file.uid}>{originNode}</SortableItem>
            ),
          }}
          title="Upload Image"
        />
      </SortableContext>
    </DndContext>
  );
};

export default ImageUploadWithSort;
