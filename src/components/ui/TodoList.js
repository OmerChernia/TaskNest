"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash, GripVertical, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [sections, setSections] = useState(initialSections);
  const [newTask, setNewTask] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditingSections, setIsEditingSections] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState({}); // New state to manage section visibility

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem('tasks');
      const storedTags = localStorage.getItem('tags');
      const storedSections = localStorage.getItem('sections');
      const storedVisibility = localStorage.getItem('sectionVisibility');

      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedTags) setTags(JSON.parse(storedTags));
      if (storedSections) setSections(JSON.parse(storedSections));
      if (storedVisibility) setSectionVisibility(JSON.parse(storedVisibility));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tags', JSON.stringify(tags));
    }
  }, [tags, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sections', JSON.stringify(sections));
    }
  }, [sections, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sectionVisibility', JSON.stringify(sectionVisibility));
    }
  }, [sectionVisibility, isMounted]);

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

  const addSection = () => {
    if (newSectionName.trim() !== '' && !sections.includes(newSectionName)) {
      setSections([...sections, newSectionName]);
      setNewSectionName('');
    }
  };

  const deleteSection = (sectionName) => {
    if (initialSections.includes(sectionName)) {
      alert("Cannot delete default sections.");
      return;
    }
    setSections(sections.filter(section => section !== sectionName));
  };

  const onDragStartSection = (index) => {
    setDraggedSectionIndex(index);
  };

  const onDragOverSection = (e) => {
    e.preventDefault();
  };

  const onDropSection = (e, index) => {
    e.preventDefault();
    if (draggedSectionIndex !== null) {
      const newSections = [...sections];
      const [movedSection] = newSections.splice(draggedSectionIndex, 1);
      newSections.splice(index, 0, movedSection);
      setSections(newSections);
      setDraggedSectionIndex(null);
    }
  };

  const getTasksForSection = (sectionName) => {
    if (sectionName === 'New Tasks') {
      return tasks.filter(task => task.displayDate === null);
    }
    const dayDate = getDateForDay(sectionName);
    return tasks.filter(task => task.displayDate === dayDate);
  };

  const getDateForDay = (day) => {
    const today = new Date();
    const diff = daysOfWeek.indexOf(day) - today.getDay();
    const date = new Date(today.setDate(today.getDate() + diff));
    return date.toISOString().split('T')[0];
  };

  const onDragStartTask = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const onDropTask = (e, targetSection) => {
    e.preventDefault();
    if (draggedTaskId) {
      const updatedTasks = tasks.map(task => {
        if (task.id === draggedTaskId) {
          return { ...task, displayDate: targetSection === 'New Tasks' ? null : getDateForDay(targetSection) };
        }
        return task;
      });
      setTasks(updatedTasks);
      setDraggedTaskId(null);
    }
  };

  const renderSectionTitle = (section) => {
    if (initialSections.includes(section)) {
      const date = getDateForDay(section);
      return section === "New Tasks" ? section : `${section} (${date})`;
    }
    return section;
  };

  const toggleSectionVisibility = (sectionName) => {
    setSectionVisibility(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const renderTask = (task) => (
    <li
      key={task.id}
      className={`mb-2 p-2 border rounded flex items-center justify-between ${task.completed ? 'bg-gray-300 text-gray-800' : ''}`}
      style={{ borderColor: tags.find(tag => tag.id === task.tag)?.color }}
      draggable={!isEditingSections}
      onDragStart={(e) => onDragStartTask(e, task.id)}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTaskCompletion(task.id)}
          className="mr-2"
        />
        <span className={task.completed ? 'line-through' : ''}>
          {task.text} <span className="text-gray-500 text-sm">({tags.find(tag => tag.id === task.tag)?.name})</span>
        </span>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-500 mr-2">Due: {task.dueDate || 'No Due Date'}</span>
        <Button onClick={() => deleteTask(task.id)} className="mr-2">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );

  return (
    <div className="p-4">
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
            className="mr-2"
          />
          <Button onClick={addSection} className="px-4 py-2">Add Section</Button>
        </div>
      )}

      {sections.map((section, index) => (
        <div 
          key={section} 
          className="mb-4"
          draggable={isEditingSections}
          onDragStart={() => onDragStartSection(index)}
          onDragOver={onDragOverSection}
          onDrop={(e) => onDropSection(e, index)}
        >
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSectionVisibility(section)}>
            <div className="flex items-center">
              {sectionVisibility[section] ? <ChevronDown className="mr-2" /> : <ChevronRight className="mr-2" />}
              <h2 className="text-xl font-bold">{renderSectionTitle(section)}</h2>
            </div>
            <div className="flex items-center">
              {isEditingSections && <GripVertical className="cursor-move mr-2" />}
              {section !== 'New Tasks' && !initialSections.includes(section) && isEditingSections && (
                <Button variant="destructive" onClick={(e) => { e.stopPropagation(); deleteSection(section); }}>
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {sectionVisibility[section] && (
            <ul>
              {getTasksForSection(section).map(renderTask)}
            </ul>
          )}
        </div>
      ))}

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
  );
};

export default TodoList;