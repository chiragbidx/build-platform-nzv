"use server";

import { z } from "zod";
import { db } from "@/lib/db/client";
import { projects, clients } from "@/lib/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Input Validation ---
const ProjectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientId: z.string().min(1, "Client is required"),
  status: z.string().default("active"),
  notes: z.string().optional().or(z.literal("")),
});

// --- Create Project ---
export async function createProject(formData: FormData) {
  const session = await getAuthSession();
  if (!session || !session.teamId) throw new Error("Unauthorized");

  const validated = ProjectFormSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    status: formData.get("status") ?? "active",
    notes: formData.get("notes"),
  });
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  // Check that the client belongs to this team.
  const clientRow = await db.select().from(clients).where(
    and(
      eq(clients.id, validated.data.clientId),
      eq(clients.teamId, session.teamId)
    )
  );
  if (!clientRow.length) return { error: { clientId: ["Invalid client."] } };

  await db.insert(projects).values({
    ...validated.data,
    clientId: validated.data.clientId,
    teamId: session.teamId,
  });

  revalidatePath("/dashboard/projects");
  return { success: true };
}

// --- Update Project ---
export async function updateProject(id: string, formData: FormData) {
  const session = await getAuthSession();
  if (!session || !session.teamId) throw new Error("Unauthorized");

  const validated = ProjectFormSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    status: formData.get("status") ?? "active",
    notes: formData.get("notes"),
  });
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  // Check that the client belongs to this team.
  const clientRow = await db.select().from(clients).where(
    and(
      eq(clients.id, validated.data.clientId),
      eq(clients.teamId, session.teamId)
    )
  );
  if (!clientRow.length) return { error: { clientId: ["Invalid client."] } };

  await db.update(projects)
    .set({
      name: validated.data.name,
      clientId: validated.data.clientId,
      status: validated.data.status,
      notes: validated.data.notes ?? "",
    })
    .where(and(eq(projects.id, id), eq(projects.teamId, session.teamId)));

  revalidatePath("/dashboard/projects");
  return { success: true };
}

// --- Delete Project ---
export async function deleteProject(id: string) {
  const session = await getAuthSession();
  if (!session || !session.teamId) throw new Error("Unauthorized");

  await db.delete(projects)
    .where(and(eq(projects.id, id), eq(projects.teamId, session.teamId)));

  revalidatePath("/dashboard/projects");
  return { success: true };
}