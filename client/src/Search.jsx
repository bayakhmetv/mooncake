import React, { useState } from "react";
import axios from "axios";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null); // Для отображения ошибок

  const handleSearch = async () => {
    setError(null); // Сброс ошибок перед новым запросом
    try {
      const response = await axios.post("http://localhost:5000/api/search", {
        query,
      });
      setResults(response.data.products);
    } catch (err) {
      console.error("Ошибка поиска:", err.response ? err.response.data : err);
      setError("Произошла ошибка при поиске");
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введите ингредиент"
      />
      <button onClick={handleSearch}>Поиск</button>
      {error && <p>{error}</p>} {/* Отображаем ошибку, если она есть */}
      <div>
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index}>
              <h3>{result.title}</h3>
              <p>{result.description}</p>
              <img
                src={`http://localhost:5000${result.imageUrl}`}
                alt={result.title}
                className="modal-image"
              />
              <p>Цена: {result.price} T</p>
            </div>
          ))
        ) : (
          <p>Товары не найдены.</p>
        )}
      </div>
    </div>
  );
}

export default Search;
