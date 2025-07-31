const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' })); // Внимание: для продакшена лучше указать конкретные домены

// Сервим статические файлы из корня (для index.html и package.json)
app.use(express.static(__dirname));

// И отдельно для папки public
app.use('/public', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 1111;

app.listen(port, function () {
  console.log(`Kaiten Addon server listening on port ${port}`);
  console.log(`Access it at: http://localhost:${port}`);
});
