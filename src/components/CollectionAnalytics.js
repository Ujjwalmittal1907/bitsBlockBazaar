import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FuturisticLoader, FuturisticCard } from './shared';

const CollectionAnalytics = () => {
  const [data, setData] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState('sales');
  const [highlightedCollection, setHighlightedCollection] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/analytics?blockchain=ethereum&offset=0&limit=30&sort_by=sales&time_range=24h&sort_order=desc', options)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const filterDataByDate = (data) => {
    return data.filter(item => {
      const itemDate = new Date(item.updated_at);
      return itemDate >= startDate && itemDate <= endDate;
    });
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
    onClick: (event, elements) => {
      if (elements.length > 0 && elements[0].datasetIndex !== undefined) {
        const datasetIndex = elements[0].datasetIndex;
        const chart = elements[0].chart;
        if (chart && chart.data && chart.data.datasets[datasetIndex]) {
          const label = chart.data.datasets[datasetIndex].label;
          setHighlightedCollection(label);
        }
      }
    },
  };

  const filteredData = data ? filterDataByDate(data) : [];

  const highlightData = (dataset) => {
    return dataset.map(item => ({
      ...item,
      backgroundColor: item.label === highlightedCollection ? 'rgba(255, 99, 132, 0.6)' : item.backgroundColor,
      borderColor: item.label === highlightedCollection ? 'rgba(255, 99, 132, 1)' : item.borderColor,
    }));
  };

  // Predefined color palette for charts
  const colorPalette = [
    { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' }, // Blue
    { bg: 'rgba(16, 185, 129, 0.6)', border: 'rgba(16, 185, 129, 1)' }, // Green
    { bg: 'rgba(139, 92, 246, 0.6)', border: 'rgba(139, 92, 246, 1)' }, // Purple
    { bg: 'rgba(245, 158, 11, 0.6)', border: 'rgba(245, 158, 11, 1)' }, // Orange
    { bg: 'rgba(239, 68, 68, 0.6)', border: 'rgba(239, 68, 68, 1)' },   // Red
    { bg: 'rgba(236, 72, 153, 0.6)', border: 'rgba(236, 72, 153, 1)' }  // Pink
  ];

  const getColor = (index) => colorPalette[index % colorPalette.length];

  const salesData = {
    labels: filteredData.map(item => item.collection || item.contract_address),
    datasets: highlightData([
      {
        label: 'Sales',
        data: filteredData.map(item => item.sales || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ]),
  };

  const volumeData = {
    labels: filteredData.map(item => item.collection || item.contract_address),
    datasets: highlightData([
      {
        label: 'Volume',
        data: filteredData.map(item => item.volume || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ]),
  };

  const pieData = {
    labels: filteredData.map(item => item.collection || item.contract_address),
    datasets: highlightData([
      {
        label: 'Assets',
        data: filteredData.map(item => item.assets || 0),
        backgroundColor: filteredData.map((_, index) => getColor(index).bg),
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      },
    ]),
  };

  const lineData = {
    labels: filteredData.length > 0 ? filteredData[0].block_dates : [],
    datasets: highlightData(filteredData
      .filter(item => selectedCollections.includes(item.collection || item.contract_address))
      .map((item, index) => {
        const color = getColor(index);
        return {
          label: item.collection || item.contract_address,
          data: item.sales_trend,
          fill: false,
          backgroundColor: color.bg,
          borderColor: color.border,
          tension: 0.4,
        };
      })),
  };

  const renderGraph = () => {
    switch (selectedGraph) {
      case 'sales':
        return <Bar data={salesData} options={chartOptions} />;
      case 'volume':
        return <Bar data={volumeData} options={chartOptions} />;
      case 'assets':
        return <Pie data={pieData} options={chartOptions} />;
      case 'trend':
        return <div className="relative h-96"><Line data={lineData} options={chartOptions} /></div>;
      default:
        return null;
    }
  };

  const collectionOptions = filteredData.map(item => ({
    value: item.collection || item.contract_address,
    label: item.collection || item.contract_address,
  }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#2d3748',
      color: 'white',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#2d3748',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#4a5568' : '#2d3748',
      color: 'white',
      '&:hover': {
        backgroundColor: '#4a5568',
      },
    }),
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Collection Analytics..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <BackButton />
      <button onClick={() => navigate('/collectionoverview')} className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Collection Overview
      </button>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Collection Analytics</h1>
      <div className="mb-6 text-center">
        <select
          className="p-2 bg-gray-800 text-white rounded"
          value={selectedGraph}
          onChange={(e) => setSelectedGraph(e.target.value)}
        >
          <option value="sales">Sales</option>
          <option value="volume">Volume</option>
          <option value="assets">Assets</option>
          <option value="trend">Sales Trend</option>
        </select>
      </div>
      {selectedGraph === 'trend' && (
        <div className="mb-6 text-center">
          <Select
            isMulti
            options={collectionOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            styles={customStyles}
            onChange={(selectedOptions) => setSelectedCollections(selectedOptions.map(option => option.value))}
          />
        </div>
      )}
      <div className="mb-6 text-center">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="p-2 bg-gray-800 text-white rounded"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          className="p-2 bg-gray-800 text-white rounded ml-2"
        />
      </div>
      {data ? (
        <div className="relative w-full h-screen bg-gray-800 p-4 rounded-lg shadow-lg">
          {renderGraph()}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CollectionAnalytics;