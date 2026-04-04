import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import {
  SignUpBody,
  LoginBody,
  LoginResponse,
  GetMeResponse,
  LogoutResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "celebfancards_salt_2026").digest("hex");
}

function generateToken(userId: number): string {
  const randomPart = crypto.randomBytes(24).toString("hex");
  return `${userId}.${randomPart}`;
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignUpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fullName, email, username, password } = parsed.data;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const [existingUsername] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existingUsername) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    fullName,
    email,
    username,
    passwordHash,
  }).returning();

  const token = generateToken(user.id);

  const response = {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  };

  res.status(201).json(LoginResponse.parse(response));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const passwordHash = hashPassword(password);

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user || user.passwordHash !== passwordHash) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken(user.id);

  const response = {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  };

  res.json(LoginResponse.parse(response));
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const token = authHeader.slice(7);
  const dotIndex = token.indexOf(".");
  const userId = dotIndex !== -1 ? token.substring(0, dotIndex) : token;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const id = Number(userId);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(GetMeResponse.parse({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  }));
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json(LogoutResponse.parse({ success: true, message: "Logged out successfully" }));
});

export default router;
