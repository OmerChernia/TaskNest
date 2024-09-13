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

const initialTags = [
  { id: 1, name: 'Work', color: '#ff0000' },
  { id: 2, name: 'Personal', color: '#00ff00' },
  { id: 3, name: 'Shopping', color: '#0000ff' },
];

const initialTasks = [
  { id: 1, text: 'Buy groceries', tag: 3, dueDate: '2024-09-04', completed: false, displayDate: null },
  { id: 2, text: 'Finish project', tag: 1, dueDate: '2024-09-05', completed: false, displayDate: null },
  { id: 3, text: 'Call mom', tag: 2, dueDate: '2024-09-07', completed: false, displayDate: null },
];

const initialSections = ['New Tasks', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TodoList = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [tags, setTags] = useState(initialTags);
  const [nestedSections, setNestedSections] = useState(initialSections.map(section => ({ id: section, name: section, children: [], type: 'section' })));
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const storedTasks = localStorage.getItem('tasks');
      const storedTags = localStorage.getItem('tags');
      const storedSections = localStorage.getItem('nestedSections');
      const storedVisibility = localStorage.getItem('sectionVisibility');

      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedTags) setTags(JSON.parse(storedTags));
      if (storedSections) setNestedSections(JSON.parse(storedSections));
      if (storedVisibility) setSectionVisibility(JSON.parse(storedVisibility));
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('tags', JSON.stringify(tags));
      localStorage.setItem('nestedSections', JSON.stringify(nestedSections));
      localStorage.setItem('sectionVisibility', JSON.stringify(sectionVisibility));
    }
  }, [tasks, tags, nestedSections, sectionVisibility, isMounted]);

  const addTask = () => {
    if (newTask.trim() !== '' && selectedTag !== '') {
      const newTaskObj = {
        id: tasks.length + 1,
        text: newTask,
        tag: parseInt(selectedTag),
        dueDate: dueDate || null,
        completed: false,
        displayDate: null,
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
      setSelectedTag('');
      setDueDate('');
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const addTag = () => {
    if (newTagName.trim() !== '' && newTagColor !== '') {
      const newTagObj = {
        id: tags.length + 1,
        name: newTagName,
        color: newTagColor,
      };
      setTags([...tags, newTagObj]);
      setNewTagName('');
      setNewTagColor('#000000');
    }
  };

  const deleteTag = (tagId) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    const updatedTasks = tasks.map(task =>
      task.tag === tagId ? { ...task, tag: null } : task
    );
    setTasks(updatedTasks);
  };

  const addSection = (type = 'section') => {
    if ((type === 'section' && newSectionName.trim() !== '') || type === 'divider') {
      const newSectionId = Date.now().toString();
      const newSection = {
        id: newSectionId,
        name: type === 'section' ? newSectionName : 'Divider',
        children: [],
        type: type
      };

      setNestedSections(prevSections => [...prevSections, newSection]);
      setSectionVisibility(prevVisibility => ({
        ...prevVisibility,
        [newSectionId]: true
      }));

      setNewSectionName('');
    }
  };

  const deleteSection = (sectionId) => {
    setNestedSections(prevSections => {
      const removeSectionRecursive = (sections) => {
        return sections.filter(section => {
          if (section.id === sectionId) {
            return false;
          }
          if (section.children) {
            section.children = removeSectionRecursive(section.children);
          }
          return true;
        });
      };
      return removeSectionRecursive(prevSections);
    });
  };

  const toggleSectionVisibility = (sectionId) => {
    setSectionVisibility(prevVisibility => ({
      ...prevVisibility,
      [sectionId]: !prevVisibility[sectionId]
    }));
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
    if (sectionId === 'New Tasks') {
      return tasks.filter(task => task.displayDate === null);
    }
    const dayDate = getDateForDay(sectionId);
    return tasks.filter(task => task.displayDate === dayDate);
  };

  const toggleTaskSelection = (taskId, event) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the background

    if (event.shiftKey) {
      setSelectedTasks(prev => 
        prev.includes(taskId) 
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      );
    } else if (!event.target.closest('button')) {
      // If not shift-clicking and not clicking a button, clear selection
      setSelectedTasks([]);
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

  const onDragStart = (e, item, type) => {
    if (type === 'task' && selectedTasks.length > 1 && selectedTasks.includes(item.id)) {
      setDraggedItem({ type: 'multiTask', taskIds: selectedTasks });
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'multiTask', taskIds: selectedTasks }));
    } else {
      setDraggedItem({ ...item, type });
      e.dataTransfer.setData('text/plain', JSON.stringify({ ...item, type }));
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    const closestSection = e.target.closest('[data-section-id]');
    if (!closestSection) return;

    const sectionId = closestSection.getAttribute('data-section-id');
    const sectionType = closestSection.getAttribute('data-section-type');
    const rect = closestSection.getBoundingClientRect();
    const y = e.clientY - rect.top;

    let position;
    if (y < rect.height * 0.25) {
      position = 'before';
    } else if (y > rect.height * 0.75) {
      position = 'after';
    } else if (sectionType !== 'divider') {
      position = 'inside';
    } else {
      position = 'after'; // Default to 'after' for dividers
    }

    // Prevent dropping tasks inside dividers
    if (draggedItem.type === 'task' && sectionType === 'divider') {
      position = y < rect.height / 2 ? 'before' : 'after';
    }

    setDropIndicator({ sectionId, position });
  };

  const onDragLeave = (e) => {
    if (!sectionsRef.current.contains(e.relatedTarget)) {
      setDropIndicator(null);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (!draggedItem || !dropIndicator) return;

    const { sectionId, position } = dropIndicator;

    if (draggedItem.type === 'multiTask') {
      setTasks(prevTasks => prevTasks.map(task => 
        draggedItem.taskIds.includes(task.id) 
          ? { ...task, displayDate: sectionId === 'New Tasks' ? null : getDateForDay(sectionId) }
          : task
      ));
    } else if (draggedItem.type === 'task') {
      // Move the task to the new section
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === draggedItem.id ? { ...task, displayDate: sectionId === 'New Tasks' ? null : getDateForDay(sectionId) } : task
      ));
    } else if (draggedItem.type === 'section') {
      setNestedSections(prevSections => {
        const newSections = [...prevSections];
        let draggedSection;
        
        draggedSection = findAndRemoveSection(newSections, draggedItem.id);

        if (draggedSection) {
          const insertSection = (sections, targetId) => {
            for (let i = 0; i < sections.length; i++) {
              if (sections[i].id === targetId) {
                if (position === 'before') {
                  sections.splice(i, 0, draggedSection);
                } else if (position === 'after') {
                  sections.splice(i + 1, 0, draggedSection);
                } else if (position === 'inside') {
                  sections[i].children = sections[i].children || [];
                  sections[i].children.push(draggedSection);
                }
                return true;
              }
              if (sections[i].children && insertSection(sections[i].children, targetId)) {
                return true;
              }
            }
            return false;
          };

          insertSection(newSections, sectionId);
        }
        
        return newSections;
      });
    }

    setDraggedItem(null);
    setDropIndicator(null);
  };

  const findAndRemoveSection = (sections, sectionId) => {
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].id === sectionId) {
        return sections.splice(i, 1)[0];
      }
      if (sections[i].children) {
        const found = findAndRemoveSection(sections[i].children, sectionId);
        if (found) return found;
      }
    }
    return null;
  };

  const renderNestedSections = (sections, level = 0) => {
    return sections.map((section, index) => (
      <div 
        key={section.id}
        data-section-id={section.id}
        data-section-type={section.type}
        className={`mb-4 ${level > 0 ? `ml-${level * 4}` : ''}`}
      >
        {dropIndicator && dropIndicator.sectionId === section.id && dropIndicator.position === 'before' && (
          <div className="h-1 bg-blue-500 my-2" />
        )}
        <div
          className={`p-2 rounded ${
            dropIndicator && dropIndicator.sectionId === section.id && dropIndicator.position === 'inside'
              ? 'border-2 border-dashed border-blue-500'
              : ''
          }`}
          draggable={isEditingSections}
          onDragStart={(e) => onDragStart(e, section, 'section')}
        >
          {section.type === 'divider' ? (
            <div className="flex items-center justify-between py-2">
              <hr className="flex-grow border-t border-gray-300" />
              {isEditingSections && (
                <Button variant="destructive" onClick={() => deleteSection(section.id)} className="ml-2">
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSectionVisibility(section.id)}>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  {sectionVisibility[section.id] ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </div>
                <h2 className="text-xl font-bold">{renderSectionTitle(section.name)}</h2>
              </div>
              {isEditingSections && (
                <Button variant="destructive" onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}>
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        {section.type !== 'divider' && sectionVisibility[section.id] && (
          <div className="mt-2 pl-4">
            <ul className="space-y-2">
              {getTasksForSection(section.id).map(task => renderTask(task, section.id))}
            </ul>
            {section.children && renderNestedSections(section.children, level + 1)}
          </div>
        )}
        {dropIndicator && dropIndicator.sectionId === section.id && dropIndicator.position === 'after' && (
          <div className="h-1 bg-blue-500 my-2" />
        )}
      </div>
    ));
  };

  const renderTask = (task, sectionId) => (
    <li
      key={task.id}
      className={`mb-2 p-2 border rounded flex items-center justify-between ${
        task.completed ? 'bg-gray-300 text-gray-800' : ''
      } ${selectedTasks.includes(task.id) ? 'bg-slate-900 text-white' : ''}`}
      style={{ borderColor: tags.find(tag => tag.id === task.tag)?.color }}
      draggable={!isEditingSections}
      onDragStart={(e) => onDragStart(e, task, 'task')}
      onClick={(e) => toggleTaskSelection(task.id, e)}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTaskCompletion(task.id)}
          className="mr-2"
          onClick={(e) => e.stopPropagation()} // Prevent checkbox from triggering selection
        />
        <span className={task.completed ? 'line-through' : ''}>
          {task.text} <span className={`text-sm ${selectedTasks.includes(task.id) ? 'text-gray-300' : 'text-gray-500'}`}>({tags.find(tag => tag.id === task.tag)?.name})</span>
        </span>
      </div>
      <div className="flex items-center">
        <span className={`text-sm mr-2 ${selectedTasks.includes(task.id) ? 'text-gray-300' : 'text-gray-500'}`}>Due: {task.dueDate || 'No Due Date'}</span>
        <Button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="mr-2">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
  
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
          <Button onClick={addTask} className="px-4 py-2">Add</Button>
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

        <div
          ref={sectionsRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
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