// server/controllers/aiController.js
const Groq = require('groq-sdk');
const pool = require('../config/db');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const scoreLead = async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.org_id; // Tenant scope

  try {
    // Ensure lead belongs to user's organization
    const leadQuery = await pool.query('SELECT * FROM leads WHERE id = $1 AND org_id = $2', [id, orgId]);
    if (leadQuery.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    
    const lead = leadQuery.rows[0];

    const prompt = `
      You are an expert Sales AI Assistant. Analyze the following lead and provide a conversion probability score from 0 to 100.
      Also provide a 1-sentence strategic reason for this score.
      
      Lead Data:
      - Name: ${lead.name}
      - Company: ${lead.company || 'Unknown'}
      - Source: ${lead.source || 'Unknown'}
      - Current Pipeline Status: ${lead.status}
      - Deal Value: $${lead.deal_value || 0}
      
      Respond strictly in this JSON format: {"score": 85, "reason": "Brief explanation here"}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);

    // Save score and reason directly into PostgreSQL scoped by tenant
    await pool.query(
      'UPDATE leads SET ai_score = $1, ai_reason = $2 WHERE id = $3 AND org_id = $4',
      [aiResponse.score, aiResponse.reason, id, orgId]
    );

    res.json(aiResponse);
  } catch (error) {
    console.error('AI Scoring Error:', error);
    res.status(500).json({ error: 'Failed to generate AI score' });
  }
};

module.exports = { scoreLead };