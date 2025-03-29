import React, { useEffect, useState } from 'react';
import { message, Upload, UploadFile } from 'antd';
import { ProFormUploadButton } from '@ant-design/pro-components';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem'; // Import your SortableItem component

interface ImageUploadProps {
  existingImages: string[];
  uploadImage: (file: File) => Promise<string>;
  onDeleteImage: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ existingImages }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const handleRemove = (file: UploadFile) => {
    if (file.url) {
      setDeletedImages((prev) => [...prev, file.url]);
    }
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isLt5MB = file.size / 1024 / 1024 < 5;

    if (!isImage) {
      message.error('Only image files are allowed!');
      return Upload.LIST_IGNORE;
    }
    if (!isLt5MB) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }

    // Track new images
    setNewImages((prev) => [...prev, file]);
    return false; // Prevent auto upload
  };

  const uploadNewImages = async () => {
    const uploadedUrls: string[] = [];

    for (const file of newImages) {
      try {
        const response = await uploadAPI(file);
        uploadedUrls.push(response.url);
      } catch (error) {
        message.error(`Failed to upload ${file.name}`);
      }
    }
    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async () => {
    message.loading('Uploading images...');

    const uploadedUrls = await uploadNewImages();
    if (!uploadedUrls.length && !deletedImages.length) {
      message.info('No changes detected.');
      return;
    }

    // Remove deleted images from backend
    if (deletedImages.length > 0) {
      await deleteAPI(deletedImages);
    }

    // Map new uploads with the correct order
    const finalImageOrder = fileList
      .map((file) => file.url || uploadedUrls.shift()) // Assign new URLs where applicable
      .filter(Boolean) as string[];

    // Update image order in backend
    await reorderAPI(finalImageOrder);

    message.success('Images updated successfully!');
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

  useEffect(() => {
    setFileList(
      existingImages.map((url, index) => ({
        uid: `${index}`,
        name: `Image-${index + 1}`,
        status: 'done',
        url,
      })),
    );
  }, [existingImages]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fileList.map((file) => file.uid)} strategy={rectSortingStrategy}>
        <ProFormUploadButton
          name="images"
          label="Upload Images"
          fieldProps={{
            fileList,
            beforeUpload,
            onRemove: handleRemove,
            onChange: handleFileChange,
            listType: 'picture-card',
            multiple: true,
            accept: 'image/*',
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

export default ImageUpload;
