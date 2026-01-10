import { useState } from 'react';
import { FileText, TrendingUp, Users, Clock, DollarSign, Download } from 'lucide-react';
import type { PackageBreakdown } from '../../../../types/index.ts';
import './Report.css';

// Mock data
const mockStats = {
  totalRevenue: 156000,
  revenueChange: 12.5,
  totalMembers: 324,
  membersChange: 8.3,
  totalCheckIns: 4250,
  checkInsChange: 15.2,
  peakHours: '5PM - 8PM',
  avgSessionDuration: '1.5 hrs'
};

const mockPackageBreakdown: PackageBreakdown[] = [
  { packageName: 'Premium PT Package', memberCount: 85, percentage: 26, revenue: 42500, color: '#6F00D0' },
  { packageName: 'Standard PT Package', memberCount: 72, percentage: 22, revenue: 28800, color: '#1A1363' },
  { packageName: 'Basic Package', memberCount: 98, percentage: 30, revenue: 19600, color: '#00D026' },
  { packageName: 'No PT Package', memberCount: 69, percentage: 21, revenue: 13800, color: '#E7B900' }
];

const mockRecentTransactions = [
  { id: 'P-00123', member: 'Johnny Sins', type: 'Contract Renewal', amount: 300, date: '2026-01-15', status: 'completed' },
  { id: 'P-00122', member: 'Maria Garcia', type: 'PT Session', amount: 50, date: '2026-01-15', status: 'completed' },
  { id: 'P-00121', member: 'James Wilson', type: 'Additional Service', amount: 25, date: '2026-01-14', status: 'pending' },
  { id: 'P-00120', member: 'Emma Davis', type: 'Contract Renewal', amount: 150, date: '2026-01-14', status: 'completed' },
  { id: 'P-00119', member: 'Michael Brown', type: 'Additional Service', amount: 15, date: '2026-01-14', status: 'completed' }
];

const mockCheckInData = [
  { day: 'Mon', count: 145 },
  { day: 'Tue', count: 132 },
  { day: 'Wed', count: 158 },
  { day: 'Thu', count: 147 },
  { day: 'Fri', count: 189 },
  { day: 'Sat', count: 210 },
  { day: 'Sun', count: 165 }
];

