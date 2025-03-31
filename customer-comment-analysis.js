import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useDataContext } from './DataContext';

const CustomerCommentAnalysis = () => {
  const { data, isLoading, error } = useDataContext();
  
  // Colors from design spec
  const colors = {
    primary: '#db0032', // Novo Nordisk Red
    secondary: '#0066a4', // Complementary Blue
    tertiary: '#00a0af', // Teal Accent
    success: '#00843d', // Green
    warning: '#ffc72c', // Amber
    danger: '#c8102e', // Alert Red
    neutral: '#6c757d' // Light Text
  };
  
  // Sentiment display
  const getSentimentDisplay = (sentiment) => {
    if (sentiment <= -0.4) return { text: 'Very Negative', color: colors.danger };
    if (sentiment <= -0.1) return { text: 'Negative', color: '#e57373' };
    if (sentiment <= 0.1) return { text: 'Neutral', color: colors.neutral };
    if (sentiment <= 0.4) return { text: 'Positive', color: '#81c784' };
    return { text: 'Very Positive', color: colors.success };
  };
  
  // Customer Comment Distribution Chart
  const CommentDistributionChart = () => {
    if (!data?.externalRFT?.issueCategories || data.externalRFT.issueCategories.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No issue categories data available</div>;
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.externalRFT.issueCategories}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.externalRFT.issueCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors.chartColors ? colors.chartColors[index % 5] : colors.tertiary} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Sentiment Analysis Chart
  const SentimentAnalysisChart = () => {
    if (!data?.externalRFT?.customerComments || data.externalRFT.customerComments.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No customer comment data available</div>;
    }
    
    // Sort data by sentiment
    const sortedData = [...data.externalRFT.customerComments].sort((a, b) => a.sentiment - b.sentiment);
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
            layout="vertical"
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[-0.6, 0.6]} 
              tickCount={7} 
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis 
              dataKey="category" 
              type="category"
              width={100}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}`, 'Sentiment Score']}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar 
              dataKey="sentiment" 
              name="Sentiment Score"
            >
              {sortedData.map((entry, index) => {
                const sentimentInfo = getSentimentDisplay(entry.sentiment);
                return <Cell key={`cell-${index}`} fill={sentimentInfo.color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Correlation Chart
  const CorrelationChart = () => {
    if (!data?.externalRFT?.correlationData || data.externalRFT.correlationData.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No correlation data available</div>;
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.externalRFT.correlationData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[85, 96]} />
            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="internalRFT" 
              name="Internal RFT %" 
              stroke={colors.primary} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="externalRFT" 
              name="External RFT %" 
              stroke={colors.secondary} 
            />
          </LineChart>
        </ResponsiveContainer>
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
            <select className="border rounded-md px-3 py-1 text-sm">
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select className="border rounded-md px-3 py-1 text-sm">
              <option>All Categories</option>
              <option>Documentation</option>
              <option>Quality</option>
              <option>Delivery</option>
              <option>Packaging</option>
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
  
  // Top Comment Categories Table
  const TopCommentCategories = () => {
    if (!data?.externalRFT?.customerComments || data.externalRFT.customerComments.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No customer comment data available</div>;
    }
    
    // Sort by count
    const sortedComments = [...data.externalRFT.customerComments].sort((a, b) => b.count - a.count);
    
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Count
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sentiment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedComments.map((comment, index) => {
            const sentimentInfo = getSentimentDisplay(comment.sentiment);
            
            return (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {comment.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comment.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span 
                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    style={{ backgroundColor: `${sentimentInfo.color}30`, color: sentimentInfo.color }}
                  >
                    {sentimentInfo.text}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comment.trend || 'Stable'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
  
  // Summary statistics
  const CommentSummary = () => {
    if (!data?.externalRFT?.customerComments || data.externalRFT.customerComments.length === 0) {
      return <div className="p-4 bg-gray-50 rounded">No customer comment data available</div>;
    }
    
    const totalComments = data.externalRFT.customerComments.reduce((sum, item) => sum + item.count, 0);
    const avgSentiment = data.externalRFT.customerComments.reduce((sum, item) => sum + (item.sentiment * item.count), 0) / totalComments;
    const avgSentimentText = getSentimentDisplay(avgSentiment).text;
    
    const topNegativeCategory = [...data.externalRFT.customerComments]
      .sort((a, b) => a.sentiment - b.sentiment)[0]?.category || 'None';
    
    const topPositiveCategory = [...data.externalRFT.customerComments]
      .sort((a, b) => b.sentiment - a.sentiment)[0]?.category || 'None';
    
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Comment Summary</h3>
          <p className="text-sm text-gray-600 mb-1">Total Comments: <span className="font-semibold">{totalComments}</span></p>
          <p className="text-sm text-gray-600 mb-1">Average Sentiment: <span className="font-semibold">{avgSentimentText} ({avgSentiment.toFixed(2)})</span></p>
          <p className="text-sm text-gray-600 mb-1">Top Negative Category: <span className="font-semibold">{topNegativeCategory}</span></p>
          <p className="text-sm text-gray-600">Top Positive Category: <span className="font-semibold">{topPositiveCategory}</span></p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Insights</h3>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            <li>Documentation concerns represent the highest volume of comments</li>
            <li>Quality concerns have the most negative sentiment</li>
            <li>There's a strong correlation between internal and external RFT rates</li>
          </ul>
        </div>
      </div>
    );
  };
  
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-dashed rounded-full border-blue-500"></div>
        <p className="text-gray-600">Loading customer comment analysis...</p>
      </div>
    );
  }
  
  if (error || !data.externalRFT) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center py-8">
        <div className="mx-auto mb-4 w-12 h-12 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-600 mb-2">No External RFT Data</h3>
        <p className="text-gray-600">{error || "There is no external RFT data available in the dataset"}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Customer Comment Analysis</h2>
        <p className="text-gray-500 text-sm">Analysis of customer feedback and external RFT metrics</p>
      </div>
      
      <FilterControls />
      
      <CommentSummary />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Comment Distribution by Category</h3>
          <CommentDistributionChart />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Sentiment Analysis by Category</h3>
          <SentimentAnalysisChart />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold mb-2">Internal vs External RFT Correlation</h3>
        <CorrelationChart />
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Top Comment Categories</h3>
        <div className="overflow-x-auto">
          <TopCommentCategories />
        </div>
      </div>
    </div>
  );
};

export default CustomerCommentAnalysis; 