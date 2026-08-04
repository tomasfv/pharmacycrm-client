export interface OrderMedication {
  medicationId: string;
  medicationName: string;
  quantity: string;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  medications: OrderMedication[];
  lastPickupDate: string | null;
  nextPickupDate: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
