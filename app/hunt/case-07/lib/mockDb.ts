export interface MockTransmission {
  id: string
  name: string
  email: string
  sector: string
  stageId: number
  answer: string
  recoveryKey: string
  isVerified: boolean
  sentAt: Date
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
  resendCount: number
  lastResentAt: Date | null
  deliveryStatus?: string | null
  deliveryError?: string | null
}

// In-memory global store to share across local API endpoints during mock/demo mode
const globalRef = global as unknown as {
  mockTransmissions: Map<string, MockTransmission>
}

if (!globalRef.mockTransmissions) {
  globalRef.mockTransmissions = new Map()
}

export const mockTransmissions = globalRef.mockTransmissions
