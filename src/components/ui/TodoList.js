"use client";

import React, { useState, useEffect } from 'react';
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
        credentials: 'include', // Include cookies
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      console.log('Fetched tasks:', data);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
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
  const handleTaskSelection = (taskId, event) => {
    event.stopPropagation();
  
    if (event.shiftKey) {
      setSelectedTasks(prev => {
        if (prev.includes(taskId)) {
          // Deselect the task if it's already selected
          return prev.filter(id => id !== taskId);
        } else {
          // Add the task to the selection
          return [...prev, taskId];
        }
      });
    } else if (!event.target.closest('button') && !event.target.closest('input[type="checkbox"]')) {
      // If not shift-clicking and not clicking a button or checkbox, do nothing
      return;
    }
  };

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
      };
  
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
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
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
    if (!draggedTask) return;

    setUpdatingTaskId(draggedTask.id);

    const updatedTask = {
      ...draggedTask,
      section: targetSectionId
    };

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
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === updatedTaskFromServer.id ? updatedTaskFromServer : task
      ));
    } catch (error) {
      console.error('Error updating task section:', error);
    } finally {
      setUpdatingTaskId(null);
    }

    setDraggedTask(null);
    setDropTarget(null);
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
  

  const renderNestedSections = (sections, level = 0, path = []) => {
    return sections.map((item, index) => {
      const currentPath = [...path, index];
      const isHovered = hoveredSectionPath === JSON.stringify(currentPath);

      return (
        <div
          key={item.id || `divider-${index}`}
          draggable={isEditingSections}
          onDragStart={(e) => {
            if (isEditingSections) {
              handleDragStart(e, item, currentPath);
            }
          }}
          onDragOver={(e) =>
            isEditingSections
              ? handleDragOver(e, item, index, currentPath)
              : onTaskDragOver(e, item.id)
          }
          onDragLeave={(e) => {
            if (isEditingSections) {
              handleDragLeave(e);
            } else {
              onTaskDragLeave(e);
            }
          }}
          onDrop={(e) => {
            if (isEditingSections) {
              handleDrop(e, item, currentPath);
            } else {
              onTaskDrop(e, item.id);
            }
          }}
          className={`mb-4 ${
            level > 0 ? `ml-4 pl-4 border-l-2 border-gray-300` : ''
          } ${
            dropTarget === item.id && !isEditingSections ? 'border-2 border-blue-500 border-dashed' : ''
          } ${
            isEditingSections && isDragging ? 'section-dragging' : ''
          } ${
            isHovered && isEditingSections ? 'border border-blue-500' : ''
          }`}
        >
          {dropIndicator === `${currentPath.join('-')}-top` && (
            <div className="h-1 bg-blue-500 my-2"></div>
          )}
          {item.type === 'divider' ? (
            <div className="flex items-center">
              {isEditingSections && <GripVertical className="mr-2 cursor-move" />}
              <hr className="flex-grow border-t border-gray-300" />
              {isEditingSections && (
                <Button onClick={() => deleteSection(item.id)} className="ml-2">
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center mb-2">
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
                {isEditingSections && (
                  <Button onClick={() => deleteSection(item.id)} className="ml-2">
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
                          tags={tags}
                          durationOptions={durationOptions}
                          onAddToGoogleCalendar={addToGoogleCalendar}
                        />
                      ))}
                    </div>
                  )}
                  {item.children && renderNestedSections(item.children, level + 1, currentPath)}
                </>
              )}
            </>
          )}
          {dropIndicator === `${currentPath.join('-')}-bottom` && (
            <div className="h-1 bg-blue-500 my-2"></div>
          )}
        </div>
      );
    });
  };

  const renderSectionTitle = (section) => {
    if (section.type === 'divider') return null;

    if (initialSections.some(s => s.name === section.name)) {
      const date = section.name === "New Tasks" ? "" : ` (${getDateForDay(section.name)})`;
      return `${section.name}${date}`;
    }

    return section.name;
  };

  const getTasksForSection = (sectionId) => {
    return tasks.filter(task =>
      String(task.section) === String(sectionId) ||
      (!task.section && sectionId === 'new-tasks')
    );
  };

  const getDateForDay = (day) => {
    const today = new Date();
    const todayDayIndex = today.getDay();
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    const targetDayIndex = daysOfWeek.indexOf(formattedDay);
  
    let diff = targetDayIndex - todayDayIndex;
  
    if (diff < 0) {
      diff += 7;
    }
  
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
      };

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
    if (!task.dueDate) {
      alert('This task does not have a due date and cannot be added to the calendar.');
      return;
    }

    let event = {
      summary: `${task.title}${task.tag ? ` (${task.tag.name})` : ''}`, // Add tag to the title
      description: task.description || '',
      start: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    if (task.duration && task.duration !== 'None') {
      const durationInMinutes = parseInt(task.duration);
      if (!isNaN(durationInMinutes)) {
        const endTime = new Date(new Date(task.dueDate).getTime() + durationInMinutes * 60000);
        event.end.dateTime = endTime.toISOString();
      }
    } else {
      // Handle tasks without duration as all-day events
      const startDate = new Date(task.dueDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      event = {
        summary: `${task.title}${task.tag ? ` (${task.tag.name})` : ''}`, // Add tag to the title
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
      const response = await fetch('/api/google-calendar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add event to Google Calendar');
      }

      alert('Task added to Google Calendar successfully!');
    } catch (error) {
      console.error('Error adding task to Google Calendar:', error);
      alert('Failed to add task to Google Calendar: ' + error.message);
    }
  };

  const syncWeekTasksToGoogleCalendar = async () => {
    // Get tasks from days of the week sections
    const weekSections = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const tasksToSync = tasks.filter(task => weekSections.includes(task.section));
  
    for (const task of tasksToSync) {
      const sectionDate = getDateForDay(task.section); // Returns 'YYYY-MM-DD'
  
      let event;
  
      if (task.duration && task.duration !== 'None') {
        // Handle tasks with duration as timed events
        const startDateTime = new Date(sectionDate);
        const durationInMinutes = parseFloat(task.duration) || 60; // Default to 60 minutes
        const endDateTime = new Date(startDateTime.getTime() + durationInMinutes * 60000);
  
        event = {
          summary: task.title,
          description: task.description || '',
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'UTC', // Adjust as needed
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'UTC', // Adjust as needed
          },
        };
      } else {
        // Handle tasks without duration as all-day events
        const startDate = new Date(sectionDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
  
        event = {
          summary: task.title,
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
        const response = await fetch('/api/google-calendar', {
          method: 'POST',
          credentials: 'include', // Add this line
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error adding task "${task.title}" to Google Calendar:`, JSON.stringify(errorData, null, 2));
          // Optionally handle errors individually
        }
      } catch (error) {
        console.error(`Error adding task "${task.title}" to Google Calendar:`, error);
        // Optionally handle errors individually
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
          title: `${task.title || 'Untitled Task'}`,
          completed: false,
          createdAt: new Date().toISOString(),
        };
  
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

  return (
    isMounted ? (
      <div className="flex justify-center items-start min-h-screen bg-gray-900 p-4">
        <div className="w-full max-w-4xl bg-gray-800 shadow-lg rounded-lg p-6 text-gray-200 relative">
          <Header />
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Your Todo List</h1>
            <button
              onClick={syncWeekTasksToGoogleCalendar}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <img src="/google-calendar-logo.png" alt="Google Calendar" className="h-6 w-6 mr-2" />
              Sync Week's Tasks to Google Calendar
            </button>
            <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
          <div className="flex mb-4 items-end">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter new task"
              className="mr-2"
            />
            <Select value={selectedTag} onValueChange={setSelectedTag}>
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
            <Select value={taskDuration} onValueChange={handleDurationChange}>
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

            {/* Custom Duration Input */}
            {taskDuration === 'custom' && (
              <Input
                type="text"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="Enter duration in minutes"
                className="mr-2"
              />
            )}
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mr-2"
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
                console.log('Task data before adding:', JSON.stringify(taskData));
                if (!taskData.title) {
                  console.error('Task title is empty');
                  alert('Please enter a task title');
                  return;
                }
                addTask(taskData);
              }}
              className="px-4 py-2"
            >
              Add
            </Button>
          </div>

          {isEditingSections && (
            <div className="mb-4">
              <Input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="New section name"
                className="mr-2"
              />
              <Button onClick={() => addSection('section')} className="mr-2">
                Add Section
              </Button>
              <Button onClick={() => addSection('divider')}>
                Add Divider
              </Button>
            </div>
          )}

          {selectedTasks.length > 0 && (
            <div className="mb-4 p-2 bg-slate-900 text-white border border-slate-700 rounded">
              <span className="font-semibold">Task Selection Mode:</span> {selectedTasks.length} task(s) selected.
              Use Shift+Click to select/deselect tasks. Click on the background to clear all selections.
            </div>
          )}
          {selectedTasks.length === 1 && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setEditingTaskId(selectedTasks[0]);
              }}
              className="mb-4"
            >
              Update Task
            </Button>
          )}
          <div className="mt-4">
            {renderNestedSections(nestedSections)}
          </div>
          {showCalendarPopup && (
          <Dialog open={showCalendarPopup} onOpenChange={setShowCalendarPopup}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Task to Google Calendar</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Do you want to add this task to Google Calendar?</p>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setShowCalendarPopup(false)} className="mr-2">
                    No
                  </Button>
                  <Button
                    onClick={() => {
                      addToGoogleCalendar(taskToAddToCalendar);
                      setShowCalendarPopup(false);
                    }}
                  >
                    Yes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
          <div className="fixed bottom-4 right-4 flex space-x-2">
            <Button onClick={() => setIsEditingSections(!isEditingSections)}>
              <Edit3 className="mr-2 h-4 w-4" /> {isEditingSections ? 'Finish Editing' : 'Edit Sections'}
            </Button>
            <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
              <DialogTrigger asChild>
                <Button>
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
        </div>
      </div>
    ) : null
  );
};

export default TodoList;