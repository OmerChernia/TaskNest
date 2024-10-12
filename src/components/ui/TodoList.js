"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash, GripVertical, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { useHotkeys } from 'react-hotkeys-hook';
import TaskItem from './TaskItem';
import { useRouter } from 'next/router';
import Header from '../Header.js';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const initialTags = [
  { id: 1, name: 'Work', color: '#ff0000' },
  { id: 2, name: 'Personal', color: '#00ff00' },
  { id: 3, name: 'Shopping', color: '#0000ff' },
];

const initialSections = [
  { id: 'new-tasks', name: 'New Tasks', type: 'section' },
  { id: 'sunday', name: 'Sunday', type: 'section' },
  { id: 'monday', name: 'Monday', type: 'section' },
  { id: 'tuesday', name: 'Tuesday', type: 'section' },
  { id: 'wednesday', name: 'Wednesday', type: 'section' },
  { id: 'thursday', name: 'Thursday', type: 'section' },
  { id: 'friday', name: 'Friday', type: 'section' },
  { id: 'saturday', name: 'Saturday', type: 'section' }
];

const durationOptions = [
  { value: 'None', label: 'No Duration' },
  { value: '5', label: '5 min' },
  { value: '10', label: '10 min' },
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '25', label: '25 min' },
  { value: '30', label: '30 min' },
  { value: '35', label: '35 min' },
  { value: '40', label: '40 min' },
  { value: '45', label: '45 min' },
  { value: '50', label: '50 min' },
  { value: '55', label: '55 min' },
  { value: '60', label: '1 hr' },
  { value: '90', label: '1.5 hr' },
  { value: '120', label: '2 hr' },
  { value: 'custom', label: 'Custom' },
];

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState(initialTags);
  const [nestedSections, setNestedSections] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');
  const [isEditingSections, setIsEditingSections] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredSectionPath, setHoveredSectionPath] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession(); 
  const [taskDuration, setTaskDuration] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const accessToken = session?.accessToken;
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [taskToAddToCalendar, setTaskToAddToCalendar] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekSectionIds = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const defaultSectionIds = [
    'new-tasks',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const [draggedTasks, setDraggedTasks] = useState([]);


  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
      fetchTags();
      fetchSections();
      setIsMounted(true); // Add this line
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      let data = await response.json();
      console.log('Fetched tasks:', data);
  
      data = data.map(task => {
        if (!task.weekKey) {
          const taskWeekKey = task.dueDate ? getWeekStartDateForDate(task.dueDate) : getWeekStartDate(0);
          return { ...task, weekKey: taskWeekKey };
        }
        return task;
      });
  
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

const getWeekStartDateForDate = (dateStr) => {
  const date = new Date(dateStr);
  const dayIndex = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayIndex);
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
};

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
      });
      if (response.ok) {
        const fetchedTags = await response.json();
        setTags(fetchedTags);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tags');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      alert('Error fetching tags: ' + error.message);
    }
  };

  const addTag = async () => {
    try {
      const tagData = {
        name: newTagName,
        color: newTagColor
      };
      console.log('Tag data before adding:', tagData);
  
      const response = await fetch('/api/tags', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add tag');
      }
  
      const newTag = await response.json();
      setTags(prevTags => [...prevTags, newTag]);
      setNewTagName('');
      setNewTagColor('#000000');
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Failed to add tag: ' + error.message);
    }
  };

  const deleteTag = async (tagId) => {
    try {
      const response = await fetch(`/api/tags?id=${encodeURIComponent(tagId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        const updatedTags = tags.filter(tag => tag.id !== tagId);
        setTags(updatedTags);
        const updatedTasks = tasks.map(task =>
          task.tag?.id === tagId ? { ...task, tag: null } : task
        );
        setTasks(updatedTasks);
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag: ' + error.message);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
      });
      if (response.ok) {
        const fetchedSections = await response.json();
        console.log('Fetched sections:', fetchedSections);
        const sectionsToSet = fetchedSections.length > 0 ? fetchedSections : initialSections;
        setNestedSections(sectionsToSet);
        setSectionVisibility(() => {
          const initialVisibility = {};
          sectionsToSet.forEach(section => {
            initialVisibility[section.id] = true;
            if (section.children) {
              const childVisibilities = getChildSectionVisibilities(section.children);
              Object.assign(initialVisibility, childVisibilities);
            }
          });
          return initialVisibility;
        });
      } else {
        throw new Error('Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const getChildSectionVisibilities = (children) => {
    const visibilities = {};
    children.forEach(child => {
      visibilities[child.id] = true;
      if (child.children) {
        const childVisibilities = getChildSectionVisibilities(child.children);
        Object.assign(visibilities, childVisibilities);
      }
    });
    return visibilities;
  };

  const updateSections = async (updatedSections) => {
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sections: updatedSections }),
      });
      if (!response.ok) {
        throw new Error('Failed to update sections');
      }
    } catch (error) {
      console.error('Error updating sections:', error);
    }
  };

  const addSection = (type) => {
    const newItem = type === 'divider'
      ? { id: `divider-${Date.now()}`, type: 'divider' }
      : { id: String(Date.now()), name: newSectionName || 'New Section', type: 'section', children: [] };

    const updatedSections = [...nestedSections, newItem];
    setNestedSections(updatedSections);
    updateSections(updatedSections);
    setNewSectionName('');
  };

  const deleteSection = (sectionId) => {
    if (defaultSectionIds.includes(sectionId)) {
      alert('Default sections cannot be deleted.');
      return;
    }
    const updatedSections = removeSectionById([...nestedSections], sectionId);
    setNestedSections(updatedSections);
    updateSections(updatedSections);
  };

  const removeSectionById = (sections, id) => {
    return sections.filter(section => {
      if (section.id === id) return false;
      if (section.children) {
        section.children = removeSectionById(section.children, id);
      }
      return true;
    });
  };

  const toggleSectionVisibility = (sectionId) => {
    setSectionVisibility(prevVisibility => ({
      ...prevVisibility,
      [sectionId]: !prevVisibility[sectionId]
    }));
  };

  const handleTaskSelection = useCallback((taskId, event) => {
    const id = taskId.toString(); // Ensure the ID is a string
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      setSelectedTasks((prevSelected) => {
        if (prevSelected.includes(id)) {
          return prevSelected.filter((selectedId) => selectedId !== id);
        } else {
          return [...prevSelected, id];
        }
      });
    }
  }, []);

  const clearTaskSelection = () => {
    setSelectedTasks([]);
    setEditingTaskId(null);
  };

  const deleteSelectedTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedTasks }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tasks');
      }
  
      // Update local state
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error deleting tasks:', error);
      alert('Failed to delete tasks: ' + error.message);
    }
  };

  const handleTaskUpdate = async (updatedTaskData) => {
    try {
      setUpdatingTaskId(updatedTaskData.id);
  
      // Find the full tag object
      const fullTag = tags.find(tag => tag.id.toString() === updatedTaskData.tag.toString());
      const updatedTask = {
        ...updatedTaskData,
        tag: fullTag || null,
        googleCalendarEventId: null, // Clear the Google Calendar event ID
      };
  
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
  
      const data = await response.json();
      setTasks(prevTasks => prevTasks.map(task => (task.id === data.id ? data : task)));
      setEditingTaskId(null); // Exit edit mode
      setSelectedTasks([]); // Clear selection
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  useHotkeys('delete', deleteSelectedTasks, [selectedTasks]);
  useHotkeys('cmd+d, ctrl+d', (event) => {
    event.preventDefault();
    if (selectedTasks.length > 0) {
      // Collect all selected tasks to duplicate
      const tasksToDuplicate = tasks.filter(task => selectedTasks.includes(task.id));
      duplicateTask(tasksToDuplicate);
    }
  }, [selectedTasks, tasks]);

  const onTaskDragStart = (e, task) => {
    e.stopPropagation();
  
    let tasksToDrag = [];
    if (selectedTasks.includes(task.id.toString())) {
      // If the task is selected, drag all selected tasks
      tasksToDrag = tasks.filter(t => selectedTasks.includes(t.id.toString()));
    } else {
      // If the task is not selected, drag only that task
      tasksToDrag = [task];
    }
  
    setDraggedTasks(tasksToDrag);
    // Optionally, set a custom drag image or data
  };

  const onTaskDragOver = (e, sectionId) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(sectionId);
  };

  const onTaskDragLeave = (e) => {
    e.stopPropagation();
    setDropTarget(null);
  };

  const onTaskDrop = async (e, targetSectionId) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (draggedTasks.length === 0) return;
  
    // Show a loading indicator if needed
    setUpdatingTaskId('batch-update'); // You can use a special value to indicate batch update
  
    const updatedTasksPromises = draggedTasks.map(async (task) => {
      const updatedTask = {
        ...task,
        section: targetSectionId,
      };
  
      if (weekSectionIds.includes(targetSectionId)) {
        updatedTask.weekKey = getWeekStartDate(weekOffset);
      } else {
        delete updatedTask.weekKey;
      }
  
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update task section');
        }
  
        const updatedTaskFromServer = await response.json();
        return updatedTaskFromServer;
      } catch (error) {
        console.error('Error updating task section:', error);
        return null;
      }
    });
  
    const updatedTasks = await Promise.all(updatedTasksPromises);
  
    setTasks(prevTasks =>
      prevTasks.map(task => {
        const updatedTask = updatedTasks.find(t => t && t.id === task.id);
        return updatedTask ? updatedTask : task;
      })
    );
  
    // Reset dragged tasks and drop target
    setDraggedTasks([]);
    setDropTarget(null);
    setUpdatingTaskId(null);
  };

  const handleDragStart = (e, section, path) => {
    e.stopPropagation();
    setDraggedSection({ section, path });
    e.dataTransfer.setData('text/plain', JSON.stringify(section));
    setIsDragging(true);
  };

  const handleDragOver = (e, section, index, path) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height / 3) {
      setDropIndicator(`${path.join('-')}-top`);
    } else if (y > (height * 2) / 3) {
      setDropIndicator(`${path.join('-')}-bottom`);
    } else {
      setDropIndicator(`${path.join('-')}-middle`);
    }
    setHoveredSectionPath(JSON.stringify(path));
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setDropIndicator(null);
    setHoveredSectionPath(null);
  };

  const handleDrop = (e, targetItem, targetPath) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSection) return;

    const updatedSections = JSON.parse(JSON.stringify(nestedSections)); // Deep clone

    const removeSectionAtPath = (sections, path) => {
      const index = path[0];
      if (path.length === 1) {
        return sections.splice(index, 1)[0];
      } else {
        const nextPath = path.slice(1);
        sections[index].children = sections[index].children || [];
        return removeSectionAtPath(sections[index].children, nextPath);
      }
    };

    const insertSectionAtPath = (sections, path, sectionToInsert) => {
      const index = path[0];
      if (path.length === 0) {
        // If path is empty, insert at root level
        sections.push(sectionToInsert);
        return;
      }
      if (path.length === 1) {
        if (dropIndicator.endsWith('-middle') && targetItem.type === 'section') {
          sections[index].children = sections[index].children || [];
          sections[index].children.push(sectionToInsert);
        } else {
          const insertIndex = dropIndicator.endsWith('-bottom') ? index + 1 : index;
          sections.splice(insertIndex, 0, sectionToInsert);
        }
      } else {
        const nextPath = path.slice(1);
        sections[index].children = sections[index].children || [];
        insertSectionAtPath(sections[index].children, nextPath, sectionToInsert);
      }
    };

    const removedSection = removeSectionAtPath(updatedSections, draggedSection.path);

    insertSectionAtPath(updatedSections, targetPath, removedSection);

    setNestedSections(updatedSections);
    updateSections(updatedSections);
    setDraggedSection(null);
    setDropIndicator(null);
    setIsDragging(false);
    setHoveredSectionPath(null);
  };

  const handleDurationChange = (value) => {
    setTaskDuration(value);
    if (value !== 'custom') {
      setCustomDuration('');
    }
  };
  
  const getWeekStartDate = (offset) => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayIndex + offset * 7);
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  };
  
  const renderNestedSections = (sections, level = 0, path = []) => {
    return sections.map((item, index) => {
      const currentPath = [...path, index];
      const isHovered = hoveredSectionPath === JSON.stringify(currentPath);
      const isInWeekSection = weekSectionIds.includes(item.id.toLowerCase());


      return (
        <div
          key={item.id || `divider-${index}`}
          draggable={isEditingSections}
          onDragStart={(e) => isEditingSections && handleDragStart(e, item, currentPath)}
          onDragOver={(e) => isEditingSections ? handleDragOver(e, item, index, currentPath) : onTaskDragOver(e, item.id)}
          onDragLeave={(e) => isEditingSections ? handleDragLeave(e) : onTaskDragLeave(e)}
          onDrop={(e) => isEditingSections ? handleDrop(e, item, currentPath) : onTaskDrop(e, item.id)}
          className={`mb-4 ${level > 0 ? 'ml-4' : ''} ${isEditingSections && isDragging ? 'section-dragging' : ''} ${isHovered && isEditingSections ? 'border border-orange-500' : ''}`}
        >
          {dropIndicator === `${currentPath.join('-')}-top` && (
            <div className="h-1 bg-orange-500 my-2"></div>
          )}
          {item.type === 'divider' ? (
          <div className="bg-gray-100 p-2 rounded-lg shadow-md">
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
              <div className="flex items-center flex-grow">
                {isEditingSections && <GripVertical className="mr-2 cursor-move" />}
                <hr className="flex-grow border-t border-gray-300" />
              </div>
              {isEditingSections && !defaultSectionIds.includes(item.id) && (
                <Button
                  onClick={() => deleteSection(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 ml-2"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
            </div>
          ) : (
            <div className="bg-gray-100 p-2 rounded-lg shadow-md">
              <div className={`bg-gray-100 p-4 rounded-lg ${dropTarget === item.id && !isEditingSections ? 'border-2 border-gray-500 border-dashed' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {isEditingSections && <GripVertical className="mr-2 cursor-move" />}
                    <button
                      onClick={() => toggleSectionVisibility(item.id)}
                      className="mr-2 focus:outline-none"
                    >
                      {sectionVisibility[item.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <h2 className="text-xl font-bold">{renderSectionTitle(item)}</h2>
                  </div>
                  {isEditingSections && !defaultSectionIds.includes(item.id) && (
                  <Button
                    onClick={() => deleteSection(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 ml-2"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
                </div>
                {sectionVisibility[item.id] && (
                  <>
                    {!isEditingSections && (
                      <div>
                    {getTasksForSection(item.id).map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onDelete={deleteTask}
                        onUpdate={updateTask}
                        onDragStart={onTaskDragStart}
                        onSelect={handleTaskSelection}
                        isSelected={selectedTasks.includes(task.id)}
                        isUpdating={updatingTaskId === task.id}
                        isEditing={editingTaskId === task.id}
                        onUpdateTask={handleTaskUpdate}
                        onStartEditing={startEditingTask}
                        tags={tags}
                        durationOptions={durationOptions}
                        onAddToGoogleCalendar={addToGoogleCalendar}
                        isInWeekSection={isInWeekSection}
                      />
                    ))}
                      </div>
                    )}
                    {item.children && renderNestedSections(item.children, level + 1, currentPath)}
                  </>
                )}
              </div>
            </div>
          )}
          {dropIndicator === `${currentPath.join('-')}-bottom` && (
            <div className="h-1 bg-orange-500 my-2"></div>
          )}
        </div>
      );
    });
  };

  const renderSectionTitle = (section) => {
    if (section.type === 'divider') return null;
  
    if (weekSectionIds.includes(section.id)) {
      const date = ` (${getDateForDay(section.name)})`;
      return `${section.name}${date}`;
    }
  
    return section.name;
  };

const getTasksForSection = (sectionId) => {
  if (weekSectionIds.includes(sectionId)) {
    // Week section: filter tasks by weekKey
    const currentWeekKey = getWeekStartDate(weekOffset);
    return tasks.filter(task => {
      const taskWeekKey = task.weekKey || currentWeekKey;
      return (
        String(task.section) === String(sectionId) &&
        taskWeekKey === currentWeekKey
      );
    });
  } else {
    // Non-week section: include tasks regardless of weekKey
    return tasks.filter(task =>
      String(task.section) === String(sectionId) ||
      (!task.section && sectionId === 'new-tasks')
    );
  }
};

const startEditingTask = (taskId) => {
  setEditingTaskId(taskId);
};

  const getDateForDay = (day) => {
    const today = new Date();
    const todayDayIndex = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    const targetDayIndex = daysOfWeek.indexOf(formattedDay);
  
    let diff = targetDayIndex - todayDayIndex + weekOffset * 7;
  
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${dayOfMonth}`;
  };

  const addTask = async (taskData) => {
    try {
      // Find the full tag object based on the selected tag ID
      const fullTag = tags.find(tag => tag.id.toString() === taskData.tag?.toString());
      
      // Prepare the new task data
      const newTask = {
        title: taskData.title,
        text: taskData.text || '',
        dueDate: taskData.dueDate || null,
        tag: fullTag || null,
        duration: taskData.duration || null,
        completed: false,
        createdAt: new Date().toISOString(),
        section: taskData.section || null,
      };
  
      if (weekSectionIds.includes(newTask.section)) {
        newTask.weekKey = getWeekStartDate(weekOffset);
      }
  
      console.log('Sending new task to server:', newTask);

      const response = await fetch('/api/tasks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }

      const addedTask = await response.json();
      console.log('Received added task from server:', addedTask);

      // Update the tasks state with the new task
      setTasks(prevTasks => [...prevTasks, addedTask]);

      // Clear form fields
      setNewTask('');
      setSelectedTag('');
      setDueDate('');
      setTaskDuration('');
      setCustomDuration('');

      // Show calendar popup if dueDate exists
      if (addedTask.dueDate) {
        setTaskToAddToCalendar(addedTask);
        setShowCalendarPopup(true);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      if (typeof updatedTask.tag === 'number' || typeof updatedTask.tag === 'string') {
        const tagObject = tags.find(tag => tag.id.toString() === updatedTask.tag.toString());
        updatedTask.tag = tagObject || null;
      }
      // Check if the task is in a week section
      if (weekSectionIds.includes(updatedTask.section)) {
        // Assign or update the weekKey
        updatedTask.weekKey = getWeekStartDate(weekOffset);
      } else {
        // Remove weekKey if the task is moved out of a week section
        delete updatedTask.weekKey;
      }

      // Ensure weekKey is set
      if (!updatedTask.weekKey) {
        updatedTask.weekKey = getWeekStartDate(weekOffset);
      }
  
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
  
      const data = await response.json();
      setTasks(prevTasks => prevTasks.map(task => (task.id === data.id ? data : task)));
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [id] }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }
  
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task: ' + error.message);
    }
  };

  const addToGoogleCalendar = async (task) => {
    // Determine the event date based on dueDate or section date
    let eventDate;
    if (task.dueDate) {
      eventDate = task.dueDate;
    } else if (weekSectionIds.includes(task.section)) {
      // Use the date associated with the section
      eventDate = getDateForDay(task.section);
    } else {
      alert('This task does not have a date and cannot be added to the calendar.');
      return;
    }
  
    // Proceed to create the event using eventDate
    const startDateTime = new Date(eventDate);
    let endDateTime;
  
    if (task.duration && task.duration !== 'None') {
      const durationInMinutes = parseInt(task.duration);
      if (!isNaN(durationInMinutes)) {
        endDateTime = new Date(startDateTime.getTime() + durationInMinutes * 60000);
      } else {
        endDateTime = new Date(startDateTime.getTime() + 60 * 60000); // Default 1 hour
      }
    } else {
      // If no duration, make it an all-day event
      endDateTime = new Date(startDateTime);
      endDateTime.setDate(endDateTime.getDate() + 1); // End date is the next day for all-day events
    }
  
    let event = {
      summary: `${task.title}${task.tag ? ` (${task.tag.name})` : ''}`,
      description: task.description || '',
    };
  
    if (task.duration && task.duration !== 'None') {
      // Timed event
      event.start = {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      event.end = {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } else {
      // All-day event
      event.start = {
        date: startDateTime.toISOString().split('T')[0],
      };
      event.end = {
        date: endDateTime.toISOString().split('T')[0],
      };
    }
  
    console.log('Event object to be sent:', event);
  
    try {
      const response = await fetch('/api/google-calendar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add event to Google Calendar');
      }
  
      const data = await response.json();
      const eventId = data.eventId;
  
      // Update the task in local state with the new googleCalendarEventId
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, googleCalendarEventId: eventId } : t
        )
      );
  
      // Update the task in the backend
      await fetch('/api/tasks', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, googleCalendarEventId: eventId }),
      });
  
      alert('Task added to Google Calendar successfully!');
    } catch (error) {
      console.error('Error adding task to Google Calendar:', error);
      alert('Failed to add task to Google Calendar: ' + error.message);
    }
  };
  
  const syncWeekTasksToGoogleCalendar = async () => {
    const weekSections = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentWeekKey = getWeekStartDate(weekOffset); // Get the current week's key
  
    const tasksToSync = tasks.filter(task =>
      weekSections.includes(task.section) && task.weekKey === currentWeekKey
    );
    
    for (const task of tasksToSync) {
      const sectionDate = getDateForDay(task.section);
  
      // Prepare the event object
      let event;
  
      if (task.duration && task.duration !== 'None') {
        // Handle tasks with duration as timed events
        const startDateTime = new Date(sectionDate);
        const durationInMinutes = parseFloat(task.duration) || 60; // Default to 60 minutes
        const endDateTime = new Date(startDateTime.getTime() + durationInMinutes * 60000);
  
        event = {
          summary: `${task.title}${task.tag ? ` (${task.tag.name})` : ''}`,
          description: task.description || '',
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };
      } else {
        // Handle tasks without duration as all-day events
        const startDate = new Date(sectionDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
  
        event = {
          summary: `${task.title}${task.tag ? ` (${task.tag.name})` : ''}`,
          description: task.description || '',
          start: {
            date: startDate.toISOString().split('T')[0],
          },
          end: {
            date: endDate.toISOString().split('T')[0],
          },
        };
      }
  
      try {
        const method = task.googleCalendarEventId ? 'PUT' : 'POST';
        const body = {
          event,
          eventId: task.googleCalendarEventId,
        };
  
        const response = await fetch('/api/google-calendar', {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error syncing task "${task.title}" to Google Calendar:`, errorData);
          continue;
        }
  
        const data = await response.json();
        const eventId = data.eventId;
  
        // Update the task in local state with the new googleCalendarEventId
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, googleCalendarEventId: eventId } : t
          )
        );
  
        await fetch('/api/tasks', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: task.id, googleCalendarEventId: eventId }),
        });
      } catch (error) {
        console.error(`Error syncing task "${task.title}" to Google Calendar:`, error);
      }
    }
  
    alert("Week's tasks synced to Google Calendar!");
  };

  const duplicateTask = async (taskOrTasks) => {
  try {
    const tasksToClone = Array.isArray(taskOrTasks) ? taskOrTasks : [taskOrTasks];
    
    for (const task of tasksToClone) {
      const duplicatedTask = {
        ...task,
        id: undefined, // Remove id so a new one is generated
        title: `${task.title || 'Untitled Task'}`,
        completed: false,
        createdAt: new Date().toISOString(),
        section: task.section,
      };

      // Assign weekKey only if the task is in a week section
      if (weekSectionIds.includes(duplicatedTask.section)) {
        duplicatedTask.weekKey = getWeekStartDate(weekOffset);
      } else {
        delete duplicatedTask.weekKey;
      }

      console.log('Duplicating task:', duplicatedTask);

      const response = await fetch('/api/tasks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicatedTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate task');
      }

      const addedTask = await response.json();
      console.log('Received duplicated task from server:', addedTask);

      setTasks(prevTasks => [...prevTasks, addedTask]);
    }
  } catch (error) {
    console.error('Error duplicating task(s):', error);
    alert('Failed to duplicate task(s): ' + error.message);
  }
};

  

  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedSection(null);
      setDropIndicator(null);
      setIsDragging(false);
      setHoveredSectionPath(null);
      setDraggedTask(null);
      setDropTarget(null);
    };

    document.addEventListener('dragend', handleDragEnd);

    return () => {
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  // Add this new function to handle background clicks
  const handleBackgroundClick = useCallback((e) => {
    // Check if the click is on the background (not on a task)
    if (e.target.closest('.task-item') === null) {
      setSelectedTasks([]);
    }
  }, []);

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener('click', handleBackgroundClick);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleBackgroundClick);
    };
  }, [handleBackgroundClick]);

  return (
    isMounted ? (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Fixed header for task addition */}
        <div className="fixed top-0 left-0 right-0 mb-6 flex items-center space-x-4 bg-white p-4 rounded shadow-md z-[9999]">
          <Image src="/tasknest-logo.png" alt="TaskNest Logo" width={150} height={50} className="mr-4" />
          
          {isEditingSections ? (
            <div className="flex-grow flex items-center space-x-4">
              <Input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="New section name"
                className="flex-grow h-[40px] text-lg"
                style={{ color: '#303641' }}
              />
              <Button 
                onClick={() => addSection('section')} 
                className="flex items-center bg-orange-500 text-white hover:bg-orange-600 h-[40px] text-lg px-4"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Section
              </Button>
              <Button 
                onClick={() => addSection('divider')} 
                className="flex items-center bg-gray-500 text-white hover:bg-gray-600 h-[40px] text-lg px-4"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Divider
              </Button>
            </div>
          ) : (
            <div className="flex-grow flex items-center space-x-4">
              <Input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter new task"
                className="flex-grow focus-visible"
                style={{ color: '#303641' }}
              />
              <div className="relative">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[205px] h-[40px] text-lg" style={{ color: '#303641' }}>
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {tags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id.toString()} className="py-2" style={{ color: '#303641' }}>
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 mr-2"
                            style={{ backgroundColor: tag.color }}
                          ></div>
                          <span className="truncate">{tag.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Select value={taskDuration} onValueChange={handleDurationChange}>
                  <SelectTrigger className="w-[205px] h-[40px] text-lg" style={{ color: '#303641' }}>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {durationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="py-2" style={{ color: '#303641' }}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {taskDuration === 'custom' && (
                <Input
                  type="text"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Custom duration"
                  className="w-40 h-[40px] text-lg"
                  style={{ color: '#303641' }}
                />
              )}
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-[205px] h-[40px] text-lg"
                style={{ color: '#303641' }}
              />
              <Button
                onClick={() => {
                  const durationValue = taskDuration === 'custom' ? customDuration : (taskDuration || 'None');
                  const taskData = {
                    title: newTask.trim(),
                    tag: selectedTag,
                    dueDate,
                    completed: false,
                    displayDate: null,
                    duration: durationValue,
                  };
                  if (!taskData.title) {
                    alert('Please enter a task title');
                    return;
                  }
                  addTask(taskData);
                }}
                className="bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 h-[40px] text-lg"
              >
                ADD TASK
              </Button>
            </div>
          )}
        </div>
        
        {/* Main content area */}
        <div className="pt-[110px] pb-20 px-4"> {/* Adjust the pt-24 value if needed */}
          {selectedTasks.length > 0 && (
            <div className="fixed top-[110px] left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white p-3 text-center mb-4 rounded">              
            <span className="font-semibold">Task Selection Mode:</span> {selectedTasks.length} task(s) selected.
              Use Shift+Click to select/deselect tasks. Click on the background to clear all selections.
            </div>
          )}
          
          <div className="flex justify-center items-start relative">
            {/* Left Button */}
            <Button 
              onClick={() => setWeekOffset(weekOffset - 1)} 
              variant="outline"
              className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            >
              &lt;
            </Button>

            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 text-gray-800 relative">
              <Header />
              {/* ... (existing task list rendering code) */}
              {renderNestedSections(nestedSections)}
            </div>

            {/* Right Button */}
            <Button 
              onClick={() => setWeekOffset(weekOffset + 1)} 
              variant="outline"
              className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            >
              &gt;
            </Button>
          </div>
        </div>
        {/* Edit Sections and Edit Tags buttons */}
        <div className="fixed bottom-4 right-4 flex space-x-2">
          <Button 
            onClick={() => setIsEditingSections(!isEditingSections)}
            variant="outline"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
          >
            <Edit3 className="mr-2 h-4 w-4" /> {isEditingSections ? 'Finish Editing' : 'Edit Sections'}
          </Button>
          <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                <Plus className="mr-2 h-4 w-4" /> Edit Tags
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Tags</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <span>{tag.name}</span>
                    </div>
                    <Button onClick={() => deleteTag(tag.id)} className="ml-2" variant="destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag name"
                    className="mr-2"
                  />
                  <Input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12"
                  />
                  <Button onClick={addTag} className="ml-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Logout button */}
        <button 
          onClick={() => signOut()} 
          className="fixed top-[110px] right-4 bg-red-500 text-white px-4 py-2 rounded z-50 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Logout
        </button>

        {/* Sync and Current Week buttons */}
        <div className="fixed top-[110px] left-4 flex flex-col space-y-2 z-50">
          <button
            onClick={syncWeekTasksToGoogleCalendar}
            className="shadow-xl flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <img src="/google-calendar-logo.png" alt="Google Calendar" className="h-6 w-6 mr-2" />
            Sync Week&apos;s Tasks
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="bg-stone-500 text-white px-4 py-2 rounded hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-opacity-50"
          >
            Current Week
          </button>
        </div>
      </div>
    ) : null
  );
};

export default TodoList;