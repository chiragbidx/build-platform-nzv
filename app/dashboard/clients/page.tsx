import { db } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from "@/components/ui/table";
import ClientModals from "./ClientModals";

// FORCE DYNAMIC (runtime data)
export const dynamic = "force-dynamic";

export default async function ClientsDashboard() {
  const session = await getAuthSession();
  if (!session) {
    return <div className="py-10 text-center">You must be signed in to see clients.</div>;
  }

  // Fetch clients for the current team
  const rows = await db
    .select()
    .from(clients)
    .where(clients.teamId.eq(session.teamId))
    .orderBy(clients.createdAt.desc());

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        {/* Pass list of clients to modal component for controlled rerender */}
        <ClientModals clients={rows} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                No clients yet.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email ?? "—"}</TableCell>
                <TableCell>{client.phone ?? "—"}</TableCell>
                <TableCell>{client.organization ?? "—"}</TableCell>
                <TableCell>
                  <ClientModals client={client} actionType="edit" />
                  <ClientModals client={client} actionType="delete" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}