import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { UploadFile } from 'antd';
import { ProFormUploadButton } from '@ant-design/pro-components';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface ImageUploadWithSubmissionProps {
  visible: boolean;
  onCancel: (flag?: boolean) => void;
  handleImageUpload: (fileList: UploadFile[]) => Promise<void>;
}

const ImageUploadWithSubmission: React.FC<ImageUploadWithSubmissionProps> = ({
  handleImageUpload,
  visible,
  onCancel,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fileList.findIndex((file) => file.uid === active.id);
      const newIndex = fileList.findIndex((file) => file.uid === over.id);
      const updatedList = arrayMove(fileList, oldIndex, newIndex);
      setFileList(updatedList);
    }
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      return;
    }
    setLoading(true);
    try {
      await handleImageUpload(fileList);
      onCancel(false); // Close modal on successful upload
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button onClick={() => onCancel(false)} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit} loading={loading}>
          Submit
        </Button>
      </div>
    </>
  );
};

export default ImageUploadWithSubmission;
