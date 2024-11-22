const fs = require('fs');  // 1
const path = require('path');  // 2

// Path to the tasks.json file
const tasksFile = path.join(__dirname, 'tasks.json');  // 3

// Check if the tasks.json file exists
if (!fs.existsSync(tasksFile)) {  // 4
  // If not, create it with an empty array
  fs.writeFileSync(tasksFile, JSON.stringify([], null, 2));  // 5
  console.log('tasks.json created!');  // 6
}

// Get the task description from command-line arguments
const action = process.argv[2]; // Action like "add"


// NEED FURTHER UNDERSTANDING
let taskDescription = process.argv.slice(4).join(' ') // Join everything after the action as task description 
const taskID = Number(process.argv.slice(3)[0])

if (action === 'test') {
  console.log(process.argv.slice(3)[0] === 'noone')
}

// Check if the user wants to add a task
if (action) {
  if (action === 'add') {
    taskDescription = process.argv.slice(3).join(' ')
    addTask(taskDescription)
  } else if (action === 'list') {
    const listType = process.argv.slice(3)[0]
    listTasks(listType)
  } else if (action === 'delete' && taskID) {

    if (!isNaN(taskID) && Number.isFinite(taskID)) {
      deleteTask(taskID); // Pass the valid number to deleteTasks
      console.log('Task deleted successfully.');
    } else {
      console.log('Error: Task ID must be a valid number.');
    }

  } else if (action === 'update') {
    updateTask(taskID, taskDescription)
  } else if (action === 'mark-in-progress') {
    markInProgress(taskID)
  } else if (action === 'mark-done') {
    markDone(taskID)
    console.log('done')
  }
  else if (!taskDescription) {
    console.log('Usage: node task-tracker.js add "task description"');
  } else {
    console.log('Error')
  }
} else {
  console.log('type help for more functions')
}


// Function to add a task
function addTask(description) {

  // Read the current tasks from the JSON file
  fs.readFile('tasks.json', 'utf8', (err, data) => {

    let allTasks = JSON.parse(data)
    const maxID = allTasks.length > 0 ? Math.max(...allTasks.map(task => task.id)) : 0;

    const task = {
      id: maxID + 1,
      description: description,
      status: {
        done: false,
        inprogress: false,
        todo: true
      }
    };

    if (err && err.code === 'ENOENT') {
      // If the file doesn't exist, initialize an empty task array
      const tasks = [task];
      saveTasks(tasks);
    } else if (err) {
      console.log('Error reading tasks file:', err);
    } else {
      // Parse the current tasks and add the new task
      const tasks = JSON.parse(data);
      tasks.push(task);
      saveTasks(tasks);
    }
  });
}

function deleteTask(id) {
  fs.readFile('tasks.json', 'utf8', (err, data) => {
    let tasks = JSON.parse(data)

    const newTasks = tasks.filter(task => task.id !== id)
    saveTasks(newTasks)
  })
}

function updateTask(id, updatedDescription) {
  fs.readFile('tasks.json', 'utf8', (err, data) => {
    let tasks = JSON.parse(data)

    const taskIndex = tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      console.log('Task ID not found')
    } else {
      tasks[taskIndex].description = updatedDescription
      saveTasks(tasks)
    }
  })
}

function markInProgress(id) {
  fs.readFile('tasks.json', 'utf8', (err, data) => {
    let tasks = JSON.parse(data)

    const taskIndex = tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      console.log('Task ID not found')
    } else {
      tasks[taskIndex].status.inprogress = true
      tasks[taskIndex].status.done = false
      tasks[taskIndex].status.todo = false
      saveTasks(tasks)
    }
  })
}

function markDone(id) {
  fs.readFile('tasks.json', 'utf8', (err, data) => {
    let tasks = JSON.parse(data)

    const taskIndex = tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      console.log('Task ID not found')
    } else {
      tasks[taskIndex].status.inprogress = false
      tasks[taskIndex].status.done = true
      tasks[taskIndex].status.todo = false
      saveTasks(tasks)
    }
  })
}

// Function to save tasks to the JSON file
function saveTasks(tasks) {
  fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), (err) => {
    if (err) {
      console.log('Error saving tasks:', err);
    } else {
      console.log('Task added successfully!');
    }
  });
}

// Function to list all tasks
function listTasks(listType) {
  fs.readFile('tasks.json', 'utf8', (err, data) => {
    if (err && err.code === 'ENOENT') {
      console.log('No tasks found. Add some tasks first!');
    } else if (err) {
      console.log('Error reading tasks file:', err);
    } else {

      const tasks = JSON.parse(data)

      if (tasks.length === 0) {
        console.log('No tasks available.')

      } else if (listType === 'todo') {
        const todoTasks = tasks.filter(tasks => tasks.status.todo === true)
        console.log('Tasks:');
        todoTasks.forEach(task => {
          console.log(`(ID: ${task.id})  [${task.status.done ? 'X' : task.status.inprogress ? 'P' : ' '}] ${task.description}`)
        });

      } else if (listType === 'done') {
        const doneTasks = tasks.filter(tasks => tasks.status.done === true)
        console.log('Completed Tasks:');
        doneTasks.forEach(task => {
          console.log(`(ID: ${task.id})  [${task.status.done ? 'X' : task.status.inprogress ? 'P' : ' '}] ${task.description}`)
        });

      } else if (listType === 'in-progress') {
        const progressTasks = tasks.filter(tasks => tasks.status.inprogress === true)
        console.log('In-Progress Tasks:');
        progressTasks.forEach(task => {
          console.log(`(ID: ${task.id})  [${task.status.done ? 'X' : task.status.inprogress ? 'P' : ' '}] ${task.description}`)
        });

      } else {
        console.log('Tasks:');
        tasks.forEach(task => {
          console.log(`(ID: ${task.id})  [${task.status.done ? 'X' : task.status.inprogress ? 'P' : ' '}] ${task.description}`)
        });
      }
    }
  });
}