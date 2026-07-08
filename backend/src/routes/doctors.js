const express = require('express');
const router = express.Router();

/**
 * GET /api/doctors
 * Returns all doctors with their upcoming available slots
 */
router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const { specialty } = req.query;
  const today = new Date().toISOString().split('T')[0];

  try {
    const where = specialty ? { specialty } : {};
    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        slots: {
          where: { date: { gte: today } },
          orderBy: { date: 'asc' },
          take: 10,
        },
        _count: { select: { appointments: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/doctors/specialties
 * Returns list of all unique specialties
 */
router.get('/specialties', async (req, res) => {
  const prisma = req.prisma;
  try {
    const doctors = await prisma.doctor.findMany({ select: { specialty: true }, distinct: ['specialty'] });
    res.json({ specialties: doctors.map((d) => d.specialty) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/doctors/:id
 * Returns a single doctor with full slot info
 */
router.get('/:id', async (req, res) => {
  const prisma = req.prisma;
  const today = new Date().toISOString().split('T')[0];
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: {
        slots: { where: { date: { gte: today } }, orderBy: { date: 'asc' } },
        appointments: {
          include: { patient: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
