# TaskNest: Advanced Todo List Application

![TaskNest Logo](public/TaskNest_WhiteText.png)

![TaskNest Demo](public/TaskNestVideoGuide.gif)

For a comprehensive guide on how to use TaskNest, check out our [full video tutorial](https://youtu.be/3j2eApYxfgc?si=7vLtisouR46DI2g9).

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Live Demo](#live-demo)
4. [Technologies Used](#technologies-used)
5. [Getting Started](#getting-started)
6. [Usage Guide](#usage-guide)
7. [API Documentation](#api-documentation)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)

## Introduction

TaskNest is a sophisticated, feature-rich todo list application designed to boost productivity and streamline task management. With its intuitive interface and powerful features, TaskNest helps users organize their tasks efficiently across different time frames and categories.

[Add a GIF showcasing the overall application interface and basic usage]

## Features

- **Dynamic Task Creation**: Quickly add tasks with titles, tags, durations, and due dates.
- **Customizable Tags**: Create and manage color-coded tags for easy task categorization.
- **Drag-and-Drop Interface**: Effortlessly reorganize tasks and sections.
- **Multi-select and Bulk Actions**: Select multiple tasks for efficient management.
- **Google Calendar Integration**: Sync tasks with Google Calendar for seamless scheduling.
- **Weekly View**: Organize tasks in a weekly layout for better time management.
- **Task Duplication**: Easily duplicate tasks for recurring items.
- **Responsive Design**: Fully functional on both desktop and mobile devices.
- **User Authentication**: Secure login system to protect user data.

[Add GIFs demonstrating key features like drag-and-drop, tag creation, and Google Calendar sync]

## Live Demo

Experience TaskNest in action: [TaskNest Live Demo](https://tasknest.org)

## Technologies Used

- **Frontend**:
  - React.js
  - Next.js
  - Tailwind CSS
  - Lucide React (for icons)
  - React Hot Keys Hook
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (with Mongoose ORM)
- **Authentication**:
  - NextAuth.js
- **Deployment**:
  - Vercel Platform

## Getting Started

To run TaskNest locally:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/taskmaster-pro.git
   ```
2. Navigate to the project directory:
   ```
   cd taskmaster-pro
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=your_secret_key
     MONGODB_URI=your_mongodb_connection_string
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     ```
5. Run the development server:
   ```
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

1. **Creating a Task**:

   - Use the input field at the top of the page to enter a task title.
   - Select a tag, duration, and due date (optional).
   - Click "Add" to create the task.

2. **Managing Tags**:

   - Click "Edit Tags" to open the tag management modal.
   - Add new tags with custom colors or delete existing ones.

3. **Organizing Tasks**:

   - Drag and drop tasks between different sections.
   - Use the weekly view to organize tasks by day.

4. **Bulk Actions**:

   - Hold Shift and click to select multiple tasks.
   - Perform actions like delete or move on selected tasks.

5. **Google Calendar Sync**:
   - Click "Sync Week's Tasks" to add your tasks to Google Calendar.

[Add GIFs demonstrating each of these key usage points]

## API Documentation

TaskNest uses a RESTful API for backend operations. Key endpoints include:

- `GET /api/tasks`: Retrieve all tasks
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task
- `GET /api/tags`: Retrieve all tags
- `POST /api/tags`: Create a new tag

For full API documentation, please refer to our [API Guide](link-to-api-documentation).

## Contributing

We welcome contributions to TaskNest! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

Developer: Omer Chernia.
Email: omer12899@gmail.com
GitHub: [@OmerChernia](https://github.com/OmerChernia)
LinkedIn: [Omer Chernia](https://www.linkedin.com/in/omer-chernia-14a573228/)

---

Deployed with ❤️ using [Vercel](https://vercel.com)
