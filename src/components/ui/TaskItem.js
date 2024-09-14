import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TaskItem = ({ task, onDelete, onUpdate, onDragStart, onSelect, isSelected, isUpdating }) => {
  const tagColor = task.tag?.color || 'transparent';
  const tagName = task.tag?.name || '';

  return (
    <div
      className={`task-item mb-2 p-2 border-2 rounded flex items-center justify-between ${
        task.completed ? 'bg-gray-300 text-gray-800' : ''
      } ${isSelected ? 'bg-slate-900 text-white' : ''} ${isUpdating ? 'opacity-50' : ''}`}
      style={{ borderColor: tagColor }}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={(e) => onSelect(task.id, e)}
    >
      <div className="flex items-center flex-grow">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onUpdate({ ...task, completed: !task.completed })}
          className="mr-2"
          onClick={(e) => e.stopPropagation()}
        />
        <span className={`${task.completed ? 'line-through' : ''} flex-grow`}>
          {task.title}
          {tagName && (
            <span className={`ml-2 text-sm ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
              ({tagName})
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center">
        <span className={`text-sm mr-2 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>Due: {task.dueDate || 'No Due Date'}</span>
        <Button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="mr-2">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      {isUpdating && <span className="ml-2">Updating...</span>}
    </div>
  );
};

export default TaskItem;