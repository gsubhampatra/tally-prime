import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider">TALLY PRIME</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="block p-2 rounded hover:bg-slate-800">Dashboard</Link>
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vouchers</div>
          <Link href="/vouchers/sales" className="block p-2 rounded hover:bg-slate-800">Sales</Link>
          <Link href="/vouchers/purchase" className="block p-2 rounded hover:bg-slate-800">Purchase</Link>
          <Link href="/vouchers/payment" className="block p-2 rounded hover:bg-slate-800">Payment</Link>
          <Link href="/vouchers/receipt" className="block p-2 rounded hover:bg-slate-800">Receipt</Link>
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory</div>
          <Link href="/inventory/items" className="block p-2 rounded hover:bg-slate-800">Items</Link>
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Accounting</div>
          <Link href="/ledger" className="block p-2 rounded hover:bg-slate-800">Ledgers</Link>
          <Link href="/reports" className="block p-2 rounded hover:bg-slate-800">Reports</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-6">
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm font-medium">Admin User</span>
          </div>
        </header>
        <div className="p-6 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
