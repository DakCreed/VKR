import * as cheerio from "cheerio";

const $1 = cheerio.load('<div><p>Hello, <span>world!</span></p></div>');

const spans = $1('div').find('span'); // Ищем все элементы span внутри div
console.log(spans.text()); // Выводим текст найденных элементов

const $2 = cheerio.load('<div><p>Hello, <span>world!</span></p></div>');


const childrenOfDiv = $2('div').children(); // Получаем дочерние элементы div
console.log(childrenOfDiv.text()); // Выводим текст дочерних элементов

const $3 = cheerio.load('<div><p>Hello, <span>world!</span></p></div>');

const contentsOfDiv = $3('div').contents(); // Получаем содержимое div
console.log(contentsOfDiv.text()); // Выводим текст содержимого

const $4 = cheerio.load('<div><p>Hello, <span>world!</span></p></div>');

const parentOfSpan = $4('span').parent(); // Получаем родительский элемент span
console.log(parentOfSpan.text()); // Выводим текст родительского элемента

const $5 = cheerio.load('<div><p>Hello, <span>world!</span></p><p>How are you?</p></div>');

const nextToSpan = $5('span').next(); // Получаем следующий элемент после span
console.log(nextToSpan.text()); // Выводим текст следующего элемента

const $6 = cheerio.load('<div><p>Hello, <span>world!</span></p><p>How are you?</p></div>');

const prevToSpan = $6('span').prev(); // Получаем предыдущий элемент перед span
console.log(prevToSpan.text()); // Выводим текст предыдущего элемента