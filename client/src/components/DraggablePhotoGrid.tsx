import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortablePhotoProps {
  id: string;
  url: string;
  index: number;
  onRemove: (url: string) => void;
  disabled?: boolean;
}

function SortablePhoto({ id, url, index, onRemove, disabled }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square rounded-lg border overflow-hidden bg-muted"
    >
      {/* Drag Handle */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 bg-background/90 rounded cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Image */}
      <img
        src={url}
        alt={`Photo ${index + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Position Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/90 rounded text-xs font-medium">
        {index + 1}
      </div>

      {/* Remove Button */}
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(url)}
          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface DraggablePhotoGridProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  disabled?: boolean;
  helperText?: string;
}

export function DraggablePhotoGrid({
  photos,
  onChange,
  disabled = false,
  helperText,
}: DraggablePhotoGridProps) {
  const [items, setItems] = useState(photos.map((url, i) => ({ id: `photo-${i}`, url })));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update parent component
        onChange(newItems.map(item => item.url));
        
        return newItems;
      });
    }
  };

  const handleRemove = (urlToRemove: string) => {
    const newItems = items.filter(item => item.url !== urlToRemove);
    setItems(newItems);
    onChange(newItems.map(item => item.url));
  };

  // Sync items when photos prop changes
  if (photos.length !== items.length || !photos.every((url, i) => items[i]?.url === url)) {
    setItems(photos.map((url, i) => ({ id: `photo-${i}`, url })));
  }

  if (photos.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item, index) => (
              <SortablePhoto
                key={item.id}
                id={item.id}
                url={item.url}
                index={index}
                onRemove={handleRemove}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {!disabled && photos.length > 1 && (
        <p className="text-xs text-muted-foreground">
          💡 Drag photos to reorder them. The first photo will be the cover image.
        </p>
      )}
    </div>
  );
}
