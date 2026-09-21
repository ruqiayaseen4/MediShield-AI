import type { DoctorConsultationRequest, DoctorConsultationResponse } from './types.js';

const DEFAULT_DISCLAIMER =
  'MediShield AI Doctor Assistant provides instant informational guidance based on pharmacological standards and safety guidelines. It is NOT a substitute for in-person emergency care or official diagnosis. If experiencing severe symptoms (difficulty breathing, chest pain, swelling), call 911 / your local emergency service immediately.';

export async function consultDoctor(
  request: DoctorConsultationRequest
): Promise<DoctorConsultationResponse> {
  const queryLower = request.userQuery.toLowerCase();
  const medName = request.medicineName || 'the specified medication';
  const harmfulReason = request.harmfulReason || '';
  const interactionDetails = request.interactionDetails || '';
  const addictionRisk = request.addictionRisk || '';

  // Determine urgency level
  let urgencyLevel: 'normal' | 'caution' | 'emergency' = 'normal';

  if (
    queryLower.includes('chest pain') ||
    queryLower.includes('can\'t breathe') ||
    queryLower.includes('breathing difficulty') ||
    queryLower.includes('anaphylaxis') ||
    queryLower.includes('passed out') ||
    queryLower.includes('overdose') ||
    queryLower.includes('seizure')
  ) {
    urgencyLevel = 'emergency';
  } else if (
    harmfulReason.includes('suspicious') ||
    harmfulReason.includes('fake') ||
    harmfulReason.includes('counterfeit') ||
    interactionDetails.includes('severe') ||
    addictionRisk.includes('high') ||
    queryLower.includes('side effect') ||
    queryLower.includes('harmful') ||
    queryLower.includes('danger')
  ) {
    urgencyLevel = 'caution';
  }

  // Generate structured response
  let reply = '';
  const suggestedActions: string[] = [];

  if (urgencyLevel === 'emergency') {
    reply = `🚨 **EMERGENCY NOTICE**: You mentioned symptoms or situations that could indicate an immediate medical emergency related to ${medName}. Please seek immediate emergency medical care or call your local emergency services (911). Do not take any further doses of this medication until evaluated by an emergency physician.`;
    suggestedActions.push(
      'Call Emergency Services (911 or local emergency number)',
      'Stop taking the medication immediately',
      'Keep the medication packaging ready for emergency responders'
    );
  } else if (harmfulReason || interactionDetails || addictionRisk) {
    reply = `Hello! I am your MediShield Online AI Doctor Assistant. I see you are consulting about **${medName}**, which was flagged due to: ${
      harmfulReason ? `\n• **Flagged Warning**: ${harmfulReason}` : ''
    }${interactionDetails ? `\n• **Interaction Alert**: ${interactionDetails}` : ''}${
      addictionRisk ? `\n• **Dependency Risk**: ${addictionRisk}` : ''
    }\n\n**Medical Guidance:**\n1. **Do Not Ingest Unverified Doses**: If this medicine is flagged as suspicious or counterfeit, refrain from taking it. Counterfeit drugs can contain incorrect active ingredients, toxic contaminants, or improper dosages.\n2. **Drug Interaction Precaution**: If this medication interacts severely with another drug in your regime, taking them together can cause adverse cardiovascular, neurological, or metabolic complications.\n3. **What You Should Do Next**: Bring the bottle/packaging to your prescribing doctor or a licensed pharmacist. They can check the lot number with the manufacturer or replace it with a verified batch.`;

    suggestedActions.push(
      'Consult your prescribing doctor or pharmacist before taking',
      'Verify package lot number directly with manufacturer',
      'Report suspected counterfeit drugs to local FDA / health authority',
      'Check for safe alternative medications'
    );
  } else {
    // General consultation
    reply = `Hello! I am your MediShield Online AI Doctor Assistant. Regarding **${medName}** and your question ("*${request.userQuery}*"):\n\n**Key Health Considerations:**\n• **Safety & Dosing**: Always adhere strictly to the prescription instructions provided by your healthcare provider.\n• **Side Effects & Monitoring**: Common mild side effects can occur, but sudden rash, dizziness, shortness of breath, or gastrointestinal distress require medical review.\n• **Food & Supplement Interactions**: Avoid taking medications with unverified herbal supplements or alcohol unless approved by your physician.\n\nHow else can I assist you with your medications today?`;

    suggestedActions.push(
      'Check drug interactions with your other active medicines',
      'Search official FDA packaging guidelines',
      'Consult a pharmacist for dosage schedule adjustment'
    );
  }

  return {
    reply,
    medicalDisclaimer: DEFAULT_DISCLAIMER,
    urgencyLevel,
    suggestedActions,
  };
}
