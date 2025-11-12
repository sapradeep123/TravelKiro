export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-secondary">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="text-xs text-success font-semibold">+12%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">1,234</h3>
          <p className="text-sm text-secondary">Total Locations</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-success font-semibold">+8%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">456</h3>
          <p className="text-sm text-secondary">Active Events</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xs text-success font-semibold">+15%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">89</h3>
          <p className="text-sm text-secondary">Tour Packages</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs text-error font-semibold">-3%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">12.5K</h3>
          <p className="text-sm text-secondary">Community Members</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-600">JD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">John Doe added a new location</p>
                  <p className="text-xs text-secondary mt-1">Taj Mahal, Agra • 2 hours ago</p>
                </div>
                <span className="text-xs text-success bg-success-100 px-2 py-1 rounded-full">New</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors">
              Add Location
            </button>
            <button className="w-full btn bg-surface border border-border py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Create Event
            </button>
            <button className="w-full btn bg-surface border border-border py-3 rounded-lg hover:bg-gray-100 transition-colors">
              New Package
            </button>
            <button className="w-full btn bg-surface border border-border py-3 rounded-lg hover:bg-gray-100 transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <span className="text-xs bg-warning-100 text-warning-700 px-3 py-1 rounded-full font-semibold">
            5 Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">Submitted By</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Location', title: 'Gateway of India', user: 'Tourist Guide', date: '2 hours ago' },
                { type: 'Event', title: 'Diwali Festival', user: 'Govt Dept', date: '5 hours ago' },
                { type: 'Package', title: 'Golden Triangle Tour', user: 'Travel Agent', date: '1 day ago' },
              ].map((item, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="py-3 px-4">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{item.title}</td>
                  <td className="py-3 px-4 text-sm text-secondary">{item.user}</td>
                  <td className="py-3 px-4 text-sm text-secondary">{item.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-success hover:text-success-600 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button className="text-error hover:text-error-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
