"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  {
    section: "Vouchers",
    items: [
      { label: "Sales", href: "/vouchers/sales", icon: "📈" },
      { label: "Purchase", href: "/vouchers/purchase", icon: "📦" },
      { label: "Payment", href: "/vouchers/payment", icon: "💸" },
      { label: "Receipt", href: "/vouchers/receipt", icon: "💰" },
    ],
  },
  {
    section: "Inventory",
    items: [{ label: "Items", href: "/inventory/items", icon: "🏷️" }],
  },
  {
    section: "Accounting",
    items: [
      { label: "Ledgers", href: "/ledger", icon: "📒" },
      { label: "Reports", href: "/reports", icon: "📋" },
    ],
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navContent = (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          if ("href" in item) {
            const isActive = pathname === item.href;
            return (
              <Link
                key={i}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          }
          return (
            <div key={i} className="pt-4">
              <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.section}
              </p>
              {item.items.map((subItem, j) => {
                const isActive = pathname.startsWith(subItem.href);
                return (
                  <Link
                    key={j}
                    href={subItem.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    <span>{subItem.icon}</span>
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">Tally Prime v1.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b bg-card flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <h1 className="text-base font-bold tracking-tight">
          <span className="text-primary">Tally</span> Prime
        </h1>
        <div className="w-9" /> {/* Spacer to center the title */}
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Slide-out Sidebar */}
      <aside
        className={`md:hidden fixed top-14 left-0 bottom-0 z-30 w-64 bg-card border-r flex flex-col transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-primary">Tally</span> Prime
          </h1>
        </div>
        {navContent}
      </aside>
    </>
  );
}
