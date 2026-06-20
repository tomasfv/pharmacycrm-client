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
  lastPickupDate: string;
  nextPickupDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
