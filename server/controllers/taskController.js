// server/controllers/taskController.js
const pool = require('../config/db');

const createTask = async (req, res) => {
  const { title, type, due_date, lead_id, assigned_to } = req.body;
  const targetUser = assigned_to || req.user.id; 
  const orgId = req.user.org_id;

  try {
    const newTask = await pool.query(
      'INSERT INTO tasks (title, type, due_date, lead_id, assigned_to, org_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, type, due_date, lead_id, targetUser, orgId]
    );

    if (targetUser !== req.user.id) {
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${targetUser}`).emit('receive_notification', {
          id: Date.now(),
          type: 'task_assignment',
          message: `New task assigned to you: "${title}"`
        });
      }
    }

    res.status(201).json(newTask.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while creating task' });
  }
};

const getTasks = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const orgId = req.user.org_id;

  try {
    let tasksQuery;
    let queryParams = [orgId];

    if (userRole === 'Admin') {
      tasksQuery = `
        SELECT tasks.*, leads.name AS lead_name, users.name AS assignee_name 
        FROM tasks 
        LEFT JOIN leads ON tasks.lead_id = leads.id
        LEFT JOIN users ON tasks.assigned_to = users.id
        WHERE tasks.org_id = $1
        ORDER BY tasks.due_date ASC
      `;
    } else if (userRole === 'Sales Manager') {
      tasksQuery = `
        SELECT tasks.*, leads.name AS lead_name, users.name AS assignee_name 
        FROM tasks 
        LEFT JOIN leads ON tasks.lead_id = leads.id
        LEFT JOIN users ON tasks.assigned_to = users.id
        WHERE tasks.org_id = $1 AND (tasks.assigned_to = $2 OR users.role = 'Sales Executive')
        ORDER BY tasks.due_date ASC
      `;
      queryParams = [orgId, userId];
    } else {
      tasksQuery = `
        SELECT tasks.*, leads.name AS lead_name, users.name AS assignee_name 
        FROM tasks 
        LEFT JOIN leads ON tasks.lead_id = leads.id
        LEFT JOIN users ON tasks.assigned_to = users.id
        WHERE tasks.org_id = $1 AND tasks.assigned_to = $2
        ORDER BY tasks.due_date ASC
      `;
      queryParams = [orgId, userId];
    }

    const tasks = await pool.query(tasksQuery, queryParams);
    res.json(tasks.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while fetching tasks' });
  }
};

const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orgId = req.user.org_id;

  try {
    const updatedTask = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 AND org_id = $3 RETURNING *',
      [status, id, orgId]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while updating task' });
  }
};

module.exports = { createTask, getTasks, updateTaskStatus };