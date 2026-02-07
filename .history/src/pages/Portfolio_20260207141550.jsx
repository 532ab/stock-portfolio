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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchWatchlist() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    console.log('Auth Check:', { token: !!token, userId: !!userId });
    
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    if (!userId) {
      setError('No user ID found. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get('/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Watchlist fetched:', res.data);
      setWatchlist(res.data);
      if (res.data.length > 0) setSelectedSymbol(res.data[0].ticker);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err.response || err);
      setError(`Error fetching portfolio: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
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
    
    if (!ticker) {
      setError('Please enter a ticker symbol');
      return;
    }
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }
    if (newQuantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (watchlist.find((item) => item.ticker === ticker)) {
      setError('Stock already in your watchlist.');
      return;
    }

    try {
      setError(null);
      console.log('Adding stock:', ticker, newQuantity);
      const res = await axios.post(
        '/api/portfolio',
        { ticker, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Stock added:', res.data);
      setNewTicker('');
      setNewQuantity(1);
      await fetchWatchlist();
    } catch (err) {
      console.error('Failed to add stock:', err.response || err);
      setError(`Error adding stock: ${err.response?.data?.error || err.message}`);
    }
  }

  async function handleDeleteStock(ticker) {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      setError(null);
      await axios.delete(`/api/portfolio/${ticker}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selectedSymbol === ticker) setSelectedSymbol(null);
      await fetchWatchlist();
    } catch (err) {
      console.error('Failed to delete stock:', err.response || err);
      setError(`Error deleting stock: ${err.response?.data?.error || err.message}`);
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

  // Calculate portfolio totals
  const portfolioTotals = useMemo(() => {
    const totals = {
      totalValue: 0,
      totalCostBasis: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
    };

    watchlist.forEach((stock) => {
      totals.totalValue += stock.totalValue || 0;
      totals.totalCostBasis += stock.costBasis || 0;
      totals.totalGainLoss += stock.gainLoss || 0;
    });

    totals.totalGainLossPercent = totals.totalCostBasis > 0 
      ? (totals.totalGainLoss / totals.totalCostBasis) * 100 
      : 0;

    return totals;
  }, [watchlist]);

  return (
    <section
      id="portfolio"
      style={{
        minHeight: '100vh',
        padding: '2rem 1rem',
        maxWidth: 1200,
        margin: '0 auto',
        color: 'inherit',
      }}
    >
      {/* Not Logged In Banner */}
      {!localStorage.getItem('token') && (
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: '#bfdbfe',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: '1rem' }}>
            You need to be logged in to access your portfolio.
          </p>
          <a 
            href="/login" 
            style={{ 
              color: '#60a5fa', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </a>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#fecaca',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#bfdbfe',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Loading portfolio...
        </div>
      )}

      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            color: 'white',
            fontWeight: '600',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Portfolio
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Track and manage your stock holdings
        </p>
      </div>

      {/* Portfolio Summary Card */}
      {watchlist.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            {/* Total Portfolio Value */}
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                Total Portfolio Value
              </p>
              <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#FFFFFF' }}>
                ${portfolioTotals.totalValue.toFixed(2)}
              </p>
            </div>

            {/* Total Cost Basis */}
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                Total Cost Basis
              </p>
              <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#9CA3AF' }}>
                ${portfolioTotals.totalCostBasis.toFixed(2)}
              </p>
            </div>

            {/* Total Gain/Loss */}
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                Total Gain/Loss
              </p>
              <p style={{
                margin: '0',
                fontSize: '28px',
                fontWeight: '700',
                color: portfolioTotals.totalGainLoss >= 0 ? '#10B981' : '#EF4444',
              }}>
                {portfolioTotals.totalGainLoss >= 0 ? '+' : ''}{portfolioTotals.totalGainLoss.toFixed(2)}
              </p>
            </div>

            {/* Overall Return % */}
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                Overall Return
              </p>
              <p style={{
                margin: '0',
                fontSize: '28px',
                fontWeight: '700',
                color: portfolioTotals.totalGainLossPercent >= 0 ? '#10B981' : '#EF4444',
              }}>
                {portfolioTotals.totalGainLossPercent >= 0 ? '+' : ''}{portfolioTotals.totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Form */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
        }}
      >
        <form
          onSubmit={handleAddStock}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Ticker (e.g. AAPL)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontSize: '1rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: 'white',
              textTransform: 'uppercase',
              minWidth: 140,
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
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
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontSize: '1rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: 'white',
              minWidth: 100,
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            required
          />

          <button
            type="submit"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              fontSize: '1rem',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#059669')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#10b981')}
          >
            + Add Stock
          </button>
        </form>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by ticker..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          fontSize: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
          marginBottom: '2rem',
          boxSizing: 'border-box',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      />

      {/* Watchlist Table */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: 'white',
            fontSize: '0.95rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
              {['Stock', 'Price', 'Change', 'Quantity', 'Total Value', 'Actions'].map((col) => (
                <th
                  key={col}
                  onClick={col !== 'Actions' && col !== 'Total Value' ? () => handleSort(col.toLowerCase()) : undefined}
                  style={{
                    cursor: col !== 'Actions' && col !== 'Total Value' ? 'pointer' : 'default',
                    padding: '1.2rem 1rem',
                    textAlign: col === 'Actions' ? 'center' : 'left',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    userSelect: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {col} {col !== 'Actions' && col !== 'Total Value' && renderSortArrow(col.toLowerCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedWatchlist.length === 0 ? (
              <tr>
                <td 
                  colSpan="6" 
                  style={{ 
                    padding: '2rem 1rem', 
                    textAlign: 'center', 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontStyle: 'italic',
                  }}
                >
                  No stocks in your portfolio
                </td>
              </tr>
            ) : (
              sortedWatchlist.map((item) => (
                <tr
                  key={item._id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    backgroundColor: selectedSymbol === item.ticker ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    transition: 'background-color 0.2s',
                    height: '60px',
                  }}
                  onClick={() => setSelectedSymbol(item.ticker)}
                  onMouseEnter={(e) => {
                    if (selectedSymbol !== item.ticker) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSymbol !== item.ticker) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '1.1rem' }}>
                    {item.ticker}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    ${item.price ? item.price.toFixed(2) : '-'}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      color:
                        item.changePercent > 0 
                          ? '#10b981' 
                          : item.changePercent < 0 
                          ? '#ef4444' 
                          : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {item.changePercent != null 
                      ? `${item.changePercent > 0 ? '+' : ''}${item.changePercent.toFixed(2)}%` 
                      : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>
                    ${item.totalValue ? item.totalValue.toFixed(2) : '0.00'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStock(item.ticker);
                      }}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        cursor: 'pointer',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.4)';
                        e.target.style.color = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        e.target.style.color = '#fca5a5';
                      }}
                      title={`Delete ${item.ticker}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Chart Section */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minHeight: 450,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selectedSymbol ? (
          <>
            <h3
              style={{
                color: 'white',
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                alignSelf: 'flex-start',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '600',
              }}
            >
              {selectedSymbol} - Price Chart
            </h3>
            <StockChart symbol={selectedSymbol} />
          </>
        ) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Select a stock to view its chart
          </p>
        )}
      </div>
    </section>
  );
}