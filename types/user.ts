import { Request } from "express";
import { Kelompok } from "./kelompok";

export type User = {
  id: number;
  email: string;
  no_wa: string;
  nama: string;
  password: string;
  pekerjaan: string;
  peran: "super admin" | "penyuluh" | "petani" | "admin";
  foto: string;
  accountID: string;
  createdAt: Date;
  updatedAt: Date;

  kelompok?: Kelompok;
};

export type AuthenticatedUser = Request & {
  user?: User;
};
