import { db } from "@/lib/db/client";
import { projects, clients } from "@/lib/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import ProjectModals from "./ProjectModals";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/button";

// For sorting/filtering UI
const STATUS_LABELS = {
  active: { label: "Active", color: "bg-green-200 text-green-800" },
  completed: { label: "Completed", color: "bg-blue-200 text-blue-800" },
  paused: { label: "Paused", color: "bg-yellow-100 text-yellow-900" },
  cancelled: { label: "Cancelled", color: "bg-destructive text-destructive-foreground" },
};

export const dynamic = "force-dynamic";

export default async function ProjectsDashboard() {
  const session = await getAuthSession();
  if (!session || !session.teamId) {
    return (
      <div className="py-10 text-center">
        You must be signed in to see projects.
      </div>
    );
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

  // Build a lookup for quick client name access
  const clientMap = new Map(clientRows.map((c) => [c.id, c]));

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <div className="text-muted-foreground mt-1 text-sm">
            Track client projects, status, and invoices.
          </div>
        </div>
        <div>
          <ProjectModals clients={clientRows} />
        </div>
      </div>

      <div className="mb-6">
        {/* Filter/Grouping could be added here in the future */}
      </div>

      <div className="overflow-x-auto bg-background rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No projects yet.
                </TableCell>
              </TableRow>
            ) : (
              projectRows.map((project) => {
                const client = clientMap.get(project.clientId);
                const status = STATUS_LABELS[project.status] || STATUS_LABELS.active;
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>
                      {client?.name ? (
                        <span>
                          {client.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({client.organization || "No Org"})
                          </span>
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {project.notes ?? "—"}
                    </TableCell>
                    <TableCell>
                      {/* Placeholder for future invoice features */}
                      <Link href="#" className="underline text-sm hover:text-primary">
                        View Invoices
                      </Link>
                    </TableCell>
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
    </div>
  );
}