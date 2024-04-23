const cheerio = require('cheerio');

// Предположим, что у вас есть HTML-строка
const htmlString = `<font color="#00008f"><b>Мосева&nbsp; Алеся&nbsp; Сергеевна</b></font><span class="aster" title="Автор зарегистрирован в SCIENCE INDEX">*</span>
<br>
Московский технический университет связи и информатики (Москва)`;

// Загружаем HTML в cheerio
const $ = cheerio.load(htmlString);

// Находим текст после тега <br>
const textAfterBr = $('br').next().text();

console.log(textAfterBr);