import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop header */}
        <header className="hidden md:flex h-16 border-b items-center justify-between px-6 bg-card shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Content area — add top padding on mobile for the fixed header */}
        <div className="p-4 md:p-6 flex-1 overflow-auto pt-18 md:pt-6">{children}</div>
      </main>
    </div>
  );
}
