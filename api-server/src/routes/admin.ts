import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  AdminLoginBody,
  AdminLoginResponse,
  GetAdminSessionResponse,
  ListAdminBookingsQueryParams,
  ListAdminBookingsResponse,
  UpdateAdminBookingBody,
  UpdateAdminBookingParams,
  UpdateAdminBookingResponse,
} from "@workspace/api-zod";
import { db, bookingsTable } from "@workspace/db";
import {
  createAdminSession,
  hasAdminSession,
  removeAdminSession,
} from "../lib/admin-session";

const router: IRouter = Router();
const ADMIN_COOKIE = "andicare_admin_session";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@andicare.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "andicare-admin";

function isAdmin(req: Parameters<Parameters<IRouter["get"]>[1]>[0]): boolean {
  return hasAdminSession(req.cookies?.[ADMIN_COOKIE]);
}

function requireAdmin(
  req: Parameters<Parameters<IRouter["get"]>[1]>[0],
  res: Parameters<Parameters<IRouter["get"]>[1]>[1],
): boolean {
  if (isAdmin(req)) return true;
  res.status(401).json({ error: "Admin authentication required" });
  return false;
}

router.post("/admin/login", (req, res): void => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (
    !parsed.success ||
    parsed.data.email !== ADMIN_EMAIL ||
    parsed.data.password !== ADMIN_PASSWORD
  ) {
    res.status(401).json({ error: "Invalid admin credentials" });
    return;
  }

  res.cookie(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8,
  });
  res.json(AdminLoginResponse.parse({ authenticated: true, email: ADMIN_EMAIL }));
});

router.post("/admin/logout", (req, res): void => {
  removeAdminSession(req.cookies?.[ADMIN_COOKIE]);
  res.clearCookie(ADMIN_COOKIE);
  res.sendStatus(204);
});

router.get("/admin/session", (req, res): void => {
  const authenticated = isAdmin(req);
  res.json(
    GetAdminSessionResponse.parse({
      authenticated,
      email: authenticated ? ADMIN_EMAIL : null,
    }),
  );
});

router.get("/admin/bookings", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const parsedQuery = ListAdminBookingsQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt));
  const query = parsedQuery.data.q?.trim().toLowerCase();
  const filtered = bookings.filter((booking) => {
    const matchesStatus =
      !parsedQuery.data.status || booking.status === parsedQuery.data.status;
    const haystack = [
      booking.id,
      booking.customerName,
      booking.customerPhone,
      booking.title,
      booking.area,
      booking.address,
    ]
      .join(" ")
      .toLowerCase();
    return matchesStatus && (!query || haystack.includes(query));
  });

  res.json(ListAdminBookingsResponse.parse(filtered));
});

router.patch("/admin/bookings/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const parsedParams = UpdateAdminBookingParams.safeParse(req.params);
  const parsedBody = UpdateAdminBookingBody.safeParse(req.body);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [booking] = await db
    .update(bookingsTable)
    .set({ ...parsedBody.data, updatedAt: new Date() })
    .where(eq(bookingsTable.id, parsedParams.data.id))
    .returning();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(UpdateAdminBookingResponse.parse(booking));
});

export default router;