import React, { useState, useEffect } from 'react';

const API_KEY = process.env.REACT_APP_REBRICKABLE_API_KEY;
const API_BASE_URL = 'https://rebrickable.com/api/v3';

function App() {
  const [setNumber, setSetNumber] = useState('');
  const [currentSetNumber, setCurrentSetNumber] = useState('');
  const [setName, setSetName] = useState('');
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkedItems, setCheckedItems] = useState({});

  // Load set from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setIdFromUrl = params.get('set_id');
    if (setIdFromUrl) {
      setSetNumber(setIdFromUrl);
      // Trigger load automatically
      loadSet(setIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load checked counts from localStorage when current set changes
  useEffect(() => {
    if (currentSetNumber) {
      const savedCounts = {};
      parts.forEach((part) => {
        const key = `lego-checklist-${currentSetNumber}-${part.part.part_num}-${part.color.id}`;
        const count = parseInt(localStorage.getItem(key) || '0', 10);
        savedCounts[`${part.part.part_num}-${part.color.id}`] = count;
      });
      setCheckedItems(savedCounts);
    }
  }, [currentSetNumber, parts]);

  const fetchAllParts = async (setNum) => {
    let allParts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${API_BASE_URL}/lego/sets/${setNum}/parts/?page=${page}&page_size=1000`,
        {
          headers: {
            'Authorization': `key ${API_KEY}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Set not found. Please check the set number and try again.');
        }
        throw new Error(`Error fetching parts: ${response.statusText}`);
      }

      const data = await response.json();
      allParts = [...allParts, ...data.results];
      
      // Check if there's a next page
      hasMore = data.next !== null;
      page++;
    }

    return allParts;
  };

  const loadSet = async (setNum) => {
    if (!setNum.trim()) {
      setError('Please enter a set number');
      return;
    }

    setLoading(true);
    setError('');
    setParts([]);
    setCheckedItems({});
    setSetName('');

    try {
      // Auto-append -1 if not already present
      let normalizedSetNum = setNum.trim();
      if (!normalizedSetNum.match(/-\d+$/)) {
        normalizedSetNum = `${normalizedSetNum}-1`;
      }

      // Fetch set details to get the name
      const setResponse = await fetch(
        `${API_BASE_URL}/lego/sets/${normalizedSetNum}/`,
        {
          headers: {
            'Authorization': `key ${API_KEY}`
          }
        }
      );

      if (!setResponse.ok) {
        if (setResponse.status === 404) {
          throw new Error('Set not found. Please check the set number and try again.');
        }
        throw new Error(`Error fetching set details: ${setResponse.statusText}`);
      }

      const setData = await setResponse.json();
      setSetName(setData.name);

      const fetchedParts = await fetchAllParts(normalizedSetNum);
      
      // Check if set has no parts
      if (fetchedParts.length === 0) {
        throw new Error('This set has no parts or is not a valid set number. Please try another set.');
      }
      
      // Group parts by part_num + color_id and sum their quantities
      const groupedPartsMap = new Map();
      fetchedParts.forEach(part => {
        const key = `${part.part.part_num}-${part.color.id}`;
        if (groupedPartsMap.has(key)) {
          // Add to existing part's quantity
          const existing = groupedPartsMap.get(key);
          existing.quantity += part.quantity;
        } else {
          // First occurrence of this part/color combo
          groupedPartsMap.set(key, { ...part });
        }
      });
      
      const groupedParts = Array.from(groupedPartsMap.values());
      
      setParts(groupedParts);
      setCurrentSetNumber(normalizedSetNum);
      
      // Update URL with set_id parameter
      const newUrl = `${window.location.pathname}?set_id=${encodeURIComponent(normalizedSetNum)}`;
      window.history.pushState({}, '', newUrl);
    } catch (err) {
      setError(err.message);
      setCurrentSetNumber('');
      setSetName('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loadSet(setNumber);
  };

  const handleIncrement = (part) => {
    const itemKey = `${part.part.part_num}-${part.color.id}`;
    const storageKey = `lego-checklist-${currentSetNumber}-${part.part.part_num}-${part.color.id}`;
    const currentCount = checkedItems[itemKey] || 0;
    
    if (currentCount < part.quantity) {
      const newCount = currentCount + 1;
      localStorage.setItem(storageKey, newCount.toString());
      setCheckedItems(prev => ({
        ...prev,
        [itemKey]: newCount
      }));
    }
  };

  const handleDecrement = (part) => {
    const itemKey = `${part.part.part_num}-${part.color.id}`;
    const storageKey = `lego-checklist-${currentSetNumber}-${part.part.part_num}-${part.color.id}`;
    const currentCount = checkedItems[itemKey] || 0;
    
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      localStorage.setItem(storageKey, newCount.toString());
      setCheckedItems(prev => ({
        ...prev,
        [itemKey]: newCount
      }));
    }
  };

  const checkedCount = Object.values(checkedItems).reduce((sum, count) => sum + count, 0);
  const totalCount = parts.reduce((sum, part) => sum + part.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">LEGO Set Checklist</h1>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={setNumber}
              onChange={(e) => setSetNumber(e.target.value)}
              placeholder="Enter set number (e.g., 75192-1)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Load Set'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        {currentSetNumber && parts.length > 0 && (
          <div className="sticky top-0 z-10 mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start gap-4 mb-2">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {setName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set {currentSetNumber}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {checkedCount} / {totalCount} parts
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Parts Checklist */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading parts...</p>
          </div>
        )}

        {!loading && parts.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {parts.map((part, index) => {
                const itemKey = `${part.part.part_num}-${part.color.id}`;
                const partCheckedCount = checkedItems[itemKey] || 0;
                const allChecked = partCheckedCount === part.quantity;

                return (
                  <div
                    key={`${part.part.part_num}-${part.color.id}-${index}`}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      allChecked ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Part Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {part.part.part_img_url ? (
                          <img
                            src={part.part.part_img_url}
                            alt={part.part.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </div>

                      {/* Part Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className={`font-medium text-gray-900 ${allChecked ? 'line-through' : ''}`}>
                              {part.part.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Part #{part.part.part_num}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Color: {part.color.name}
                            </p>
                          </div>

                          {/* Add/Remove Buttons */}
                          <div className="flex items-center gap-3 md:ml-4">
                            <button
                              onClick={() => handleDecrement(part)}
                              disabled={partCheckedCount === 0}
                              className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-xl"
                              aria-label="Remove one"
                            >
                              −
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-gray-900">
                                {partCheckedCount}
                              </span>
                              <span className="text-2xl text-gray-400">/</span>
                              <span className="text-2xl font-bold text-gray-900">
                                {part.quantity}
                              </span>
                            </div>
                            <button
                              onClick={() => handleIncrement(part)}
                              disabled={partCheckedCount === part.quantity}
                              className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-xl"
                              aria-label="Add one"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && parts.length === 0 && currentSetNumber === '' && (
          <div className="text-center py-12 text-gray-600">
            <ol className="inline-block text-left space-y-2">
              <li>1. Enter a LEGO set number above</li>
              <li>2. Check off the pieces you've got</li>
              <li>3. Build it</li>
            </ol>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 pb-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            Built by{' '}
            <a
              href="https://www.tomtaylor.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Tom Taylor
            </a>
          </p>
          <p className="mt-2">
            LEGO data provided by the{' '}
            <a
              href="https://rebrickable.com/api/v3/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Rebrickable API
            </a>
            ,{' '}
            <a
              href="https://github.com/tomtaylor/lego-checklist"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              source code available on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

