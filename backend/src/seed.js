/**
 * MedFlow Database Seeder
 * Seeds 10 doctors across specialties + time slots for the next 7 days
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DOCTORS = [
  { name: 'Dr. Ayesha Malik', specialty: 'Cardiologist', email: 'ayesha.malik@medflow.com', bio: 'Interventional cardiologist with 12 years of experience in heart disease management.', avatarInitials: 'AM' },
  { name: 'Dr. Rajan Mehta', specialty: 'Neurologist', email: 'rajan.mehta@medflow.com', bio: 'Expert in epilepsy, headache disorders, and neurodegenerative diseases.', avatarInitials: 'RM' },
  { name: 'Dr. Priya Sharma', specialty: 'Pulmonologist', email: 'priya.sharma@medflow.com', bio: 'Specializes in asthma, COPD, and sleep-related breathing disorders.', avatarInitials: 'PS' },
  { name: 'Dr. Samuel Okonkwo', specialty: 'Gastroenterologist', email: 'samuel.okonkwo@medflow.com', bio: 'Expert in digestive diseases, endoscopy, and inflammatory bowel conditions.', avatarInitials: 'SO' },
  { name: 'Dr. Lin Wei', specialty: 'Orthopedist', email: 'lin.wei@medflow.com', bio: 'Sports medicine and joint replacement specialist with 8 years of clinical practice.', avatarInitials: 'LW' },
  { name: 'Dr. Fatima Al-Hassan', specialty: 'Dermatologist', email: 'fatima.alhassan@medflow.com', bio: 'Cosmetic and medical dermatologist specializing in skin cancer and acne.', avatarInitials: 'FA' },
  { name: 'Dr. Marcus Johnson', specialty: 'Psychiatrist', email: 'marcus.johnson@medflow.com', bio: 'Adult psychiatrist focused on anxiety, depression, and trauma-informed care.', avatarInitials: 'MJ' },
  { name: 'Dr. Kavita Reddy', specialty: 'Endocrinologist', email: 'kavita.reddy@medflow.com', bio: 'Specializes in diabetes management, thyroid disorders, and metabolic conditions.', avatarInitials: 'KR' },
  { name: 'Dr. Thomas Adeyemi', specialty: 'General Physician', email: 'thomas.adeyemi@medflow.com', bio: 'Family medicine physician providing comprehensive primary care for all ages.', avatarInitials: 'TA' },
  { name: 'Dr. Sarah Chen', specialty: 'Ophthalmologist', email: 'sarah.chen@medflow.com', bio: 'Retinal specialist and cataract surgeon with expertise in laser eye surgery.', avatarInitials: 'SC' },
];

const TIME_SLOTS = [
  { startTime: '09:00', endTime: '09:30' },
  { startTime: '09:30', endTime: '10:00' },
  { startTime: '10:00', endTime: '10:30' },
  { startTime: '10:30', endTime: '11:00' },
  { startTime: '11:00', endTime: '11:30' },
  { startTime: '14:00', endTime: '14:30' },
  { startTime: '14:30', endTime: '15:00' },
  { startTime: '15:00', endTime: '15:30' },
  { startTime: '15:30', endTime: '16:00' },
  { startTime: '16:00', endTime: '16:30' },
];

function getNextDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      days.push(d.toISOString().split('T')[0]);
    }
  }
  return days;
}

async function main() {
  console.log('🌱 Seeding MedFlow database...\n');

  // Clear existing data
  await prisma.agentLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();

  const days = getNextDays(12); // ~8-9 weekdays

  for (const doctorData of DOCTORS) {
    const doctor = await prisma.doctor.create({ data: doctorData });
    console.log(`✅ Created doctor: ${doctor.name} (${doctor.specialty})`);

    // Create slots for each day
    for (const date of days) {
      for (const slot of TIME_SLOTS) {
        await prisma.slot.create({
          data: { doctorId: doctor.id, date, ...slot },
        });
      }
    }
    console.log(`   📅 Created ${days.length * TIME_SLOTS.length} slots\n`);
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log(`   👨‍⚕️ Doctors: ${DOCTORS.length}`);
  console.log(`   📅 Slots per doctor: ${days.length * TIME_SLOTS.length}`);
  console.log(`   📅 Total slots: ${DOCTORS.length * days.length * TIME_SLOTS.length}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
