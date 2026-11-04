import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
  Link,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import "./styles.css";

import { HomePage } from "./routes/Home";
import { BookPage } from "./routes/Book";
import { ManageBookingPage } from "./routes/ManageBooking";
import { Spinner } from "./components/ui";

// Coach-only screens are code-split so visitors never download them.
const CoachLoginPage = lazy(() => import("./routes/CoachLogin").then((m) => ({ default: m.CoachLoginPage })));
const CoachPage = lazy(() => import("./routes/Coach").then((m) => ({ default: m.CoachPage })));

const Fallback = () => (
  <main className="grid min-h-dvh place-items-center">
    <Spinner />
  </main>
);

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ScrollRestoration />
      <Outlet />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: { background: "#1b1b1f", border: "1px solid rgba(245,241,232,0.12)", color: "#f5f1e8" },
        }}
      />
    </>
  ),
  notFoundComponent: () => (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-3 text-[40px]">Page not found</h1>
        <p className="mt-3 text-fog">That page does not exist.</p>
        <Link to="/" className="btn btn-primary mt-8">
          Go to home page
        </Link>
      </div>
    </main>
  ),
});

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });

const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/book",
  component: BookPage,
  validateSearch: (search: Record<string, unknown>): { type?: string } =>
    typeof search.type === "string" && search.type ? { type: search.type } : {},
});

const manageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking/$token",
  component: ManageBookingPage,
});

const coachRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/coach",
  component: () => (
    <Suspense fallback={<Fallback />}>
      <CoachPage />
    </Suspense>
  ),
});
const coachLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/coach/login",
  component: () => (
    <Suspense fallback={<Fallback />}>
      <CoachLoginPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([homeRoute, bookRoute, manageRoute, coachRoute, coachLoginRoute]);

const router = createRouter({ routeTree, scrollRestoration: true, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
