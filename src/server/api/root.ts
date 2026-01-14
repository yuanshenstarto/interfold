import { postRouter } from "~/server/api/routers/post";
import { atomicSetRouter } from "~/server/api/routers/atomicSet";
import { intersectionRouter } from "~/server/api/routers/intersection";
import { outlineRouter } from "~/server/api/routers/outline";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  atomicSet: atomicSetRouter,
  intersection: intersectionRouter,
  outline: outlineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
