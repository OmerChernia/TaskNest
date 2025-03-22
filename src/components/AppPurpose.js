import React from 'react';

const AppPurpose = () => {
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">About TaskNest</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-700 mb-4">
          TaskNest is a comprehensive task management application designed to help you organize your day, 
          manage your time effectively, and boost your productivity.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Features:</h3>
        
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700">
          <li>
            <span className="font-medium">Task Organization</span>: Create, categorize, and prioritize tasks with an 
            intuitive drag-and-drop interface.
          </li>
          <li>
            <span className="font-medium">Time Management</span>: Track task durations, visualize your daily workload, 
            and optimize your schedule.
          </li>
          <li>
            <span className="font-medium">Google Calendar Integration</span>: Seamlessly sync your tasks with Google Calendar 
            to maintain a unified view of your commitments.
          </li>
          <li>
            <span className="font-medium">Smart Sections</span>: Organize tasks by projects, timeframes, or custom categories 
            to keep everything structured.
          </li>
        </ul>
        
        <p className="text-gray-700 mb-4">
          TaskNest helps you stay on top of your commitments, reduce mental load, and ensure important 
          tasks don't fall through the cracks. Whether you're managing personal projects, work assignments, 
          or daily routines, TaskNest adapts to your workflow and helps you accomplish more.
        </p>
      </div>
    </div>
  );
};

export default AppPurpose;