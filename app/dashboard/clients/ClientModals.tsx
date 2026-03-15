"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient, updateClient, deleteClient } from "./actions";

const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  organization: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export default function ClientModals(props) {
  // "add" mode: render AddClientModal
  if (!props.client && !props.actionType) {
    return <AddClientModal />;
  }
  // "edit" mode: render EditClientModal
  if (props.client && props.actionType === "edit") {
    return <EditClientModal client={props.client} />;
  }
  // "delete" mode: render DeleteClientButton
  if (props.client && props.actionType === "delete") {
    return <DeleteClientButton id={props.client.id} clientName={props.client.name} />;
  }
  return null;
}

function AddClientModal() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization: "",
      notes: "",
    },
  });

  function onSubmit(values) {
    const formData = new FormData();
    for (const key in values) formData.append(key, values[key] ?? "");
    startTransition(async () => {
      const res = await createClient(formData);
      if (res?.success) {
        form.reset();
        setOpen(false);
      }
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <input type="text" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input type="email" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="phone"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <input type="text" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="organization"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <input type="text" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditClientModal({ client }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(clientFormSchema),
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
    startTransition(async () => {
      await updateClient(client.id, formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <input type="text" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input type="email" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="phone"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <input type="text" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="organization"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <input type="text" {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea {...field} className="input w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteClientButton({ id, clientName }) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (
      !window.confirm(
        `Are you sure you want to delete client "${clientName}"? This cannot be undone.`
      )
    )
      return;
    startTransition(async () => {
      await deleteClient(id);
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onDelete}
      disabled={pending}
      style={{ marginLeft: 12 }}
    >
      Delete
    </Button>
  );
}