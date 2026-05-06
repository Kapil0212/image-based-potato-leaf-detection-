import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-mono font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Specimen Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route is outside the Agri-Lab database.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Agri-Lab — Potato Leaf Disease Detection" },
      {
        name: "description",
        content:
          "AI-powered potato leaf disease detection using MobileNetV2 + CBAM. Upload a leaf image to identify disease, severity, and treatment.",
      },
      { property: "og:title", content: "Agri-Lab — Potato Leaf Disease Detection" },
      {
        property: "og:description",
        content: "Automated potato pathogen identification with 91.4% validated precision.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Agri-Lab — Potato Leaf Disease Detection" },
      { name: "description", content: "Potato Leaf ID identifies potato plant diseases from leaf images." },
      { property: "og:description", content: "Potato Leaf ID identifies potato plant diseases from leaf images." },
      { name: "twitter:description", content: "Potato Leaf ID identifies potato plant diseases from leaf images." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7b50c8fb-413a-47c7-b00a-3440358a8d3b/id-preview-ad46ca93--c231e126-e119-4ba2-a7f9-1c4b3374a1b5.lovable.app-1777547703949.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7b50c8fb-413a-47c7-b00a-3440358a8d3b/id-preview-ad46ca93--c231e126-e119-4ba2-a7f9-1c4b3374a1b5.lovable.app-1777547703949.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
