import { api, unwrap, tokenStore } from './client'
import type {
  ApiEnvelope, AuthResponse, CurrentUser, DrugResponse,
  InteractionCheckResponse, ReminderResponse, DoctorResponse,
  PagedResponse, AdminInteraction, ProfessionalDetails, VerificationStatus,
  ConsultationResponse, DrugInteractionSummary, AiExplainResponse, InteractionHistory,
  AdminDashboard, AdminUser, AppointmentResponse,
} from './types'

/* ---------------- Auth ---------------- */
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const auth = await unwrap(api.post<ApiEnvelope<AuthResponse>>('/auth/login', { email, password }))
    tokenStore.set(auth)
    return auth
  },
  async register(
    name: string, email: string, password: string, role: string,
    professional?: ProfessionalDetails,
  ): Promise<AuthResponse> {
    const auth = await unwrap(api.post<ApiEnvelope<AuthResponse>>('/auth/register', {
      name, email, password, role, ...(professional ?? {}),
    }))
    tokenStore.set(auth)
    return auth
  },
  me(): Promise<CurrentUser> {
    return unwrap(api.get<ApiEnvelope<CurrentUser>>('/auth/me'))
  },
  async logout(): Promise<void> {
    try { await api.post('/auth/logout') } finally { tokenStore.clear() }
  },
}

/* ---------------- Drugs ---------------- */
export const drugApi = {
  list(): Promise<DrugResponse[]> {
    return unwrap(api.get<ApiEnvelope<DrugResponse[]>>('/drugs'))
  },
  get(id: string): Promise<DrugResponse> {
    return unwrap(api.get<ApiEnvelope<DrugResponse>>(`/drugs/${id}`))
  },
  search(q: string): Promise<DrugResponse[]> {
    return unwrap(api.get<ApiEnvelope<DrugResponse[]>>('/drugs/search', { params: { keyword: q } }))
  },
}

/* ---------------- Interactions ---------------- */
export const interactionApi = {
  check(drugIds: string[]): Promise<InteractionCheckResponse> {
    return unwrap(api.post<ApiEnvelope<InteractionCheckResponse>>('/interactions/check', { drugIds }))
  },
  forDrug(drugId: string, limit = 50): Promise<DrugInteractionSummary[]> {
    return unwrap(api.get<ApiEnvelope<DrugInteractionSummary[]>>(`/interactions/for-drug/${drugId}`, {
      params: { limit },
    }))
  },
  history(): Promise<InteractionHistory[]> {
    return unwrap(api.get<ApiEnvelope<InteractionHistory[]>>('/interactions/history'))
  },
}

/* ---------------- Reminders ---------------- */
export const reminderApi = {
  list(): Promise<ReminderResponse[]> {
    return unwrap(api.get<ApiEnvelope<ReminderResponse[]>>('/reminders'))
  },
}

/* ---------------- Doctors ---------------- */
export const doctorApi = {
  list(): Promise<DoctorResponse[]> {
    return unwrap(api.get<ApiEnvelope<DoctorResponse[]>>('/doctors'))
  },
  verified(): Promise<DoctorResponse[]> {
    return unwrap(api.get<ApiEnvelope<DoctorResponse[]>>('/doctors/verified'))
  },
  search(keyword: string): Promise<DoctorResponse[]> {
    return unwrap(api.get<ApiEnvelope<DoctorResponse[]>>('/doctors/search', { params: { keyword } }))
  },
  // The signed-in professional's own verification application/status.
  myApplication(): Promise<DoctorResponse> {
    return unwrap(api.get<ApiEnvelope<DoctorResponse>>('/doctors/me'))
  },
}

/* ---------------- AI assistant ---------------- */
export const aiApi = {
  explain(content: string, context?: string): Promise<AiExplainResponse> {
    return unwrap(api.post<ApiEnvelope<AiExplainResponse>>('/ai/explain', { content, context }))
  },
}

