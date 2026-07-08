const express = require('express');
const { body, validationResult } = require('express-validator');
const { runIntakeAgent } = require('../agent/mockIntakeAgent');

const router = express.Router();

/**
 * POST /api/intake
 * Submits patient intake — AI agent processes symptoms and books appointment
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('symptoms').trim().isLength({ min: 10 }).withMessage('Please describe your symptoms (min 10 chars)'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, dateOfBirth, symptoms } = req.body;
    const prisma = req.prisma;

    try {
      // Upsert patient
      let patient = await prisma.patient.findUnique({ where: { email } });
      if (!patient) {
        patient = await prisma.patient.create({
          data: { name, email, phone: phone || null, dateOfBirth: dateOfBirth || null },
        });
      }

      // Run AI agent
      const agentResult = await runIntakeAgent({
        symptoms,
        patientId: patient.id,
        prisma,
      });

      return res.status(200).json({
        patient: { id: patient.id, name: patient.name, email: patient.email },
        agent: agentResult,
      });
    } catch (err) {
      console.error('Intake error:', err);
      return res.status(500).json({ error: 'Failed to process intake', message: err.message });
    }
  }
);

module.exports = router;
