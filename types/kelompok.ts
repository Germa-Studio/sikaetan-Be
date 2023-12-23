import { User } from "./user";

export type Kelompok = {
  id: number;
  gapoktan: string;
  namaKelompok: string;
  desa: string;
  penyuluh: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  user?: User[];
};

export type KelompokInput = Omit<Kelompok, "id" | "createdAt" | "updatedAt">;
