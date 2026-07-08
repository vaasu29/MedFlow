const express = require('express');
const router = express.Router();

/**
 * GET /api/agent-logs
 * Returns agent decision history (explainability)
 */
router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const { limit = 50 } = req.query;
  try {
    const logs = await prisma.agentLog.findMany({
      include: { patient: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/agent-logs/:id
 */
router.get('/:id', async (req, res) => {
  const prisma = req.prisma;
  try {
    const log = await prisma.agentLog.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json({ log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
