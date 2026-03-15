import { db } from "@/lib/db/client";
import { projects, clients } from "@/lib/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from "@/components/ui/table";
import ProjectModals from "./ProjectModals";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ProjectsDashboard() {
  const session = await getAuthSession();
  if (!session || !session.teamId) {
    return <div className="py-10 text-center">You must be signed in to see projects.</div>;
  }

  // Get all clients for the team (for select lists)
  const clientRows = await db
    .select()
    .from(clients)
    .where(eq(clients.teamId, session.teamId))
    .orderBy(desc(clients.createdAt));

  // Fetch all projects for the team, join on client for display
  const projectRows = await db
    .select()
    .from(projects)
    .where(eq(projects.teamId, session.teamId))
    .orderBy(desc(projects.createdAt));

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <ProjectModals clients={clientRows} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                No projects yet.
              </TableCell>
            </TableRow>
          ) : (
            projectRows.map((project) => {
              const client = clientRows.find(c => c.id === project.clientId);
              return (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{client?.name ? client.name : "Unknown"}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>{project.notes ?? "—"}</TableCell>
                  <TableCell>
                    <ProjectModals project={project} clients={clientRows} actionType="edit" />
                    <ProjectModals project={project} clients={clientRows} actionType="delete" />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}