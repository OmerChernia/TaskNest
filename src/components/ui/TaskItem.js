import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import { Button } from './button';
import { Input } from '@/components/ui/input'; // Adjust the path as needed
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'; // Add this if you use Select components

function formatDuration(duration) {
  const mins = parseFloat(duration);
  if (isNaN(mins)) return duration; // Handle custom text
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours} hr${hours > 1 ? 's' : ''}${remainingMins ? ` ${remainingMins} min` : ''}`;
  } else {
    return `${mins} min`;
  }
}

const TaskItem = ({
  task,
  onDelete,
  onUpdate,
  onDragStart,
  onSelect,
  isSelected,
  isUpdating,
  isEditing,
  onUpdateTask,
  tags,
  durationOptions,
}) => {
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedTag, setEditedTag] = useState(task.tag?.id || '');
  const [editedDuration, setEditedDuration] = useState(task.duration || '');
  const [editedCustomDuration, setEditedCustomDuration] = useState('');
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || '');

  const handleDurationChange = (value) => {
  setEditedDuration(value);
  if (value !== 'custom') {
    setEditedCustomDuration('');
    }
  };

  const handleDragStart = (e) => {
    e.stopPropagation(); // Prevent the section from being dragged
    onDragStart(e, task);
  };

  return (
    <div
      className={`task-item mb-2 p-2 border-2 rounded flex flex-col ${
        task.completed ? 'bg-stone-800 text-zinc-400' : ''
      } ${isSelected ? 'bg-slate-900 text-white' : ''} ${isUpdating ? 'opacity-50' : ''}`}
      style={{ borderColor: task.tag?.color }}
      draggable={!isEditing}
      onDragStart={!isEditing ? handleDragStart : undefined}
      onClick={(e) => onSelect(task.id, e)}
    >
      {isEditing ? (
        // Render editable fields
        <>
          <div className="flex items-center mb-2">
            <Input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Enter task title"
              className="mr-2 flex-grow"
            />
            <Button onClick={() => onUpdateTask({
              ...task,
              title: editedTitle,
              tag: editedTag,
              duration: editedDuration === 'custom' ? editedCustomDuration : editedDuration,
              dueDate: editedDueDate,
            })}>
              Update
            </Button>
          </div>
          <div className="flex items-center mb-2">
            {/* Tag Select */}
            <Select value={editedTag} onValueChange={setEditedTag}>
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Duration Select */}
            <Select value={editedDuration} onValueChange={handleDurationChange}>
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editedDuration === 'custom' && (
              <Input
                type="text"
                value={editedCustomDuration}
                onChange={(e) => setEditedCustomDuration(e.target.value)}
                placeholder="Enter duration in minutes"
                className="mr-2"
              />
            )}
            {/* Due Date */}
            <Input
              type="date"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              className="mr-2"
            />
          </div>
        </>
      ) : (
        // Render normal task view
        <div className="flex items-center justify-between">
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
              {task.tag?.name && (
                <span className={`ml-2 text-sm ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                  ({task.tag?.name})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`text-sm mr-2 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
              Due: {task.dueDate || 'No Due Date'}
            </span>
            <span className={`text-sm mr-2 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
              Duration: {task.duration ? formatDuration(task.duration) : 'No Duration'}
            </span>
            <Button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="mr-2">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {isUpdating && <span className="ml-2">Updating...</span>}
    </div>
  );
};

export default TaskItem;