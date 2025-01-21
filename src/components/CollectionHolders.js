import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CollectionHolders() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('holders');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/holders?blockchain=ethereum&time_range=24h&offset=0&limit=30&sort_by=holders&sort_order=desc', options)
      .then(res => res.json())
      .then(data => {
        const collections = data.data;
        setCollections(collections);
        setFilteredCollections(collections);
        displayCollections(collections);
        addFilterOptions();
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    filterAndSortCollections();
  }, [searchTerm, sortOption]);

  function filterAndSortCollections() {
    let filtered = collections.filter(collection =>
      collection.contract_address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortOption === 'holders') {
        return b.holders - a.holders;
      } else if (sortOption === 'holders_change') {
        return b.holders_change - a.holders_change;
      }
      return 0;
    });

    setFilteredCollections(filtered);
    displayCollections(filtered);
  }

  function displayCollections(collections) {
    const container = document.getElementById('collections-container');
    if (!container) {
      console.error('collections-container element not found');
      return;
    }
    container.innerHTML = '';
    collections.forEach(collection => {
      const collectionElement = document.createElement('div');
      collectionElement.className = 'collection bg-gray-800 p-4 rounded-lg shadow-md mb-4';
      collectionElement.innerHTML = `
        <h3 class="text-lg font-semibold text-white">Contract Address: ${collection.contract_address}</h3>
        <p class="text-gray-400">Blockchain: ${collection.blockchain}</p>
        <p class="text-gray-400">Holders: ${collection.holders}</p>
        <p class="text-gray-400">Holders Change: ${collection.holders_change}</p>
        <p class="text-gray-400">Tokens Held by 1 Holder: ${collection.holders_tokens_1}</p>
        <p class="text-gray-400">Tokens Held by 10-15 Holders: ${collection.holders_tokens_10_15}</p>
        <p class="text-gray-400">Tokens Held by 16-25 Holders: ${collection.holders_tokens_16_25}</p>
        <p class="text-gray-400">Tokens Held by 25+ Holders: ${collection.holders_tokens_25plus}</p>
      `;
      container.appendChild(collectionElement);
    });
  }

  function addFilterOptions() {
    const filterContainer = document.getElementById('filter-container');
    if (!filterContainer) {
      console.error('filter-container element not found');
      return;
    }
    filterContainer.innerHTML = `
      <div class="mb-4">
        <label for="search-term" class="block text-sm font-medium text-gray-300">Search:</label>
        <input type="text" id="search-term" value="${searchTerm}" class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      </div>
      <div class="mb-4">
        <label for="sort-option" class="block text-sm font-medium text-gray-300">Sort By:</label>
        <select id="sort-option" class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="holders">Holders</option>
          <option value="holders_change">Holders Change</option>
        </select>
      </div>
      <button id="apply-filters" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Apply Filters</button>
    `;

    document.getElementById('search-term').addEventListener('input', (e) => {
      setSearchTerm(e.target.value);
    });

    document.getElementById('sort-option').addEventListener('change', (e) => {
      setSortOption(e.target.value);
    });

    document.getElementById('apply-filters').addEventListener('click', () => {
      filterAndSortCollections();
    });
  }

  return (
    <div className="collection-holders p-4">
      <button
        onClick={() => navigate('/collectionoverview')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Back to Collection Overview
      </button>
      <div id="filter-container" className="filter-container mb-4"></div>
      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <div id="collections-container" className="collections-container"></div>
      )}
    </div>
  );
}