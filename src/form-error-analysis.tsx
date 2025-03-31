import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDataContext } from './DataContextProvider';

const FormErrorAnalysis = () => {
  // Get data from context
  const { data, isLoading } = useDataContext();
  
  // Use form error data from context or fallback to empty array
  const [formErrorData, setFormErrorData] = useState([]);
  
  // Monthly trend data (we'll generate this from the form error data)
  const [trendData, setTrendData] = useState([]);
  
  // Update component when data changes
  useEffect(() => {
    if (data?.internalRFT?.formErrors) {
      setFormErrorData(data.internalRFT.formErrors);
      
      // Generate trend data for top 3 form types
      const topForms = data.internalRFT.formErrors.slice(0, 3).map(form => form.name);
      
      // Create monthly trend data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const generatedTrendData = months.map(month => {
        const monthData = { month };
        
        // Add data for each top form
        topForms.forEach(form => {
          // Generate some random data that trends appropriately based on the form's trend
          const formInfo = data.internalRFT.formErrors.find(f => f.name === form);
          const baseTrend = formInfo?.trend || 'flat';
          
          // Get base value
          let baseValue = formInfo?.errors || 10;
          baseValue = Math.max(5, Math.min(30, baseValue)); // Limit between 5-30
          
          // Apply trend factor
          const monthIndex = months.indexOf(month);
          let trendFactor = 0;
          
          if (baseTrend === 'up') {
            trendFactor = monthIndex * 0.1; // Increasing trend
          } else if (baseTrend === 'down') {
            trendFactor = -monthIndex * 0.1; // Decreasing trend
          }
          
          // Add some randomness
          const randomFactor = (Math.random() * 0.2) - 0.1;
          
          // Calculate final value
          const value = Math.round(baseValue * (1 + trendFactor + randomFactor));
          
          // Add to month data
          monthData[form] = value;
        });
        
        return monthData;
      });
      
      setTrendData(generatedTrendData);
    }
  }, [data]);
  
  // Filter options
  const [timeFilter, setTimeFilter] = useState('6m');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Colors from Novo Nordisk spec
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    neutral: '#6c757d' // Light Text
  };
  
  // Bar chart with error counts by form type
  const FormErrorBarChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formErrorData}
            margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
            barSize={36}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Error Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip 
              formatter={(value, name) => [value, 'Errors']}
              labelFormatter={(label) => `Form: ${label}`}
            />
            <Bar 
              dataKey="errors" 
              fill={colors.primary}
              radius={[4, 4, 0, 0]}
            >
              {formErrorData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.trend === 'up' ? colors.danger : entry.trend === 'down' ? colors.success : colors.primary}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Line chart showing trends over time
  const FormErrorTrendChart = () => {
    // Only show top 3 forms in trend chart to avoid clutter
    const topForms = formErrorData.slice(0, 3).map(form => form.name);
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              label={{ value: 'Error Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip />
            <Legend />
            {topForms.map((form, index) => (
              <Line
                key={form}
                type="monotone"
                dataKey={form}
                stroke={index === 0 ? colors.primary : index === 1 ? colors.secondary : colors.tertiary}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Summary statistics
  const FormErrorSummary = () => {
    // Calculate total errors
    const totalErrors = formErrorData.reduce((sum, item) => sum + item.errors, 0);
    
    // Calculate month-over-month change
    const currentMonth = trendData[trendData.length - 1];
    const previousMonth = trendData[trendData.length - 2];
    
    const totalCurrentMonth = topForms.reduce((sum, form) => sum + (currentMonth[form] || 0), 0);
    const totalPreviousMonth = topForms.reduce((sum, form) => sum + (previousMonth[form] || 0), 0);
    
    const monthlyChange = ((totalCurrentMonth - totalPreviousMonth) / totalPreviousMonth * 100).toFixed(1);
    const changeIsPositive = totalCurrentMonth > totalPreviousMonth;
    
    // Get top problem forms
    const topProblemForms = formErrorData.slice(0, 3).map(item => item.name).join(', ');
    
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Error Summary</h3>
          <p className="text-sm text-gray-600 mb-1">Total Form Errors: <span className="font-semibold">{totalErrors}</span></p>
          <p className="text-sm text-gray-600 mb-1">Top Problem Forms: <span className="font-semibold">{topProblemForms}</span></p>
          <p className="text-sm text-gray-600">
            Month-over-Month Change: 
            <span className={`font-semibold ml-1 ${changeIsPositive ? 'text-red-500' : 'text-green-500'}`}>
              {changeIsPositive ? '+' : ''}{monthlyChange}%
            </span>
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Insights</h3>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            <li>Production records show a concerning upward trend (+14%)</li>
            <li>Batch release errors have decreased consistently (-20%)</li>
            <li>Most errors occur during morning shift (65%)</li>
          </ul>
        </div>
      </div>
    );
  };
  
  // Filter controls
  const FilterControls = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Time Period</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Department</label>
            <select 
              className="border rounded-md px-3 py-1 text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="production">Production</option>
              <option value="qc">Quality Control</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>
        </div>
        
        <div>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm mr-2">
            Export Data
          </button>
          <button className="px-3 py-1 bg-gray-100 rounded-md text-sm">
            View Details
          </button>
        </div>
      </div>
    );
  };
  
  // Top Forms by Error
  const topForms = formErrorData.slice(0, 3).map(form => form.name);
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Form Error Analysis</h2>
        <p className="text-sm text-gray-600">Detailed breakdown of documentation errors by form type</p>
      </div>
      
      <FilterControls />
      <FormErrorSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Form Error Distribution</h3>
          <FormErrorBarChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Error Trends Over Time</h3>
          <p className="text-sm text-gray-500 mb-2">Showing trends for top 3 forms with errors</p>
          <FormErrorTrendChart />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Error Details</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Type</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Count</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formErrorData.map((form, index) => (
              <tr key={form.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.errors}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.percentage}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    form.trend === 'up' 
                      ? 'bg-red-100 text-red-800' 
                      : form.trend === 'down' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {form.trend === 'up' 
                      ? '↑ Increasing' 
                      : form.trend === 'down' 
                        ? '↓ Decreasing' 
                        : '→ Stable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormErrorAnalysis;
