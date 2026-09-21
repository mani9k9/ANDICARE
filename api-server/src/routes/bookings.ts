import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, bookingsTable } from "@workspace/db";
import {
  CreateBookingBody,
  CreateBookingResponse,
  ListBookingsQueryParams,
  ListBookingsResponse,
  UpdateCustomerBookingBody,
  UpdateCustomerBookingParams,
  UpdateCustomerBookingQueryParams,
  UpdateCustomerBookingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookings", async (req, res): Promise<void> => {
  const parsedQuery = ListBookingsQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.customerKey, parsedQuery.data.customerKey))
    .orderBy(desc(bookingsTable.createdAt));

  res.json(ListBookingsResponse.parse(bookings));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsedBody = CreateBookingBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values(parsedBody.data)
    .onConflictDoUpdate({
      target: bookingsTable.id,
      set: {
        ...parsedBody.data,
        updatedAt: new Date(),
      },
    })
    .returning();

  res.status(201).json(CreateBookingResponse.parse(booking));
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  const parsedParams = UpdateCustomerBookingParams.safeParse(req.params);
  const parsedQuery = UpdateCustomerBookingQueryParams.safeParse(req.query);
  const parsedBody = UpdateCustomerBookingBody.safeParse(req.body);

  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [booking] = await db
    .update(bookingsTable)
    .set({ ...parsedBody.data, updatedAt: new Date() })
    .where(
      and(
        eq(bookingsTable.id, parsedParams.data.id),
        eq(bookingsTable.customerKey, parsedQuery.data.customerKey),
      ),
    )
    .returning();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(UpdateCustomerBookingResponse.parse(booking));
});

export default router;