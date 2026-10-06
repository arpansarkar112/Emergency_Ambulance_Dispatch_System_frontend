"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function UserPaymentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">INV-{2000 + i}</TableCell>
                <TableCell>Oct {i}, 2026</TableCell>
                <TableCell>${150 + i * 10}.00</TableCell>
                <TableCell>
                  <Badge variant={i === 1 ? "secondary" : "default"}>
                    {i === 1 ? "Paid" : "Pending"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
