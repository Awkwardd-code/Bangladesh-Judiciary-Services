import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { paymentsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const filter: Record<string, unknown> = {};
    const status = params.get("status");
    const method = params.get("method");
    const search = params.get("search")?.trim();
    const from = params.get("from");
    const to = params.get("to");
    if (["pending", "completed", "failed", "refunded"].includes(status ?? ""))
      filter.status = status;
    if (["bkash", "nagad", "bank"].includes(method ?? ""))
      filter.method = method;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { transactionId: { $regex: escaped, $options: "i" } },
        { userName: { $regex: escaped, $options: "i" } },
        { userEmail: { $regex: escaped, $options: "i" } },
      ];
    }
    if (from || to) {
      const paidAt: Record<string, Date> = {};
      if (from) paidAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) paidAt.$lte = new Date(`${to}T23:59:59.999Z`);
      filter.paidAt = paidAt;
    }
    const collection = await paymentsCol();
    const [payments, total, summaryRows] = await Promise.all([
      collection
        .find(filter)
        .sort({ paidAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
      collection
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              amount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
                },
              },
            },
          },
        ])
        .toArray(),
    ]);
    const summary = {
      totalAmount: 0,
      completedCount: 0,
      pendingCount: 0,
      failedCount: 0,
    };
    for (const row of summaryRows) {
      if (row._id === "completed") {
        summary.completedCount = row.count;
        summary.totalAmount = row.amount;
      }
      if (row._id === "pending") summary.pendingCount = row.count;
      if (row._id === "failed") summary.failedCount = row.count;
    }
    return ok({
      payments,
      pagination: buildPaginationMeta({ page, limit }, total),
      summary,
    });
  } catch (error) {
    console.error("List payments error", error);
    return fail("Server error", 500);
  }
}
