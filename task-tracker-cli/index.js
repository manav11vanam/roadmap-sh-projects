#!/usr/bin/env node

// This is a basic implementation of https://roadmap.sh/projects/task-tracker

var fs = require('fs').promises;
const taskMethods = [
  'add',
  'update',
  'delete',
  'list',
  'mark-done',
  'mark-in-progress',
];
const taskStatus = ['todo', 'in-progress', 'done'];
const FILENAME = 'task-cli-tasks.json';

async function createTasksFileIfNotPresent() {
  try {
    await fs.access(FILENAME);
  } catch {
    await fs.writeFile(FILENAME, []);
  }
}

async function readTasksFile() {
  let tasks = await fs.readFile(FILENAME, { encoding: 'utf-8' });
  if (tasks.length === 0) tasks = '[]';
  return JSON.parse(tasks);
}

async function writeTasksFile(data) {
  await fs.writeFile(FILENAME, JSON.stringify(data));
}

async function addTask(task) {
  const tasks = await readTasksFile();
  const taskId = tasks.length;
  tasks.push({ task, id: taskId, status: 'to-do' });
  await writeTasksFile(tasks);
  console.log(`Task added successfully (ID: ${taskId})`);
}

async function updateTask(id, updatedTask) {
  id = parseInt(id);
  const tasks = await readTasksFile();
  const updatedTasks = tasks.map((task) =>
    task.id !== id ? task : { ...task, task: updatedTask }
  );
  await writeTasksFile(updatedTasks);
  console.log('Task updated successfully');
}

async function deleteTask(id) {
  id = parseInt(id);
  const tasks = await readTasksFile();
  const remainingTasks = tasks.filter((task) => task.id !== id);
  await writeTasksFile(remainingTasks);
  console.log('Task deleted successfully');
}

async function listTasks(listByStatus) {
  let tasks = await readTasksFile();
  if (listByStatus) {
    if (!taskStatus.includes(listByStatus)) {
      console.log(`Task status must be one of the following: ${taskStatus}`);
      return;
    }
    tasks = tasks.filter((task) => task.status === listByStatus);
  }
  if (tasks.length === 0) console.log('List empty');
  else {
    tasks.map((task) => console.log(task.id, task.status, task.task));
  }
}

async function updateTaskStatus(id, status) {
  id = parseInt(id);
  const tasks = await readTasksFile();
  const updatedTasks = tasks.map((task) =>
    task.id !== id ? task : { ...task, status }
  );
  await writeTasksFile(updatedTasks);
  console.log(`Task marked as ${status} successfully`);
}

async function main() {
  const taskMethod = process.argv[2];
  await createTasksFileIfNotPresent();
  try {
    let taskId, task;
    switch (taskMethod) {
      case 'add':
        task = process.argv[3];
        addTask(task);
        break;
      case 'update':
        taskId = process.argv[3];
        const updatedTask = process.argv[4];
        updateTask(taskId, updatedTask);
        break;
      case 'delete':
        taskId = process.argv[3];
        deleteTask(taskId);
        break;
      case 'list':
        const listByStatus = process.argv[3];
        listTasks(listByStatus);
        break;
      case 'mark-done':
        taskId = process.argv[3];
        updateTaskStatus(taskId, 'done');
        break;
      case 'mark-in-progress':
        taskId = process.argv[3];
        updateTaskStatus(taskId, 'in-progress');
        break;
      default:
        console.log(`Task method can be one of the following: ${taskMethods}`);
        break;
    }
  } catch (err) {
    console.log(err);
  }
}
main();
