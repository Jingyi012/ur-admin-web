import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableItem = ({
  id,
  style = {}, // Ensure a default empty object to avoid errors
  children,
}: {
  id: string;
  style?: React.CSSProperties; // Use React.CSSProperties for better type safety
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const combinedStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    ...style,
  };

  return (
    <div ref={setNodeRef} style={combinedStyle} {...attributes} {...listeners}>
      {children}
    </div>
  );
};
