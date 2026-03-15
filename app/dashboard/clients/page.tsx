import { db } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from "@/components/ui/table";
import { createClient, updateClient, deleteClient } from "./actions";
import { useState } from "react";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";

// --- Server Component, but needs "use client" subcomponents for forms ---

export const dynamic = "force-dynamic";

export default async function ClientsDashboard() {
  // 1. Get auth session, only show clients for the user's current team
  const session = await getAuthSession();
  if (!session) {
    // Next.js will route-guard this, but fallback just in case
    return <div>You must be signed in to see clients.</div>;
  }

  // 2. Fetch clients for the user's team
  const rows = await db
    .select()
    .from(clients)
    .where(clients.teamId.eq(session.teamId))
    .orderBy(clients.createdAt.desc());

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <CreateClientModal />
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
                  <EditClientModal client={client} />
                  <DeleteClientButton id={client.id} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Client subcomponents --- //
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  organization: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

function CreateClientModal() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  function onSubmit(values) {
    const formData = new FormData();
    for (const key in values) formData.append(key, values[key] ?? "");
    start(async () => {
      const res = await createClient(formData);
      if (res?.success) setOpen(false);
      // handle errors and display to user in real use
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <input type="text" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input type="email" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <input type="text" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="organization" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <input type="text" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="notes" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditClientModal({ client }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      organization: client.organization || "",
      notes: client.notes || "",
    },
  });

  function onSubmit(values) {
    const formData = new FormData();
    for (const key in values) formData.append(key, values[key] ?? "");
    start(async () => {
      await updateClient(client.id, formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <input type="text" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input type="email" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <input type="text" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="organization" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <input type="text" {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="notes" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea {...field} className="input w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteClientButton({ id }) {
  const [pending, start] = useTransition();

  function onDelete() {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    start(async () => {
      await deleteClient(id);
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={onDelete} disabled={pending}>
      Delete
    </Button>
  );
}