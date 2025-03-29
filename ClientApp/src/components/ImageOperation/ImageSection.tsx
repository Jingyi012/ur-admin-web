import { useCallback, useEffect, useState } from 'react';
import { Upload, Button, Tooltip, Row, Col, message, UploadFile } from 'antd';
import { DragOutlined, EditOutlined, PictureOutlined, PlusOutlined } from '@ant-design/icons';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableImage } from './SortableImage';
import { ProCard } from '@ant-design/pro-components';
import ImageUploadWithSubmission from './ImageUploadWIthSubmission';

interface ImageSectionProps {
  itemId: number;
  title: string;
  imageUrls: string[];
  onUpload: (id: number, fileList: UploadFile[]) => Promise<void>;
  onRemove: (url: string) => void;
  onReorder: (newOrder: string[]) => void;
  saveReorder: (id: number, newOrder: string[]) => void;
  isEditMode?: boolean;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  itemId,
  title,
  imageUrls,
  onUpload,
  onRemove,
  onReorder,
  saveReorder,
  isEditMode = false,
}) => {
  const [isReordering, setIsReordering] = useState(false);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async () => {
    console.log('Uploading files:', fileList);
    await onUpload(itemId, fileList);

    return false;
  };

  const handleFileChange = ({ fileList }: { fileList: any }) => {
    setFileList(fileList);
  };

  const handleSaveNewOrder = () => {
    saveReorder(itemId, imageUrls);
    setIsReordering(false);
  };

  const cancelSaveOrder = () => {
    onReorder(initialImages);
    setIsReordering(false);
  };

  // const handleOpenDrawer = useCallback(() => {
  //   setInitialImages(imageUrls);
  // }, [imageUrls]);

  // useEffect(() => {
  //   handleOpenDrawer();
  // }, [handleOpenDrawer]);

  useEffect(() => {
    setIsEditing(isEditMode);
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const newOrder = [...imageUrls];
    const oldIndex = newOrder.indexOf(active.id);
    const newIndex = newOrder.indexOf(over.id);

    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id);

    onReorder(newOrder); // Update parent state
  };

  return (
    <ProCard
      title={title}
      extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle Edit Mode Button */}
          <Button
            icon={<EditOutlined style={{ color: isEditing ? '#1890ff' : 'rgba(0, 0, 0, 0.45)' }} />}
            onClick={() => {
              setIsEditing((prev) => !prev);
              if (isEditing) {
                setFileList([]);
                setIsReordering(false);
              }
            }}
          ></Button>

          {isEditing && (
            <>
              {!isReordering && (
                <Button
                  icon={
                    <PlusOutlined
                      style={{
                        color: isUploadVisible ? 'rgba(2, 187, 33, 0.8)' : 'rgba(0, 0, 0, 0.45)',
                      }}
                    />
                  }
                  onClick={() => {
                    setIsUploadVisible((prev) => !prev);
                  }}
                ></Button>
              )}

              {imageUrls.length > 0 && (
                <Tooltip title="Enable drag images to reorder">
                  <Button
                    icon={
                      <DragOutlined
                        style={{
                          color: isReordering ? 'rgba(178, 86, 20, 0.84)' : 'rgba(0, 0, 0, 0.45)',
                        }}
                      />
                    }
                    onClick={() => {
                      setIsReordering((prev) => !prev);
                    }}
                  />
                </Tooltip>
              )}
            </>
          )}
        </div>
      }
      bordered
    >
      <Row gutter={16}>
        <Col span={24}>
          {isUploadVisible && (
            <ImageUploadWithSubmission
              visible={isUploadVisible}
              onCancel={() => setIsUploadVisible(false)}
              handleImageUpload={(fileList) => onUpload(itemId, fileList)}
            />
          )}
          <br />
          {/* Drag & Drop Image List */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={imageUrls} strategy={rectSortingStrategy}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {imageUrls.map((url) => (
                  <SortableImage
                    isReordering={isReordering}
                    key={url}
                    imageUrl={url}
                    onRemove={() => onRemove(url)}
                    isEditing={isEditing}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {isReordering && (
            <div
              style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
            >
              <Button onClick={cancelSaveOrder}>Cancel</Button>
              <Button type="primary" onClick={handleSaveNewOrder}>
                Save Order
              </Button>
            </div>
          )}

          {/* Empty State - Different displays based on edit mode */}
          {imageUrls.length === 0 && (
            <div className="empty-state">
              <div
                style={{
                  textAlign: 'center',
                  color: 'rgba(0, 0, 0, 0.25)',
                }}
              >
                <PictureOutlined style={{ fontSize: 26 }} />
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  No images to display
                </p>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </ProCard>
  );
};

export default ImageSection;
