import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import StockChart from '../components/StockChart';

export default function Portfolio({ userId }) {
  const [watchlist, setWatchlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [newTicker, setNewTicker] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);

  async function fetchWatchlist() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist(res.data);
      if (res.data.length > 0) setSelectedSymbol(res.data[0].ticker);
    } catch (err) {
      console.error('Failed to fetch watchlist', err);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function handleSort(key) {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }

  function renderSortArrow(key) {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  }

  async function handleAddStock(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const ticker = newTicker.toUpperCase();
    if (!ticker || !token) return;
    if (newQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    if (watchlist.find((item) => item.ticker === ticker)) {
      alert('Stock already in your watchlist.');
      return;
    }

    try {
      await axios.post(
        '/api/portfolio',
        { ticker, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTicker('');
      setNewQuantity(1);
      await fetchWatchlist();
    } catch (err) {
      console.error('Failed to add stock', err);
    }
  }

  async function handleDeleteStock(ticker) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`/api/portfolio/${ticker}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selectedSymbol === ticker) setSelectedSymbol(null);
      await fetchWatchlist();
    } catch (err) {
      console.error('Failed to delete stock', err);
    }
  }

  const filteredWatchlist = useMemo(() => {
    return watchlist.filter((item) =>
      item.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [watchlist, searchTerm]);

  const sortedWatchlist = useMemo(() => {
    if (!sortConfig.key) return filteredWatchlist;
    return [...filteredWatchlist].sort((a, b) => {
      let aVal, bVal;
      switch (sortConfig.key) {
        case 'stock':
          aVal = a.ticker;
          bVal = b.ticker;
          break;
        case 'price':
          aVal = a.price ?? 0;
          bVal = b.price ?? 0;
          break;
        case 'change':
          aVal = a.changePercent ?? 0;
          bVal = b.changePercent ?? 0;
          break;
        default:
          aVal = '';
          bVal = '';
      }
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
      }
    });
  }, [filteredWatchlist, sortConfig]);

  return (
    <section
      id="portfolio"
      style={{
        minHeight: '100vh',
        padding: '3rem 2rem',
        maxWidth: 1000,
        margin: '0 auto',
        color: 'inherit',
        fontFamily: "'Press Start 2P', cursive",
        animation: 'fade-in 0.7s ease-out forwards',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
      }}
    >
      <h2
        style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          textAlign: 'center',
          color: 'white',
        }}
      >
        Your Watchlist
      </h2>

      <p
        style={{
          fontSize: '1.1rem',
          lineHeight: 1.6,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '2rem',
        }}
      >
        Track real-time prices and performance of your favorite stocks.
      </p>

      <form
        onSubmit={handleAddStock}
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Ticker (e.g. AAPL)"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.8)',
            fontSize: '1rem',
            fontFamily: "'Press Start 2P', cursive",
            textTransform: 'uppercase',
            minWidth: 150,
          }}
          required
        />

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={newQuantity}
          onChange={(e) => setNewQuantity(Number(e.target.value))}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.8)',
            fontSize: '1rem',
            fontFamily: "'Press Start 2P', cursive",
            minWidth: 100,
          }}
          required
        />

        <button
          type="submit"
          style={{
            backgroundColor: '#6d28d9',
            color: 'white',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontFamily: "'Press Start 2P', cursive",
            cursor: 'pointer',
            border: 'none',
            minWidth: 150,
          }}
        >
          Add to Watchlist
        </button>
      </form>

      <input
        type="text"
        placeholder="Search stocks by symbol..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '2px solid rgba(255,255,255,0.8)',
          fontSize: '1rem',
          fontFamily: "'Press Start 2P', cursive",
          marginBottom: '1.5rem',
          boxSizing: 'border-box',
          outline: 'none',
          backgroundColor: 'rgba(255,255,255,0.15)',
          color: 'white',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'white')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.8)')}
      />

      <div
        style={{
          overflowX: 'auto',
          marginBottom: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: 'white',
            fontSize: '0.9rem',
          }}
        >
          <thead>
            <tr>
              {['Stock', 'Price', 'Change', 'Quantity', 'Actions'].map((col) => (
                <th
                  key={col}
                  onClick={col !== 'Actions' ? () => handleSort(col.toLowerCase()) : undefined}
                  style={{
                    cursor: col !== 'Actions' ? 'pointer' : 'default',
                    padding: '1rem',
                    borderBottom: '2px solid white',
                    userSelect: 'none',
                    textAlign: col === 'Actions' ? 'center' : 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col} {col !== 'Actions' && renderSortArrow(col.toLowerCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedWatchlist.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'white' }}>
                  No stocks found.
                </td>
              </tr>
            ) : (
              sortedWatchlist.map((item) => (
                <tr
                  key={item._id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    backgroundColor: selectedSymbol === item.ticker ? 'rgba(255,255,255,0.15)' : 'transparent',
                  }}
                  onClick={() => setSelectedSymbol(item.ticker)}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>{item.ticker}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    ${item.price ? item.price.toFixed(2) : '-'}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      color:
                        item.changePercent > 0 ? '#22c55e' : item.changePercent < 0 ? '#ef4444' : 'inherit',
                    }}
                  >
                    {item.changePercent != null ? `${item.changePercent.toFixed(2)}%` : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStock(item.ticker);
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '0.25rem 0.5rem',
                        fontFamily: "'Press Start 2P', cursive",
                        cursor: 'pointer',
                        border: 'none',
                        fontSize: '0.75rem',
                      }}
                      title={`Delete ${item.ticker}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #c4b5fd)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)',
          color: 'white',
          minHeight: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selectedSymbol ? <StockChart symbol={selectedSymbol} /> : <p>Select a stock to view its chart</p>}
      </div>
    </section>
  );
}