function Report() {
  const [dateRange, setDateRange] = useState('this-month');

  const handleExportPDF = () => {
    console.log('Exporting PDF report...');
    alert('Exporting PDF report...');
  };

  const maxCheckIn = Math.max(...mockCheckInData.map(d => d.count));
  const totalPackageMembers = mockPackageBreakdown.reduce((sum, p) => sum + p.memberCount, 0);

  return (
    <div className="report">
      <div className="report__header">
        <div>
          <h1 className="report__title">Reports & Analytics</h1>
          <p className="report__subtitle">Track performance and insights</p>
        </div>
        <div className="report__header-actions">
          <select 
            className="report__date-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
          </select>
          <button className="report__export-btn" onClick={handleExportPDF}>
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="report__stats">
        <div className="report__stat-card">
          <div className="report__stat-icon report__stat-icon--green">
            <DollarSign size={24} />
          </div>
          <div className="report__stat-content">
            <span className="report__stat-label">Total Revenue</span>
            <span className="report__stat-value">${mockStats.totalRevenue.toLocaleString()}</span>
            <span className="report__stat-change report__stat-change--positive">
              <TrendingUp size={14} />
              +{mockStats.revenueChange}%
            </span>
          </div>
        </div>

        <div className="report__stat-card">
          <div className="report__stat-icon report__stat-icon--blue">
            <Users size={24} />
          </div>
          <div className="report__stat-content">
            <span className="report__stat-label">Total Members</span>
            <span className="report__stat-value">{mockStats.totalMembers}</span>
            <span className="report__stat-change report__stat-change--positive">
              <TrendingUp size={14} />
              +{mockStats.membersChange}%
            </span>
          </div>
        </div>

        <div className="report__stat-card">
          <div className="report__stat-icon report__stat-icon--purple">
            <FileText size={24} />
          </div>
          <div className="report__stat-content">
            <span className="report__stat-label">Total Check-ins</span>
            <span className="report__stat-value">{mockStats.totalCheckIns.toLocaleString()}</span>
            <span className="report__stat-change report__stat-change--positive">
              <TrendingUp size={14} />
              +{mockStats.checkInsChange}%
            </span>
          </div>
        </div>

        <div className="report__stat-card">
          <div className="report__stat-icon report__stat-icon--yellow">
            <Clock size={24} />
          </div>
          <div className="report__stat-content">
            <span className="report__stat-label">Peak Hours</span>
            <span className="report__stat-value">{mockStats.peakHours}</span>
            <span className="report__stat-sub">Avg: {mockStats.avgSessionDuration}</span>
          </div>
        </div>
      </div>

      <div className="report__grid">
        {/* Package Breakdown */}
        <div className="report__card">
          <div className="report__card-header">
            <h2 className="report__card-title">Membership Package Breakdown</h2>
            <span className="report__card-subtitle">Distribution of active members</span>
          </div>
          <div className="report__package-breakdown">
            <div className="report__package-chart">
              <div className="report__donut-container">
                <div className="report__donut">
                  <div className="report__donut-center">
                    <span className="report__donut-value">{totalPackageMembers}</span>
                    <span className="report__donut-label">Total Members</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="report__package-list">
              {mockPackageBreakdown.map((pkg, idx) => (
                <div key={idx} className="report__package-item">
                  <div className="report__package-info">
                    <span 
                      className="report__package-dot" 
                      style={{ backgroundColor: pkg.color }}
                    />
                    <span className="report__package-name">{pkg.packageName}</span>
                  </div>
                  <div className="report__package-stats">
                    <span className="report__package-members">{pkg.memberCount} members</span>
                    <span className="report__package-percent">{pkg.percentage}%</span>
                  </div>
                  <div className="report__package-bar">
                    <div 
                      className="report__package-bar-fill"
                      style={{ width: `${pkg.percentage}%`, backgroundColor: pkg.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Check-in Chart */}
        <div className="report__card">
          <div className="report__card-header">
            <h2 className="report__card-title">Weekly Check-ins</h2>
            <span className="report__card-subtitle">Check-in activity this week</span>
          </div>
          <div className="report__checkin-chart">
            {mockCheckInData.map((item, idx) => (
              <div key={idx} className="report__checkin-bar">
                <div className="report__checkin-bar-container">
                  <div 
                    className="report__checkin-bar-fill"
                    style={{ height: `${(item.count / maxCheckIn) * 100}%` }}
                  />
                </div>
                <span className="report__checkin-count">{item.count}</span>
                <span className="report__checkin-day">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="report__card report__card--full">
        <div className="report__card-header">
          <h2 className="report__card-title">Recent Transactions</h2>
          <button className="report__view-all">View All</button>
        </div>
        <table className="report__table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Member</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockRecentTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.member}</td>
                <td>{tx.type}</td>
                <td className="report__table-amount">${tx.amount}</td>
                <td>{tx.date}</td>
                <td>
                  <span className={`report__status report__status--${tx.status}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revenue Summary */}
      <div className="report__card report__card--full">
        <div className="report__card-header">
          <h2 className="report__card-title">Revenue by Package Type</h2>
          <span className="report__card-subtitle">Monthly revenue breakdown</span>
        </div>
        <div className="report__revenue-bars">
          {mockPackageBreakdown.map((pkg, idx) => (
            <div key={idx} className="report__revenue-item">
              <div className="report__revenue-info">
                <span 
                  className="report__package-dot" 
                  style={{ backgroundColor: pkg.color }}
                />
                <span className="report__revenue-name">{pkg.packageName}</span>
              </div>
              <div className="report__revenue-bar-container">
                <div 
                  className="report__revenue-bar"
                  style={{ 
                    width: `${(pkg.revenue / mockStats.totalRevenue) * 100}%`,
                    backgroundColor: pkg.color 
                  }}
                />
              </div>
              <span className="report__revenue-amount">${pkg.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Report;
