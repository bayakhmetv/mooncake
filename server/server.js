const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Модель пользователя
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const cors = require("cors");
const Product = require("./models/Product"); // Подключение модели Product
require("dotenv").config();
const OpenAI = require("openai"); // Use require for OpenAI SDK
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("./models/Order");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Укажите адрес вашего фронтенда
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
// Статические файлы
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Сервер работает корректно.");
});

// Инициализация OpenAI API
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Папка для сохранения изображений
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
  },
});
const upload = multer({ storage });

// Подключение к базе данных
connectDB();

// Routes
app.use("/api/products", productRoutes);

// Админская страница
app.get("/admin-crud", (req, res) => {
  res.sendFile(__dirname + "/public/admin.html");
});

// Роут для загрузки изображений
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` }); // Возвращаем путь для фронтенда
});

// Роут для добавления нового товара
app.post("/api/products", upload.single("image"), async (req, res) => {
  const { title, description, price, count, category, ingredients } = req.body;

  // Если изображение загружено
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

  // Разделение ingredients
  const ingredientsArray = ingredients
    ? ingredients.split(",").map((item) => item.trim())
    : [];

  try {
    const product = new Product({
      title,
      description,
      price,
      count,
      category,
      ingredients: ingredientsArray,
      imageUrl,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Ошибка при добавлении товара:", error);
    res.status(500).json({ error: "Ошибка при добавлении товара" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id; // Получение ID из параметров URL
    const product = await Product.findById(productId); // Поиск товара в базе данных

    if (!product) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json(product); // Возвращаем товар
  } catch (error) {
    console.error("Ошибка при получении товара:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Роут для умного поиска по ингредиентам
app.post("/api/search", async (req, res) => {
  const { query } = req.body;

  try {
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Запрос не может быть пустым" });
    }

    console.log("Получен запрос на поиск с ингредиентом:", query);

    // Используем OpenAI для анализа слова пользователя
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Ты помощник, который анализирует пользовательские запросы и уточняет их для поиска в базе данных.",
        },
        {
          role: "user",
          content: `Что пользователь имеет в виду под словом: "${query}"? Ответь только уточнённым словом.`,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content.trim();
    console.log("Ключевое слово, сгенерированное ИИ:", aiResponse);

    // Выполняем поиск в базе данных с уточнённым словом
    const products = await Product.find({
      ingredients: { $regex: aiResponse, $options: "i" }, // Используем уточнённое слово
    });

    console.log("Найдено продуктов:", products.length);
    res.json({ products });
  } catch (error) {
    console.error("Ошибка при поиске:", error);
    res.status(500).json({ error: "Ошибка при обработке запроса" });
  }
});

// Роут для регистрации
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body; // Получаем роль из тела запроса

  // Хэшируем пароль перед сохранением
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Устанавливаем роль, по умолчанию "user"
    });

    // Сохраняем нового пользователя в базе данных
    await newUser.save();
    res.status(201).json({ message: "Пользователь зарегистрирован" });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ error: "Ошибка при регистрации" });
  }
});

// Роут для входа
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Пользователь не найден" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Неверный пароль" });
    }

    // Создаем payload, включая userId и роль
    const payload = {
      userId: user._id, // Уникальный идентификатор пользователя
      role: user.role, // Роль пользователя
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.json({ message: "Вход успешен", token, name: user.name });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при входе" });
  }
});

// Получение данных пользователя
app.get("/api/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Токен передается в заголовке
  console.log("Extracted token:", token);
  if (!token) {
    return res.status(401).json({ error: "Токен отсутствует" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password"); // Не возвращаем пароль
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json(user); // Возвращаем данные пользователя
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Пример использования
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Доступ запрещен" });
  }
  next();
};

// Пример использования
app.get("/api/admin-only", requireAdmin, (req, res) => {
  res.json({ message: "Это админский маршрут" });
});

// Маршрут для создания платежного намерения
app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "kzt", // или ваша валюта
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Что-то пошло не так" });
  }
});

// Маршрут для получения всех продуктов
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find(); // Получаем все товары
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки продуктов" });
  }
});

// Корневой маршрут для главной страницы
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

// Роут для отдачи страницы с пользователями
app.get("/admin-users", (req, res) => {
  res.sendFile(__dirname + "/public/admin-users.html");
});

// Роут для получения списка пользователей (замените на /api/users)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Получаем всех пользователей из базы данных
    res.json(users); // Отправляем список пользователей в формате JSON
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении пользователей" });
  }
});

// Роут для отдачи страницы с заказами
app.get("/admin-orders", (req, res) => {
  res.sendFile(__dirname + "/public/admin-orders.html");
});

// Middleware для аутентификации
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader); // Логируем заголовок

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Пользователь не авторизован" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token); // Логируем извлечённый токен

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Проверяем токен
    console.log("Decoded Token:", decoded); // Логируем содержимое токена

    req.userId = decoded.userId; // Сохраняем userId из токена
    req.role = decoded.role; // Сохраняем роль пользователя

    if (decoded.role === "admin") {
      // Если роль admin, перенаправляем на админ-панель
      return res.redirect("http://localhost:5000/admin");
    }

    next(); // Передаём управление следующему middleware
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    res.status(403).json({ error: "Недействительный токен" });
  }
};
// Эндпоинт для сохранения заказа в базе данных
app.post("/api/orders", authenticate, async (req, res) => {
  const { name, address, phone, cartItems, totalPrice } = req.body;
  console.log("req.userId:", req.userId); // Логируем req.user.userId
  if (!req.userId) {
    return res.status(400).json({ error: "Пользователь не авторизован" });
  }

  try {
    const newOrder = new Order({
      userId: req.userId, // Убедитесь, что _id передается правильно
      name,
      address,
      phone,
      cartItems,
      totalPrice,
    });

    await newOrder.save(); // Сохранение заказа в базе данных

    res.status(201).json({ message: "Заказ сохранён", order: newOrder });
  } catch (err) {
    console.error("Ошибка сохранения заказа:", err);
    res.status(500).json({ error: "Не удалось сохранить заказ" });
  }
});

// Эндпоинт для получения всех заказов
app.get("/api/orders", authenticate, async (req, res) => {
  try {
    const userId = req.userId; // Извлекаем userId из сессии или токена

    if (!userId) {
      return res.status(400).json({ error: "Пользователь не авторизован" });
    }

    const orders = await Order.find({ userId }); // Фильтруем заказы по userId

    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при загрузке заказов" });
  }
});

// Эндпоинт для проверки роли и редиректа
app.post("/api/authenticate", (req, res) => {
  const { token } = req.body; // Получаем токен из тела запроса

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Проверяем токен
    console.log("Decoded Token:", decoded);

    if (decoded.role === "admin") {
      res.json({ redirectTo: "http://localhost:5000/admin" }); // Админ-панель
    } else {
      res.json({ redirectTo: "http://localhost:5173" }); // Пользовательский интерфейс
    }
  } catch (err) {
    console.error("Ошибка проверки токена:", err.message);
    res.status(403).json({ error: "Недействительный токен" });
  }
});

app.get("/api/orders/all", async (req, res) => {
  try {
    const orders = await Order.find(); // Все заказы
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении заказов" });
  }
});

app.put("/api/orders/:id", async (req, res) => {
  const { id } = req.params; // ID заказа
  const { status } = req.body; // Новый статус

  if (!status) {
    return res.status(400).json({ message: "Статус обязателен" });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Возвращает обновленный документ
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Заказ не найден" });
    }
    res.status(200).json({ message: "Заказ удалён" });
  } catch (error) {
    console.error("Ошибка удаления заказа:", error);
    res.status(500).json({ error: "Не удалось удалить заказ" });
  }
});

// Роут для получения данных о продажах по дням
app.get("/api/sales", async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Группируем по дням
          totalSales: { $sum: "$totalPrice" }, // Суммируем стоимость всех заказов за день
          totalOrders: { $sum: 1 }, // Подсчитываем количество заказов
        },
      },
      { $sort: { _id: 1 } }, // Сортируем по дате
    ]);

    res.json(salesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении данных" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
