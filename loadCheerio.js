import fs from 'fs';
import * as cheerio from 'cheerio';


let loadedHTML;
const baseUrl=`https://elibrary.ru`;
let returnedArtilesInform;
// Чтение файла
try {
    loadedHTML = fs.readFileSync('Ковтун.txt', 'utf8');
} catch (err) {
    console.error(err);
}
const $ = cheerio.load(loadedHTML);

// Ищем теги <tr>, id которых начинается с "arw" или "brw"
const rowArtArr = $('tr[id^="arw"][valign="middle"], tr[id^="brw"][valign="middle"]');

// Проверяем, существуют ли такие теги
if (rowArtArr.length > 0) {


    returnedArtilesInform=parseCheerioElement(rowArtArr);
    console.log(returnedArtilesInform);

} else {
    console.error('Теги не найдены.');
}

function parseCheerioElement(findArr){

    let finalSetArticlesPage=[];

    let arrayOfHTML=Array.from(findArr);

    for (let shellArticle of arrayOfHTML){
        let dataAboutArt={};
        let $shellArticle=cheerio.load(shellArticle);

        const firstTr = $shellArticle('tr').first(); // Выбираем первый тег tr

        const typeOfArticle = firstTr.attr('id'); // Получаем значение атрибута id

        if (typeOfArticle.startsWith("arw")){
            const $informForScrap = $shellArticle('td[align="left"][valign="top"]');//Обрезаем лишний html-код

            //Название статьи
            let title = $shellArticle($informForScrap[0]).find('span[style="line-height:1.0;"]');//по отобранному вычисляем даные

            dataAboutArt.titleOfArticle=title.html();

            //Сcылка на статью
            let link=$informForScrap.find('a').first().attr('href');
            dataAboutArt.linkToArticle=new URL(link, baseUrl).href;

            //Авторы
            dataAboutArt.authors = $informForScrap.find('font[color="#00008f"]')
                .find('i').first().text().split(',').map(author => author.trim());


            finalSetArticlesPage.push(dataAboutArt);

        }else if (typeOfArticle.startsWith("brw")){
            const $informForScrap = $shellArticle('td[align="left"][valign="top"]');//иттерируемый элемент подготваливаем для парсинга

            //Название статьи
            let title = $informForScrap.find('font[color="#00008f"]').first().text();
            dataAboutArt.titleOfArticle=title;

            //Сcылка на статью
            dataAboutArt.linkToArticle="Ссылка на публикацию в ресурсе elibrary.ru не указана!";

            //Авторы
            dataAboutArt.authors=$informForScrap.find('font[color="#00008f"]').eq(1).text().split(',').map(author => author.trim());

            finalSetArticlesPage.push(dataAboutArt);

        }else {
            finalSetArticlesPage.push({error: "Нераспознан id статьи!", typeOfArticle:typeOfArticle });
        }
    }

    return finalSetArticlesPage;
}


