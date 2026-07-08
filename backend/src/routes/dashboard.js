const express = require('express');
const router = express.Router();

/**
 * GET /api/dashboard
 * Returns aggregate stats for the admin dashboard
 */
router.get('/', async (req, res) => {
  const prisma = req.prisma;
  try {
    const [
      totalAppointments,
      scheduledAppointments,
      cancelledAppointments,
      agentBookedCount,
      totalPatients,
      totalDoctors,
      recentAppointments,
      urgencyBreakdown,
      recentLogs,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.appointment.count({ where: { agentBooked: true } }),
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, doctor: true, slot: true },
      }),
      prisma.appointment.groupBy({
        by: ['urgency'],
        _count: true,
      }),
      prisma.agentLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { patient: { select: { name: true } } },
      }),
    ]);

    res.json({
      stats: {
        totalAppointments,
        scheduledAppointments,
        cancelledAppointments,
        agentBookedCount,
        humanBookedCount: totalAppointments - agentBookedCount,
        totalPatients,
        totalDoctors,
        agentBookingRate: totalAppointments > 0
          ? Math.round((agentBookedCount / totalAppointments) * 100)
          : 0,
      },
      urgencyBreakdown,
      recentAppointments,
      recentLogs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
