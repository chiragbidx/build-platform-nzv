"use server";

import { z } from "zod";
import { db } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Input validation ---
const ClientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  organization: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// --- Create Client ---
export async function createClient(formData: FormData) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const validated = ClientFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    organization: formData.get("organization"),
    notes: formData.get("notes"),
  });
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  await db.insert(clients).values({
    ...validated.data,
    teamId: session.teamId,
  });

  revalidatePath("/dashboard/clients");
  return { success: true };
}

// --- Update Client ---
export async function updateClient(id: string, formData: FormData) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const validated = ClientFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    organization: formData.get("organization"),
    notes: formData.get("notes"),
  });
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  await db.update(clients)
    .set({ ...validated.data })
    .where(and(eq(clients.id, id), eq(clients.teamId, session.teamId)));

  revalidatePath("/dashboard/clients");
  return { success: true };
}

// --- Delete Client ---
export async function deleteClient(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  await db.delete(clients)
    .where(and(eq(clients.id, id), eq(clients.teamId, session.teamId)));

  revalidatePath("/dashboard/clients");
  return { success: true };
}