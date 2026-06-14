import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "U-001",
    name: "DT. Julia Carranza",
    email: "admin@pharmacare.com",
    avatar: "",
    role: "admin",
  },
  {
    id: "U-002",
    name: "Carlos Mendoza",
    email: "staff@pharmacare.com",
    avatar: "",
    role: "staff",
  },
];

export const mockCredentials = {
  email: "admin@pharmacare.com",
  password: "PharmaCare2026",
};
