// server/controllers/emailController.js
const nodemailer = require('nodemailer');
const pool = require('../config/db');

const sendEmailToLead = async (req, res) => {
  const { to, subject, message } = req.body;
  const orgId = req.user.org_id;

  try {
    // 1. Fetch organization-specific email configuration from database
    // (Assuming you have an organization settings or integrations table, or fallback to environment variables)
    let smtpUser = process.env.EMAIL_USER;
    let smtpPass = process.env.EMAIL_PASS;

    const orgSettings = await pool.query(
      'SELECT smtp_user, smtp_pass FROM organizations WHERE id = $1',
      [orgId]
    );

    if (orgSettings.rows.length > 0 && orgSettings.rows[0].smtp_user) {
      smtpUser = orgSettings.rows[0].smtp_user;
      smtpPass = orgSettings.rows[0].smtp_pass;
    }

    if (!smtpUser || !smtpPass) {
      return res.status(400).json({ error: 'Email integration not configured for this organization. Please set up your SMTP settings.' });
    }

    // 2. Create transport dynamically using tenant credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: smtpUser,
      to,
      subject,
      text: message
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully using organization configuration!' });
  } catch (error) {
    console.error('Detailed Email Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send email. Check SMTP configuration.' });
  }
};

module.exports = { sendEmailToLead };