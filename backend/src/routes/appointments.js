const express = require('express');
const router = express.Router();

/**
 * GET /api/appointments
 */
router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const { status, doctorId, patientId } = req.query;
  try {
    const where = {};
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/appointments/:id
 */
router.get('/:id', async (req, res) => {
  const prisma = req.prisma;
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true, doctor: true, slot: true },
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/appointments
 * Manual booking (human override)
 */
router.post('/', async (req, res) => {
  const prisma = req.prisma;
  const { patientId, doctorId, slotId, symptoms, notes } = req.body;

  if (!patientId || !doctorId || !slotId) {
    return res.status(400).json({ error: 'patientId, doctorId, slotId are required' });
  }

  try {
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.isBooked) return res.status(409).json({ error: 'Slot already booked' });

    await prisma.slot.update({ where: { id: slotId }, data: { isBooked: true } });

    const appointment = await prisma.appointment.create({
      data: { patientId, doctorId, slotId, symptoms, notes, agentBooked: false, status: 'SCHEDULED' },
      include: { patient: true, doctor: true, slot: true },
    });

    res.status(201).json({ appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/appointments/:id
 * Update status (reschedule, cancel, complete) — human override
 */
router.patch('/:id', async (req, res) => {
  const prisma = req.prisma;
  const { status, notes, slotId } = req.body;

  try {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });

    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    // Handle rescheduling to a new slot
    if (slotId && slotId !== existing.slotId) {
      const newSlot = await prisma.slot.findUnique({ where: { id: slotId } });
      if (!newSlot) return res.status(404).json({ error: 'New slot not found' });
      if (newSlot.isBooked) return res.status(409).json({ error: 'New slot already booked' });

      // Free old slot
      await prisma.slot.update({ where: { id: existing.slotId }, data: { isBooked: false } });
      // Book new slot
      await prisma.slot.update({ where: { id: slotId }, data: { isBooked: true } });
      updateData.slotId = slotId;
      updateData.status = 'RESCHEDULED';
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData,
      include: { patient: true, doctor: true, slot: true },
    });

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/appointments/:id — Cancel
 */
router.delete('/:id', async (req, res) => {
  const prisma = req.prisma;
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.slot.update({ where: { id: existing.slotId }, data: { isBooked: false } });
    await prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });

    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
