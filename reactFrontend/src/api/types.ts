// Shapes mirrored from the Spring REST API DTOs.

export type ApiEnvelope<T> = { success: boolean; message: string; data: T }

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  email: string
  name: string
  role: string
}

export type CurrentUser = {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
}

export type DrugResponse = {
  id: string
  genericName: string
  brandName: string
  manufacturerName: string
  description: string
  uses: string
  dosageForm: string
  dosage: string
  sideEffects: string
  contraindications: string
  pregnancySafety: string
  storage: string
  imageUrl: string
  categoryName: string
  createdAt: string
}

export type InteractionDetail = {
  drugA: string
  drugB: string
  severity: string
  description: string
  recommendation: string
}

export type InteractionCheckResponse = {
  highestSeverity: string
  interactions: InteractionDetail[]
  aiExplanation: string
}

export type DrugInteractionSummary = {
  otherDrugId: string
  otherDrugName: string
  severity: string
}

export type AiExplainResponse = {
  explanation: string
  recommendation: string | null
  warnings: string | null
}

export type InteractionHistory = {
  id: string
  drugIds: string
  resultSummary: string
  highestSeverity: string
  checkedAt: string
}

export type AdminDashboard = {
  totalUsers: number
  activeUsers: number
  totalDrugs: number
  totalInteractions: number
  totalAppointments: number
  totalAiRequests: number
  dailyRequests: Record<string, number>
  monthlyRequests: Record<string, number>
}

export type AdminUser = {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  isLocked: boolean
  createdAt: string
}

export type AppointmentResponse = {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  doctorSpecialization: string
  appointmentDate: string
  status: string
  reason: string | null
  notes: string | null
  consultationFee: number | null
  createdAt: string
}

export type ReminderResponse = {
  id: string
  drugId: string
  drugName: string
  reminderTime: string
  frequency: string
  dosage: string
  startDate: string
  endDate: string
  notificationEnabled: boolean
  isActive: boolean
  createdAt: string
}

export type PagedResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type AdminInteraction = {
  id: string
  drugAId: string
  drugAName: string
  drugBId: string
  drugBName: string
  severity: string
  description: string
  recommendation: string
  createdAt: string
}

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type DoctorResponse = {
  id: string
  fullName: string
  specialization: string
  licenseNumber: string
  hospital: string
  experienceYears: number
  consultationFee: number
  bio: string
  verified: boolean
  verificationStatus: VerificationStatus
  rejectionReason: string | null
  available: boolean
  profileImage: string
}

// Extra fields a healthcare professional supplies at sign-up.
export type ProfessionalDetails = {
  specialization: string
  licenseNumber: string
  hospital?: string
  experienceYears?: number
}

export type IceServer = { urls: string[]; username?: string | null; credential?: string | null }

export type ConsultationResponse = {
  id: string
  roomCode: string
  callType: 'VIDEO' | 'AUDIO'
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  self_isDoctor: boolean
  signalingUrl: string
  iceServers: IceServer[]
}
