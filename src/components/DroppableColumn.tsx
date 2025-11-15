import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableColumnProps {
  id: string;
  children: ReactNode;
}

export function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 min-h-[200px] mb-3 p-2 rounded-md transition-colors ${
        isOver ? 'bg-primary/10 ring-2 ring-primary' : ''
      }`}
    >
      {children}
    </div>
  );
}

