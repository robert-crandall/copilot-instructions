import { createTRPCRouter } from "@/server/trpc";
import { authRouter } from "./routers/auth";
import { postRouter } from "./routers/post";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
