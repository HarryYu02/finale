import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient();

export type Session = typeof authClient.$Infer.Session.session;
export type User = typeof authClient.$Infer.Session.user;
