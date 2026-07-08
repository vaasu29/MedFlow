/**
 * MedFlow Mock AI Intake Agent
 *
 * Simulates an LLM-powered agent that:
 * 1. Parses free-text symptoms
 * 2. Classifies urgency (LOW / MEDIUM / HIGH / CRITICAL)
 * 3. Recommends a specialist
 * 4. Looks up availability and books a slot
 * 5. Logs every decision with reasoning + confidence
 */

const SPECIALTY_KEYWORDS = {
  Cardiologist: [
    'chest pain', 'chest pressure', 'heart', 'palpitation', 'shortness of breath',
    'breathless', 'racing heart', 'irregular heartbeat', 'heart attack', 'angina',
    'blood pressure', 'hypertension', 'fainting', 'syncope',
  ],
  Neurologist: [
    'headache', 'migraine', 'seizure', 'dizziness', 'numbness', 'tingling',
    'memory loss', 'confusion', 'tremor', 'stroke', 'paralysis', 'epilepsy',
    'vertigo', 'blurred vision', 'double vision',
  ],
  Pulmonologist: [
    'cough', 'coughing', 'asthma', 'wheezing', 'breathing difficulty', 'breathless',
    'pneumonia', 'bronchitis', 'lung', 'oxygen', 'inhaler', 'phlegm', 'mucus',
  ],
  Gastroenterologist: [
    'stomach pain', 'abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'constipation',
    'bloating', 'acid reflux', 'heartburn', 'indigestion', 'blood in stool',
    'ulcer', 'irritable bowel', 'ibs', 'crohn', 'colitis',
  ],
  Orthopedist: [
    'back pain', 'joint pain', 'knee pain', 'shoulder pain', 'fracture', 'broken bone',
    'sprain', 'muscle pain', 'arthritis', 'hip pain', 'wrist pain', 'neck pain',
    'spine', 'disc', 'mobility', 'swollen joint',
  ],
  Dermatologist: [
    'rash', 'skin', 'acne', 'eczema', 'psoriasis', 'itching', 'hives', 'lesion',
    'mole', 'hair loss', 'nail', 'allergy', 'redness', 'blisters',
  ],
  Psychiatrist: [
    'anxiety', 'depression', 'mental health', 'panic attack', 'stress', 'insomnia',
    'sleep disorder', 'mood', 'bipolar', 'schizophrenia', 'ocd', 'ptsd',
    'suicidal', 'self harm', 'eating disorder',
  ],
  Endocrinologist: [
    'diabetes', 'thyroid', 'weight gain', 'weight loss', 'fatigue', 'hormones',
    'insulin', 'blood sugar', 'metabolic', 'adrenal', 'pituitary',
  ],
  'General Physician': [
    'fever', 'cold', 'flu', 'infection', 'sore throat', 'runny nose', 'body ache',
    'weakness', 'tiredness', 'vaccination', 'checkup', 'routine',
  ],
  Ophthalmologist: [
    'eye pain', 'vision', 'blurred vision', 'red eye', 'dry eyes', 'tearing',
    'cataract', 'glaucoma', 'eye infection', 'glasses', 'contact lens',
  ],
};

const URGENCY_RULES = [
  {
    level: 'CRITICAL',
    score: 1.0,
    keywords: [
      'chest pain', 'heart attack', 'stroke', 'paralysis', 'suicidal',
      'self harm', 'severe bleeding', 'unconscious', 'can\'t breathe',
      'cannot breathe', 'difficulty breathing', 'seizure',
    ],
    reason: 'Symptoms suggest a potentially life-threatening condition requiring immediate medical attention.',
  },
  {
    level: 'HIGH',
    score: 0.85,
    keywords: [
      'severe', 'intense', 'extreme', 'unbearable', 'blood in stool', 'blood in urine',
      'high fever', 'persistent vomiting', 'sudden vision loss', 'sudden numbness',
      'fainting', 'syncope', 'fracture', 'broken',
    ],
    reason: 'Symptoms are severe and require prompt medical evaluation within 24 hours.',
  },
  {
    level: 'MEDIUM',
    score: 0.7,
    keywords: [
      'moderate', 'recurring', 'frequent', 'worsening', 'days', 'weeks',
      'nausea', 'vomiting', 'diarrhea', 'migraine', 'asthma', 'infection',
    ],
    reason: 'Symptoms are moderate and should be evaluated within a few days.',
  },
];

/**
 * Classify urgency from symptom text
 */
function classifyUrgency(text) {
  const lower = text.toLowerCase();

  for (const rule of URGENCY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { level: rule.level, score: rule.score, reason: rule.reason };
    }
  }

  return {
    level: 'LOW',
    score: 0.55,
    reason: 'Symptoms appear mild and can be addressed during a routine appointment.',
  };
}

/**
 * Recommend a specialist based on symptom keywords
 */
