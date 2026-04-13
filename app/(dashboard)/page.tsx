export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="text-lg font-medium text-gray-500">Total Sales</h3>
          <p className="text-3xl font-bold mt-2">₹0.00</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="text-lg font-medium text-gray-500">Outstanding Receivables</h3>
          <p className="text-3xl font-bold mt-2">₹0.00</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="text-lg font-medium text-gray-500">Low Stock Items</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}
