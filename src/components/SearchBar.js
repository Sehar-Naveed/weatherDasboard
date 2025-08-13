import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input) onSearch(input);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter city name"
        style={{ padding: '10px', fontSize: '16px', border: '2px solid #5498a2', borderRadius: '5px', color: '#808080', marginRight: '10px' }}
      />
      <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', background: '#5498a2', color: 'white', border: 'none', borderRadius: '5px' }}>Search</button>
    </form>
  );
};

export default SearchBar;
