import type { Property } from '../../../types/property';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsTabProps {
  property: Property;
}

const COLORS = ['#252525', '#8e8e8e', '#10b981', '#f59e0b'];

export function AnalyticsTab({ property }: AnalyticsTabProps) {
  // Mock data for charts
  const occupancyData = [
    { month: 'Jan', occupancy: 30 },
    { month: 'Feb', occupancy: 35 },
    { month: 'Mar', occupancy: 40 },
    { month: 'Apr', occupancy: 33 },
    { month: 'May', occupancy: 38 },
    { month: 'Jun', occupancy: 33 },
  ];

  const viewingData = [
    { month: 'Jan', viewings: 5 },
    { month: 'Feb', viewings: 8 },
    { month: 'Mar', viewings: 12 },
    { month: 'Apr', viewings: 10 },
    { month: 'May', viewings: 15 },
    { month: 'Jun', viewings: 18 },
  ];

  const pipelineData = [
    { name: 'New', value: 1 },
    { name: 'Viewing', value: 1 },
    { name: 'HoTs', value: 1 },
    { name: 'Legals', value: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4">
          <div className="text-xs text-[#8e8e8e] mb-1">Occupancy Rate</div>
          <div className="text-2xl font-semibold text-[#252525]">
            {property.stats?.occupancyPct.toFixed(1) || 0}%
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4">
          <div className="text-xs text-[#8e8e8e] mb-1">Total Units</div>
          <div className="text-2xl font-semibold text-[#252525]">{property.stats?.totalUnits || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4">
          <div className="text-xs text-[#8e8e8e] mb-1">Available</div>
          <div className="text-2xl font-semibold text-[#252525]">{property.stats?.available || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4">
          <div className="text-xs text-[#8e8e8e] mb-1">Under Offer</div>
          <div className="text-2xl font-semibold text-[#252525]">{property.stats?.underOffer || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Occupancy Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={occupancyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="occupancy" stroke="#252525" name="Occupancy %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Viewings</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viewingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="viewings" fill="#252525" name="Viewings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Pipeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pipelineData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pipelineData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

