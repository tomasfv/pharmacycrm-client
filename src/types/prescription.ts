export interface PrescriptionMedication {
  medicationId: string;
  medicationName: string;
  quantity: string;
  frequency: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medications: PrescriptionMedication[];
  lastPickupDate: string;
  nextPickupDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
