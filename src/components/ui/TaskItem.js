import React, { useState } from 'react';
import { Trash, Calendar, Check, Edit } from 'lucide-react';
import { Button } from './button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';

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
  onStartEditing, // Add this line
  tags,
  durationOptions,
  onAddToGoogleCalendar,
}) => {
  const [editedTitle, setEditedTitle] = useState(task.title || '');
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

  const handleDragStartLocal = (e) => {
    e.stopPropagation(); // Prevent the section from being dragged
    onDragStart(e, task);
  };

  return (
      <div
        className={`bg-white rounded-lg shadow-md mb-2 flex items-stretch ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isUpdating ? 'opacity-50' : ''} task-item`}
        draggable={!isEditing}
        onDragStart={!isEditing ? handleDragStartLocal : undefined}
        onClick={(e) => {
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            e.stopPropagation(); // Prevent the click from bubbling up
            onSelect(task.id, e);
          }
        }}
      >
      {/* Left bar with tag color */}
      <div 
        className="w-2 rounded-l-lg flex-shrink-0" 
        style={{ backgroundColor: task.tag?.color || '#e5e7eb' }}
      ></div>

      {isEditing ? (
        // Render editable fields
        <div className="flex-grow px-4 py-3">
          <div className="flex items-center mb-2">
            <Input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Enter task title"
              className="mr-2 flex-grow border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center mb-2">
            <Select value={editedTag} onValueChange={setEditedTag}>
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map(tag => (
                  <SelectItem key={tag.id || `tag-${tag.name}`} value={tag.id.toString()}>
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
            <Input
              type="date"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              className="mr-2"
            />
          </div>
          <Button 
            onClick={() => onUpdateTask({
              ...task,
              title: editedTitle,
              tag: editedTag,
              duration: editedDuration === 'custom' ? editedCustomDuration : editedDuration,
              dueDate: editedDueDate,
            })}
            className="bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Update
          </Button>
        </div>
      ) : (
        // Render normal task view
        <div className="flex-grow flex items-center">
          <div className="flex-grow px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-lg font-medium text-gray-800 ${task.completed ? 'line-through' : ''}`}>
                  {task.title || 'Untitled Task'}
                </span>
                <div className="text-sm font-medium" style={{ color: task.tag?.color || '#4B5563' }}>
                  {task.tag?.name}
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex flex-col items-end mr-2">
                  <div className="text-sm text-gray-500">
                    {task.duration ? formatDuration(task.duration) : 'No Duration'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Due: {task.dueDate || 'No Due Date'}
                  </div>
                </div>
                
                {/* New divider between duration/due date and action buttons */}
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                
                <div className="flex items-center">
                  {task.dueDate && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToGoogleCalendar(task);
                        }}
                        className="text-blue-500 hover:text-blue-600 focus:outline-none p-1"
                        title="Add to Calendar" // Added tooltip
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                    className="text-red-500 hover:text-red-600 focus:outline-none p-1"
                    title="Delete Task" // Added tooltip
                  >
                    <Trash className="h-4 w-4" />
                  </button>

                  <div className="h-4 w-px bg-gray-300 mx-1"></div>
                  
                  <div className="w-1"></div> {/* Additional space before edit button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditing(task.id);
                    }}
                    className="text-gray-500 hover:text-gray-600 focus:outline-none"
                    title="Edit Task" // Added tooltip
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                            {/* Divider before checkbox */}
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  
                  {/* Checkbox */}
                  <div className="flex items-center px-1 ">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ ...task, completed: !task.completed });
                      }}
                      className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center
                        ${task.completed 
                          ? 'bg-orange-600 border-orange-600' 
                          : 'border-gray-300 hover:border-orange-600'}`}
                    >
                      {task.completed && <Check className="text-white w-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      )}

      {isUpdating && <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-50 text-blue-500">Updating...</span>}
    </div>
  );
};

export default TaskItem;