document.getElementById("addProductForm").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    // Получение данных из формы
    const formData = new FormData(event.target);
    const ingredients = formData.get("ingredients").split(",").map(item => item.trim());
  
    const newProductData = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      count: Number(formData.get("count")),
      category: formData.get("category"),
      image: formData.get("image"),
      ingredients: ingredients, // Отправляем массив ингредиентов
    };
  
    // Получаем изображение
    const imageFile = formData.get("image");
    const uploadData = new FormData();
    uploadData.append("image", imageFile);
    uploadData.append("productData", JSON.stringify(newProductData));
  
    try {
      // Сначала загружаем изображение
      const imageResponse = await axios.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log('Image upload response:', imageResponse);  // Отладочная информация
  
      const imageUrl = imageResponse.data.imageUrl;
  
      // Добавляем URL изображения в данные продукта
      newProductData.imageUrl = imageUrl;
  
      // Отправляем продукт на сервер
      const response = await axios.post("/api/products", newProductData);
      console.log('Product save response:', response);  // Отладочная информация
  
      if (response.status === 201) {
        alert("Товар успешно добавлен!");
        event.target.reset();
        loadProducts();  // Обновить список товаров после добавления
      }
    } catch (error) {
      console.error("Ошибка при добавлении товара:", error);
      alert("Ошибка при добавлении товара.");
    }
  });
  
  document.addEventListener("DOMContentLoaded", loadProducts);
  
  function loadProducts() {
    // Загрузка списка товаров
    axios.get("/api/products")
      .then(response => {
        const products = response.data;
  
        const productsContainer = document.getElementById("productsContainer");
        productsContainer.innerHTML = ""; // Очистим контейнер перед добавлением новых товаров
  
        products.forEach(product => {
          const productElement = document.createElement("div");
          productElement.classList.add("product-item");
          productElement.innerHTML = `
            <h2>${product.title}</h2>
            <p>${product.description}</p>
            <p>Цена: ${product.price} T</p>
            <p>Количество: ${product.count} шт.</p>
            <p>Ингредиенты: ${product.ingredients.join(', ')}</p>  <!-- Отображаем ингредиенты -->
            <img src="http://localhost:5000${product.imageUrl}" alt="${product.title}" width="100" />
            <button onclick="editProduct('${product._id}')">Редактировать</button>
            <button onclick="deleteProduct('${product._id}')">Удалить</button>
          `;
          productsContainer.appendChild(productElement);
        });
      })
      .catch(error => {
        console.error("Ошибка при загрузке товаров:", error);
      });
  }
  
  function editProduct(productId) {
    console.log("Product ID:", productId);  // Логируем ID перед отправкой запроса
    axios.get(`/api/products/${productId}`)
      .then(response => {
        const product = response.data;
  
        // Заполняем поля формы в модальном окне
        document.getElementById("editTitle").value = product.title;
        document.getElementById("editDescription").value = product.description;
        document.getElementById("editPrice").value = product.price;
        document.getElementById("editCount").value = product.count;
        document.getElementById("editCategory").value = product.category;
        document.getElementById("editIngredients").value = product.ingredients.join(', ');  // Отображаем ингредиенты как строку
  
        // Предварительный просмотр изображения
        const imagePreview = document.getElementById("imagePreview");
        if (product.imageUrl) {
          imagePreview.src = `http://localhost:5000${product.imageUrl}`;
          imagePreview.style.display = "block";
        } else {
          imagePreview.style.display = "none";
        }
  
        // Открываем модальное окно
        document.getElementById("editProductModal").style.display = "block";
  
        // Сохраняем ID товара для отправки при сохранении
        document.getElementById("editProductForm").onsubmit = function (event) {
          event.preventDefault();
  
          const formData = new FormData(event.target);
          const updatedProductData = {
            title: formData.get("title"),
            description: formData.get("description"),
            price: Number(formData.get("price")),
            count: Number(formData.get("count")),
            category: formData.get("category"),
            ingredients: formData.get("ingredients").split(',').map(ingredient => ingredient.trim())  // Обрабатываем ингредиенты
          };
  
          const imageFile = formData.get("image");
          if (imageFile) {
            // Если загружается новое изображение, нужно его обновить
            const uploadData = new FormData();
            uploadData.append("image", imageFile);
            axios.post("/upload", uploadData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
              .then(imageResponse => {
                updatedProductData.imageUrl = imageResponse.data.imageUrl;
  
                // Отправляем обновленные данные на сервер
                axios.put(`/api/products/${productId}`, updatedProductData)
                  .then(response => {
                    if (response.status === 200) {
                      alert("Товар обновлен!");
                      closeModal();  // Закрываем модальное окно
                      location.reload();  // Перезагружаем страницу, чтобы увидеть обновления
                    }
                  })
                  .catch(error => {
                    console.error("Ошибка при обновлении товара:", error);
                    alert("Ошибка при обновлении товара.");
                  });
              })
              .catch(error => {
                console.error("Ошибка при загрузке изображения:", error);
                alert("Ошибка при загрузке изображения.");
              });
          } else {
            // Если изображение не меняется, отправляем без изменений
            updatedProductData.imageUrl = product.imageUrl;
  
            axios.put(`/api/products/${productId}`, updatedProductData)
              .then(response => {
                if (response.status === 200) {
                  alert("Товар обновлен!");
                  closeModal();  // Закрываем модальное окно
                  location.reload();  // Перезагружаем страницу, чтобы увидеть обновления
                }
              })
              .catch(error => {
                console.error("Ошибка при обновлении товара:", error);
                alert("Ошибка при обновлении товара.");
              });
          }
        };
      })
      .catch(error => {
        console.error("Ошибка при загрузке данных товара:", error.response || error);
        alert("Ошибка при загрузке данных товара.");
      });
  }
  
  // Закрытие модального окна
  function closeModal() {
    document.getElementById("editProductModal").style.display = "none";
  }
  
  function deleteProduct(productId) {
    if (confirm("Вы уверены, что хотите удалить этот товар?")) {
      axios.delete(`/api/products/${productId}`)
        .then(response => {
          if (response.status === 200) {
            alert("Товар удален!");
            loadProducts();  // Обновить список товаров после удаления
          }
        })
        .catch(error => {
          console.error("Ошибка при удалении товара:", error);
          alert("Ошибка при удалении товара.");
        });
    }
  }
  