function recommendSpecialty(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    const matches = keywords.filter((kw) => lower.includes(kw));
    if (matches.length > 0) {
      scores[specialty] = matches.length;
    }
  }

  if (Object.keys(scores).length === 0) {
    return { specialty: 'General Physician', matchedKeywords: [], confidence: 0.5 };
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestSpecialty, matchCount] = sorted[0];
  const totalKeywords = SPECIALTY_KEYWORDS[bestSpecialty].length;
  const confidence = Math.min(0.95, 0.55 + (matchCount / totalKeywords) * 2);

  return {
    specialty: bestSpecialty,
    matchedKeywords: SPECIALTY_KEYWORDS[bestSpecialty].filter((kw) => lower.includes(kw)),
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Extract structured symptoms from free text
 */
function parseSymptoms(text) {
  const lower = text.toLowerCase();
  const allKeywords = Object.values(SPECIALTY_KEYWORDS).flat();
  const found = [...new Set(allKeywords.filter((kw) => lower.includes(kw)))];

  // Extract duration clues
  const durationMatch = text.match(/(\d+)\s*(day|week|month|hour|year)s?/i);
  const duration = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}${durationMatch[1] > 1 ? 's' : ''}` : null;

  return {
    keywords: found,
    duration,
    summary: found.length > 0
      ? `Patient reports: ${found.slice(0, 4).join(', ')}${duration ? ` for ${duration}` : ''}.`
      : `Patient describes: "${text.slice(0, 80)}..."`,
  };
}

/**
 * Main agent function — processes intake and returns structured result
 * @param {Object} params
 * @param {string} params.symptoms - Free text from patient
 * @param {Object} prisma - Prisma client instance
 */
async function runIntakeAgent({ symptoms, patientId, prisma }) {
  const startTime = Date.now();

  // Step 1: Parse symptoms
  const parsed = parseSymptoms(symptoms);

  // Step 2: Classify urgency
  const urgency = classifyUrgency(symptoms);

  // Step 3: Recommend specialty
  const specialtyResult = recommendSpecialty(symptoms);

  // Step 4: Find available doctors of that specialty
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const availableDoctors = await prisma.doctor.findMany({
    where: {
      specialty: specialtyResult.specialty,
      available: true,
    },
    include: {
      slots: {
        where: {
          isBooked: false,
          date: { gte: todayStr },
        },
        orderBy: { date: 'asc' },
        take: 5,
      },
    },
  });

  // Also search General Physician as fallback
  let fallbackDoctors = [];
  if (availableDoctors.length === 0 || availableDoctors.every((d) => d.slots.length === 0)) {
    fallbackDoctors = await prisma.doctor.findMany({
      where: { specialty: 'General Physician', available: true },
      include: {
        slots: {
          where: { isBooked: false, date: { gte: todayStr } },
          orderBy: { date: 'asc' },
          take: 3,
        },
      },
    });
  }

  const candidateDoctors = [...availableDoctors, ...fallbackDoctors];
  const doctorsWithSlots = candidateDoctors.filter((d) => d.slots.length > 0);

  const processingTimeMs = Date.now() - startTime;

  // Step 5: Decide action
  if (doctorsWithSlots.length === 0) {
    // Log decision
    const log = await prisma.agentLog.create({
      data: {
        patientId: patientId || null,
        rawInput: symptoms,
        parsedSymptoms: JSON.stringify(parsed),
        urgencyLevel: urgency.level,
        urgencyReason: urgency.reason,
        recommendedSpecialty: specialtyResult.specialty,
        confidence: specialtyResult.confidence,
        actionTaken: 'FLAGGED_FOR_REVIEW',
        actionDetails: 'No available slots found. Flagged for manual scheduling.',
        processingTimeMs,
      },
    });

    return {
      success: false,
      action: 'FLAGGED_FOR_REVIEW',
      urgency: urgency.level,
      urgencyReason: urgency.reason,
      recommendedSpecialty: specialtyResult.specialty,
      confidence: specialtyResult.confidence,
      parsedSymptoms: parsed,
      message: 'No available appointments found. A staff member will contact you within 2 hours.',
      agentLogId: log.id,
    };
  }

  // Pick best doctor (first available slot, prefer matching specialty)
  const selectedDoctor = doctorsWithSlots[0];
  const selectedSlot = selectedDoctor.slots[0];

  // Book the slot
  let appointment = null;

  if (patientId) {
    // Update slot
    await prisma.slot.update({
      where: { id: selectedSlot.id },
      data: { isBooked: true },
    });

    // Create appointment
    appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: selectedDoctor.id,
        slotId: selectedSlot.id,
        symptoms,
        urgency: urgency.level,
        agentBooked: true,
        status: 'SCHEDULED',
        notes: parsed.summary,
      },
    });
  }

  // Log decision
  const log = await prisma.agentLog.create({
    data: {
      patientId: patientId || null,
      rawInput: symptoms,
      parsedSymptoms: JSON.stringify(parsed),
      urgencyLevel: urgency.level,
      urgencyReason: urgency.reason,
      recommendedSpecialty: specialtyResult.specialty,
      confidence: specialtyResult.confidence,
      actionTaken: 'BOOKED',
      actionDetails: `Booked with Dr. ${selectedDoctor.name} on ${selectedSlot.date} at ${selectedSlot.startTime}`,
      processingTimeMs,
    },
  });

  if (appointment) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { agentLogId: log.id },
    });
  }

  return {
    success: true,
    action: 'BOOKED',
    urgency: urgency.level,
    urgencyReason: urgency.reason,
    recommendedSpecialty: specialtyResult.specialty,
    confidence: specialtyResult.confidence,
    parsedSymptoms: parsed,
    doctor: {
      id: selectedDoctor.id,
      name: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
    },
    slot: {
      id: selectedSlot.id,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    },
    appointment: appointment ? { id: appointment.id, status: appointment.status } : null,
    agentLogId: log.id,
    processingTimeMs,
  };
}

module.exports = { runIntakeAgent };
