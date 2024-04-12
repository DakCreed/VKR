import fs from 'fs';
import * as cheerio from 'cheerio';

const baseUrl = 'https://elibrary.ru';

// Чтение файла
let loadedHTML;
try {
    loadedHTML = fs.readFileSync('Ковтун.txt', 'utf8');
} catch (err) {
    console.error('Ошибка при чтении файла:', err);
    return;
}

const $ = cheerio.load(loadedHTML);

// Ищем теги <tr>, id которых начинается с "arw" или "brw"
const rowArtArr = $('tr[id^="arw"][valign="middle"], tr[id^="brw"][valign="middle"]');

// Проверяем, существуют ли такие теги
if (rowArtArr.length > 0) {
    const returnedArtilesInform = parseCheerioElement(rowArtArr);
    console.log(returnedArtilesInform);
} else {
    console.error('Теги не найдены.');
}

function parseCheerioElement(findArr) {
    const finalSetArticlesPage = [];

    findArr.each((index, shellArticle) => {
        const dataAboutArt = {};
        const $shellArticle = $(shellArticle);
        const firstTr = $shellArticle.find('tr').first();
        const typeOfArticle = firstTr.attr('id');

        if (typeOfArticle.startsWith("arw")) {
            const $informForScrap = $shellArticle.find('td[align="left"][valign="top"]');
            dataAboutArt.titleOfArticle = $informForScrap.find('span[style="line-height:1.0;"]').text();
            const link = $informForScrap.find('a').first().attr('href');
            dataAboutArt.linkToArticle = new URL(link, baseUrl).href;
            dataAboutArt.authors = $informForScrap.find('font[color="#00008f"] i').first().text().split(',').map(author => author.trim());
        } else if (typeOfArticle.startsWith("brw")) {
            const $informForScrap = $shellArticle.find('td[align="left"][valign="top"]');
            dataAboutArt.titleOfArticle = $informForScrap.find('font[color="#00008f"]').first().text();
            dataAboutArt.linkToArticle = "Ссылка на публикацию в ресурсе elibrary.ru не указана!";
            dataAboutArt.authors = $informForScrap.find('font[color="#00008f"]').eq(1).text().split(',').map(author => author.trim());
        } else {
            dataAboutArt.error = "Нераспознан id статьи!";
            dataAboutArt.typeOfArticle = typeOfArticle;
        }

        finalSetArticlesPage.push(dataAboutArt);
    });

    return finalSetArticlesPage;
}