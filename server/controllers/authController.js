// server/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Register a new user (joins existing organization if name matches, or creates one if it doesn't)
const register = async (req, res) => {
  const { name, email, password, role, org_name } = req.body;

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    let targetOrgId;

    if (org_name) {
      // Trim and check case-insensitively if the organization already exists
      const existingOrg = await pool.query(
        'SELECT id FROM organizations WHERE LOWER(name) = LOWER($1)',
        [org_name.trim()]
      );

      if (existingOrg.rows.length > 0) {
        // Organization already exists, join it!
        targetOrgId = existingOrg.rows[0].id;
      } else {
        // Organization doesn't exist yet, create a new tenant workspace
        const newOrg = await pool.query(
          'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
          [org_name.trim()]
        );
        targetOrgId = newOrg.rows[0].id;
      }
    } else {
      targetOrgId = 1; // Fallback default organization ID
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert into database with the correct shared org_id
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, org_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, org_id',
      [name, email, password_hash, role || 'Admin', targetOrgId]
    );

    res.status(201).json({ message: 'User registered successfully into workspace', user: newUser.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login existing user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with org_id payload
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role, org_id: user.rows[0].org_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.rows[0].id, 
        name: user.rows[0].name, 
        role: user.rows[0].role, 
        org_id: user.rows[0].org_id // Included for frontend workspace context
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get users restricted strictly to the logged-in user's organization
const getUsers = async (req, res) => {
  const orgId = req.user.org_id; // Secured tenant boundary
  try {
    const users = await pool.query(
      'SELECT id, name, email, role FROM users WHERE org_id = $1',
      [orgId]
    );
    res.json(users.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

module.exports = { register, login, getUsers };