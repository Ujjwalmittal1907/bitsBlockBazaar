import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { FuturisticLoader } from './shared';
import { useTheme } from '../context/ThemeContext';

const NftMarketplaceAnalytics = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [graphType, setGraphType] = useState('bar');
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    const fetchAnalytics = async () => {
      try {
        const response = await fetch('https://api.unleashnfts.com/api/v2/nft/marketplace/analytics?blockchain=ethereum&time_range=24h&sort_by=name&sort_order=desc&offset=0&limit=30', options);
        const data = await response.json();
        setData(data.data);
        setFilteredData(data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    let filtered = data;
    if (blockchainFilter) {
      filtered = filtered.filter(item => item.blockchain === blockchainFilter);
    }
    if (nameFilter) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (suggestionFilter) {
      filtered = filtered.filter(item => getSuggestion(item).text === suggestionFilter);
    }
    setFilteredData(filtered);
  }, [blockchainFilter, nameFilter, suggestionFilter, data]);

  const getSuggestion = (item) => {
    if (item.sales_change > 50) {
      return { text: "High sales activity, consider monitoring closely.", color: "text-red-500" };
    } else if (item.sales_change > 20) {
      return { text: "Moderate sales activity, potential for growth.", color: "text-yellow-500" };
    } else if (item.sales_change < 0) {
      return { text: "Declining sales activity, exercise caution.", color: "text-blue-500" };
    } else {
      return { text: "Stable sales activity.", color: "text-green-500" };
    }
  };

  const normalizeData = (data) => {
    const max = Math.max(...data);
    return data.map(value => (value / max) * 100);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: 'white',
          font: {
            size: 16,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        ticks: {
          color: 'white',
          font: {
            size: 16,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 18,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
  };

  const chartData = {
    labels: filteredData.map(item => item.name),
    datasets: [
      {
        label: 'Sales',
        data: normalizeData(filteredData.map(item => item.sales)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Transactions',
        data: normalizeData(filteredData.map(item => item.transactions)),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Transfers',
        data: normalizeData(filteredData.map(item => item.transfers)),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
      {
        label: 'Volume',
        data: normalizeData(filteredData.map(item => item.volume)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const renderChart = () => {
    switch (graphType) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Marketplace Analytics..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className={`text-4xl font-bold mb-6 text-center text-blue-400`}>NFT Marketplace Analytics</h1>
      <div className="mb-6 relative h-96">
        {renderChart()}
      </div>
      <div className="mb-4 flex justify-between">
        <div className="w-1/4 pr-2">
          <label className="block mb-2">Filter by Blockchain:</label>
          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={blockchainFilter}
            onChange={(e) => setBlockchainFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="avalanche">Avalanche</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>
        <div className="w-1/4 px-2">
          <label className="block mb-2">Filter by Name:</label>
          <input
            type="text"
            className="bg-gray-800 p-2 rounded w-full"
            placeholder="Enter name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="w-1/4 pl-2">
          <label className="block mb-2">Filter by Suggestion:</label>
          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={suggestionFilter}
            onChange={(e) => setSuggestionFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="High sales activity, consider monitoring closely.">High sales activity</option>
            <option value="Moderate sales activity, potential for growth.">Moderate sales activity</option>
            <option value="Declining sales activity, exercise caution.">Declining sales activity</option>
            <option value="Stable sales activity.">Stable sales activity</option>
          </select>
        </div>
        <div className="w-1/4 pl-2">
          <label className="block mb-2">Select Graph Type:</label>
          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={graphType}
            onChange={(e) => setGraphType(e.target.value)}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, index) => {
          const suggestion = getSuggestion(item);
          return (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
              <h2 className="text-xl font-bold mb-2 text-white">{item.name}</h2>
              <p className="text-gray-400">Blockchain: {item.blockchain}</p>
              <p className="text-gray-400">Sales: {item.sales}</p>
              <p className="text-gray-400">Sales Change: {item.sales_change ? item.sales_change.toFixed(2) + '%' : 'N/A'}</p>
              <p className="text-gray-400">Transactions: {item.transactions}</p>
              <p className="text-gray-400">Transfers: {item.transfers}</p>
              <p className="text-gray-400">Volume: {item.volume}</p>
              <p className={`text-gray-400 ${suggestion.color}`}>Suggestion: {suggestion.text}</p>
              {item.url && (
                <p className="text-gray-400">
                  URL: <a href={item.url} className="text-blue-400" target="_blank" rel="noopener noreferrer">{item.url}</a>
                </p>
              )}
              {item.thumbnail_url && (
                <img src={item.thumbnail_url} alt={item.name} className="mt-4 rounded" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NftMarketplaceAnalytics;