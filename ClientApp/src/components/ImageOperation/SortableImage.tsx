import { Button, Image } from 'antd';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableImage = ({
  isReordering,
  imageUrl,
  onRemove,
  isEditing = false,
}: {
  isReordering: boolean;
  imageUrl: string;
  onRemove: (imageUrl: string) => void;
  isEditing?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: imageUrl,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    margin: 8,
    position: 'relative',
    display: 'inline-block',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Image src={imageUrl} width={120} height={120} style={{ objectFit: 'cover' }} />
      {isEditing && (
        <>
          {!isReordering && (
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => onRemove(imageUrl)}
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                transition: 'opacity 0.2s',
                zIndex: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          )}

          {isReordering && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: 4,
                borderRadius: 4,
                cursor: 'grab',
              }}
              {...listeners}
            >
              <MenuOutlined />
            </div>
          )}
        </>
      )}
    </div>
  );
};