/* ---------------- Appointments ---------------- */
export const appointmentApi = {
  mine(): Promise<AppointmentResponse[]> {
    return unwrap(api.get<ApiEnvelope<AppointmentResponse[]>>('/appointments'))
  },
  forDoctor(): Promise<AppointmentResponse[]> {
    return unwrap(api.get<ApiEnvelope<AppointmentResponse[]>>('/appointments/doctor'))
  },
}

/* ---------------- Tele-consultations (video/audio calls) ---------------- */
export const consultationApi = {
  // Patient starts a call with a doctor (pass doctorId), or a doctor with a patient (pass patientId).
  create(body: { doctorId?: string; patientId?: string; appointmentId?: string; callType?: 'VIDEO' | 'AUDIO' }): Promise<ConsultationResponse> {
    return unwrap(api.post<ApiEnvelope<ConsultationResponse>>('/consultations', body))
  },
  mine(): Promise<ConsultationResponse[]> {
    return unwrap(api.get<ApiEnvelope<ConsultationResponse[]>>('/consultations/mine'))
  },
  get(id: string): Promise<ConsultationResponse> {
    return unwrap(api.get<ApiEnvelope<ConsultationResponse>>(`/consultations/${id}`))
  },
  join(id: string): Promise<ConsultationResponse> {
    return unwrap(api.post<ApiEnvelope<ConsultationResponse>>(`/consultations/${id}/join`))
  },
  end(id: string): Promise<ConsultationResponse> {
    return unwrap(api.post<ApiEnvelope<ConsultationResponse>>(`/consultations/${id}/end`))
  },
}

/* ---------------- Admin ---------------- */
export const adminApi = {
  dashboard(): Promise<AdminDashboard> {
    return unwrap(api.get<ApiEnvelope<AdminDashboard>>('/admin/reports/dashboard'))
  },
  listUsers(): Promise<AdminUser[]> {
    return unwrap(api.get<ApiEnvelope<AdminUser[]>>('/admin/users'))
  },
  setUserStatus(id: string, active: boolean): Promise<AdminUser> {
    return unwrap(api.patch<ApiEnvelope<AdminUser>>(`/admin/users/${id}/status`, null, { params: { active } }))
  },
  deleteUser(id: string): Promise<null> {
    return unwrap(api.delete<ApiEnvelope<null>>(`/admin/users/${id}`))
  },
  listDrugs(): Promise<DrugResponse[]> {
    return unwrap(api.get<ApiEnvelope<DrugResponse[]>>('/admin/drugs'))
  },
  deleteDrug(id: string): Promise<null> {
    return unwrap(api.delete<ApiEnvelope<null>>(`/admin/drugs/${id}`))
  },

  listInteractions(query: string, page: number, size = 20): Promise<PagedResponse<AdminInteraction>> {
    return unwrap(api.get<ApiEnvelope<PagedResponse<AdminInteraction>>>('/admin/interactions', {
      params: { query: query || undefined, page, size },
    }))
  },
  createInteraction(body: { drugAId: string; drugBId: string; severity: string; description?: string; recommendation?: string }): Promise<AdminInteraction> {
    return unwrap(api.post<ApiEnvelope<AdminInteraction>>('/admin/interactions', body))
  },
  deleteInteraction(id: string): Promise<null> {
    return unwrap(api.delete<ApiEnvelope<null>>(`/admin/interactions/${id}`))
  },

  /* Doctor verification queue */
  listDoctors(status?: VerificationStatus): Promise<DoctorResponse[]> {
    return unwrap(api.get<ApiEnvelope<DoctorResponse[]>>('/admin/doctors', {
      params: { status: status || undefined },
    }))
  },
  decideDoctor(id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string): Promise<DoctorResponse> {
    return unwrap(api.patch<ApiEnvelope<DoctorResponse>>(`/admin/doctors/${id}/verification`, {
      status, rejectionReason,
    }))
  },
}
