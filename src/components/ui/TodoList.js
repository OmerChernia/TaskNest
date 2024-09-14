"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, GripVertical, Edit3, ChevronDown, ChevronRight, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useHotkeys } from 'react-hotkeys-hook';
import TaskItem from '@/components/ui/TaskItem';

const initialTags = [
  { id: 1, name: 'Work', color: '#ff0000' },
  { id: 2, name: 'Personal', color: '#00ff00' },
  { id: 3, name: 'Shopping', color: '#0000ff' },
];

const initialSections = ['New Tasks', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
  const sectionsRef = useRef(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchTags();
    fetchSections();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const fetchedTags = await response.json();
        setTags(fetchedTags);
      } else {
        throw new Error('Failed to fetch tags');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const addTag = async () => {
    if (newTagName.trim() !== '' && newTagColor !== '') {
      try {
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newTagName, color: newTagColor }),
        });
        if (response.ok) {
          const newTag = await response.json();
          setTags([...tags, newTag]);
          setNewTagName('');
          setNewTagColor('#000000');
        } else {
          throw new Error('Failed to add tag');
        }
      } catch (error) {
        console.error('Error adding tag:', error);
      }
    }
  };

  const deleteTag = async (tagId) => {
    try {
      const response = await fetch(`/api/tags?id=${tagId}`, { method: 'DELETE' });
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
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }
      const data = await response.json();
      console.log('Fetched tasks:', data);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    }
  };

  const addTask = async (newTask) => {
    try {
      const selectedTagObject = tags.find(tag => tag.id === selectedTag);
      const taskToAdd = {
        ...newTask,
        tag: selectedTagObject ? {
          id: selectedTagObject.id,
          name: selectedTagObject.name,
          color: selectedTagObject.color
        } : null,
        dueDate: dueDate || null,
        section: 'new-tasks' // Always add new tasks to the "New Tasks" section
      };
      console.log('Adding task:', JSON.stringify(taskToAdd));
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskToAdd),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      const addedTask = await response.json();
      console.log('Task added successfully:', addedTask);
      setTasks(prevTasks => [...prevTasks, addedTask]);
      setNewTask('');
      setDueDate('');
      setSelectedTag('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      // If the tag is a number, find the corresponding tag object
      if (typeof updatedTask.tag === 'number') {
        const tagObject = tags.find(tag => tag.id === updatedTask.tag.toString());
        if (tagObject) {
          updatedTask.tag = { id: tagObject.id, name: tagObject.name, color: tagObject.color };
        } else {
          updatedTask.tag = null;
        }
      }

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
      const data = await response.json();
      setTasks(prevTasks => prevTasks.map(task => task.id === data.id ? data : task));
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
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

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      if (response.ok) {
        const fetchedSections = await response.json();
        console.log('Fetched sections:', fetchedSections);
        setNestedSections(fetchedSections.length > 0 ? fetchedSections : initialSections.map(section => ({ id: section, name: section, children: [], type: 'section' })));
        // Initialize sectionVisibility after fetching sections
        setSectionVisibility(() => {
          const initialVisibility = {};
          fetchedSections.forEach(section => {
            initialVisibility[section.id] = true;
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

  const updateSections = async (updatedSections) => {
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    if (type === 'section' && newSectionName.trim() !== '') {
      const newSection = { id: Date.now().toString(), name: newSectionName, children: [], type: 'section' };
      const updatedSections = [...nestedSections, newSection];
      setNestedSections(updatedSections);
      updateSections(updatedSections);
      setNewSectionName('');
    } else if (type === 'divider') {
      const newDivider = { id: Date.now().toString(), type: 'divider' };
      const updatedSections = [...nestedSections, newDivider];
      setNestedSections(updatedSections);
      updateSections(updatedSections);
    }
  };

  const deleteSection = (sectionId) => {
    const updatedSections = nestedSections.filter(section => section.id !== sectionId);
    setNestedSections(updatedSections);
    updateSections(updatedSections);
  };

  const moveSectionUp = (index) => {
    if (index > 0) {
      const updatedSections = [...nestedSections];
      [updatedSections[index - 1], updatedSections[index]] = [updatedSections[index], updatedSections[index - 1]];
      setNestedSections(updatedSections);
      updateSections(updatedSections);
    }
  };

  const moveSectionDown = (index) => {
    if (index < nestedSections.length - 1) {
      const updatedSections = [...nestedSections];
      [updatedSections[index], updatedSections[index + 1]] = [updatedSections[index + 1], updatedSections[index]];
      setNestedSections(updatedSections);
      updateSections(updatedSections);
    }
  };

  const getDateForDay = (day) => {
    const today = new Date();
    const diff = daysOfWeek.indexOf(day) - today.getDay();
    const date = new Date(today.setDate(today.getDate() + diff));
    return date.toISOString().split('T')[0];
  };

  const renderSectionTitle = (sectionName) => {
    if (initialSections.includes(sectionName)) {
      const date = getDateForDay(sectionName);
      return sectionName === "New Tasks" ? sectionName : `${sectionName} (${date})`;
    }
    return sectionName;
  };

  const getTasksForSection = (sectionId) => {
    return tasks.filter(task => task.section === sectionId);
  };

  const handleTaskSelection = (taskId, event) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the background

    if (event.shiftKey) {
      setSelectedTasks(prev => 
        prev.includes(taskId) 
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      );
    } else if (!event.target.closest('button')) {
      // If not shift-clicking and not clicking a button, toggle selection
      setSelectedTasks(prev => 
        prev.includes(taskId) 
          ? prev.filter(id => id !== taskId)
          : [taskId]
      );
    }
  };

  const clearTaskSelection = () => {
    setSelectedTasks([]);
  };

  const deleteSelectedTasks = () => {
    setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
    setSelectedTasks([]);
  };

  const duplicateSelectedTasks = () => {
    const newTasks = tasks.filter(task => selectedTasks.includes(task.id)).map(task => ({
      ...task,
      id: Date.now() + Math.random(), // Generate a unique ID
    }));
    setTasks(prev => [...prev, ...newTasks]);
  };

  useHotkeys('delete', deleteSelectedTasks, [selectedTasks]);
  useHotkeys('cmd+d, ctrl+d', (event) => {
    event.preventDefault();
    duplicateSelectedTasks();
  }, [selectedTasks, tasks]);

  const onDragStart = (e, task) => {
    setDraggedItem(task);
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
  };

  const onDragOver = (e, sectionId) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
  
    if (y < height * 0.25 || y > height * 0.75) {
      // Near the top or bottom edge of the section
      setDropTarget({ type: 'line', sectionId, position: y < height * 0.25 ? 'top' : 'bottom' });
    } else {
      // In the middle of the section
      setDropTarget({ type: 'section', sectionId });
    }
  };

  const onDragLeave = () => {
    setDropTarget(null);
  };

  const onDrop = async (e, targetSectionId) => {
    e.preventDefault();
    if (!draggedItem) return;

    setUpdatingTaskId(draggedItem.id);

    const updatedTask = {
      ...draggedItem,
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
      // Optionally, you can show an error message to the user here
    } finally {
      setUpdatingTaskId(null);
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  const toggleSectionVisibility = (sectionId) => {
    setSectionVisibility(prevVisibility => ({
      ...prevVisibility,
      [sectionId]: !prevVisibility[sectionId]
    }));
  };

  const handleDragStart = (e, section, index, level) => {
    setDraggedSection({ section, index, level });
    e.dataTransfer.setData('text/plain', JSON.stringify(section));
  };

  const handleDragOver = (e, section, index, level) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
  
    if (y < height / 3) {
      setDropIndicator(`${index}-${level}`);
      setDropTarget(null);
    } else if (y > (height * 2) / 3) {
      setDropIndicator(`${index + 1}-${level}`);
      setDropTarget(null);
    } else {
      setDropIndicator(null);
      setDropTarget(section.id);
    }
  };

  const handleDragLeave = () => {
    setDropIndicator(null);
    setDropTarget(null);
  };

  const handleDrop = (e, targetSection, targetIndex, targetLevel) => {
    e.preventDefault();
    if (!draggedSection) return;

    const updatedSections = [...nestedSections];
    const draggedSectionData = removeSectionFromTree(updatedSections, draggedSection.section.id);

    if (dropTarget) {
      // Drop inside the section
      const targetSectionData = findSectionInTree(updatedSections, dropTarget);
      if (targetSectionData) {
        targetSectionData.children = targetSectionData.children || [];
        targetSectionData.children.push(draggedSectionData);
      }
    } else {
      // Drop between sections
      const targetParent = findParentSection(updatedSections, targetSection.id);
      const targetArray = targetParent ? targetParent.children : updatedSections;
      const insertIndex = dropIndicator === `${targetIndex + 1}-${targetLevel}` ? targetIndex + 1 : targetIndex;
      targetArray.splice(insertIndex, 0, draggedSectionData);
    }

    setNestedSections(updatedSections);
    updateSections(updatedSections);
    setDraggedSection(null);
    setDropTarget(null);
    setDropIndicator(null);
  };

  const removeSectionFromTree = (sections, id) => {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].id === id) {
        return sections.splice(i, 1)[0];
      }
      if (sections[i].children) {
        const result = removeSectionFromTree(sections[i].children, id);
        if (result) return result;
      }
    }
    return null;
  };

  const findSectionInTree = (sections, id) => {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.children) {
        const result = findSectionInTree(section.children, id);
        if (result) return result;
      }
    }
    return null;
  };

  const findParentSection = (sections, id, parent = null) => {
    for (const section of sections) {
      if (section.id === id) return parent;
      if (section.children) {
        const result = findParentSection(section.children, id, section);
        if (result) return result;
      }
    }
    return null;
  };

  const renderNestedSections = (sections, level = 0) => {
    return sections.map((section) => {
      const sectionTasks = getTasksForSection(section.id);
      console.log(`Rendering section ${section.id} with ${sectionTasks.length} tasks:`, sectionTasks);
      
      return (
        <div key={section.id}>
          {dropTarget && dropTarget.type === 'line' && dropTarget.sectionId === section.id && dropTarget.position === 'top' && (
            <div className="h-1 bg-blue-500 my-2"></div>
          )}
          <div 
            className={`mb-4 ${level > 0 ? `ml-${level * 4}` : ''} ${
              dropTarget && dropTarget.type === 'section' && dropTarget.sectionId === section.id
                ? 'border-2 border-purple-500 border-dashed'
                : ''
            }`}
            onDragOver={(e) => onDragOver(e, section.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, section.id)}
          >
            {section.type === 'divider' ? (
              <hr className="my-4 border-t border-gray-300" />
            ) : (
              <>
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => toggleSectionVisibility(section.id)}
                    className="mr-2 focus:outline-none"
                  >
                    {sectionVisibility[section.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <h2 className="text-xl font-bold">{renderSectionTitle(section.name)}</h2>
                </div>
                {sectionVisibility[section.id] && (
                  <div>
                    {sectionTasks.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onDelete={deleteTask} 
                        onUpdate={updateTask}
                        onDragStart={onDragStart}
                        onSelect={handleTaskSelection}
                        isSelected={selectedTasks.includes(task.id)}
                        isUpdating={updatingTaskId === task.id}
                      />
                    ))}
                  </div>
                )}
                {section.children && renderNestedSections(section.children, level + 1)}
              </>
            )}
          </div>
          {dropTarget && dropTarget.type === 'line' && dropTarget.sectionId === section.id && dropTarget.position === 'bottom' && (
            <div className="h-1 bg-blue-500 my-2"></div>
          )}
        </div>
      );
    });
  };

  return (
    isMounted ? (
      <div className="p-4" onClick={clearTaskSelection}>
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
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mr-2"
          />
          <Button 
            onClick={() => {
              const taskData = { 
                title: newTask.trim(), 
                description: dueDate, 
                tag: selectedTag,
                dueDate, 
                completed: false,
                displayDate: null
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

        <Button onClick={() => setIsEditingSections(!isEditingSections)} className="mb-4">
          <Edit3 className="mr-2 h-4 w-4" /> {isEditingSections ? 'Finish Editing Sections' : 'Edit Sections'}
        </Button>

        {isEditingSections && (
          <div className="mb-4">
            <Input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="New section name"
              className="mr-2 mb-2"
            />
            <Button onClick={() => addSection('section')} className="px-4 py-2 mr-2">
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
            <Button onClick={() => addSection('divider')} className="px-4 py-2">
              <Minus className="mr-2 h-4 w-4" /> Add Divider
            </Button>
          </div>
        )}

        {selectedTasks.length > 0 && (
          <div className="mb-4 p-2 bg-slate-900 text-white border border-slate-700 rounded">
            <span className="font-semibold">Task Selection Mode:</span> {selectedTasks.length} task(s) selected. 
            Use Shift+Click to select/deselect tasks. Click on the background to clear all selections.
          </div>
        )}

        <div className="mt-4">
          {renderNestedSections(nestedSections)}
        </div>

        <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-4 right-4">
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
    ) : null
  );
};

export default TodoList;