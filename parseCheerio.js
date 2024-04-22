import fs from 'fs';
import * as cheerio from 'cheerio';


export function parseCheerioElement(findArr){

    let finalSetArticlesPage=[];

    const baseUrl=`https://elibrary.ru`;

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
                .find('i').first().text();//.split(',').map(author => author.trim());

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


export function parsePage(loadedHTML){

    const $ = cheerio.load(loadedHTML);

// Ищем теги <tr>, id которых начинается с "arw" или "brw"
    const rowArtArr = $('tr[id^="arw"][valign="middle"], tr[id^="brw"][valign="middle"]');

// Проверяем, существуют ли такие теги
    if (rowArtArr.length > 0) {
        //Если есть, передаем их в функции, которая вернет объект с данными по статьям
        let returnedArticlesInform=parseCheerioElement(rowArtArr);
        return returnedArticlesInform;

    } else {
        console.error('Теги не найдены.');
    }

}

export function flattenObjectArrays(arrayOfArrays) {
    return arrayOfArrays.flat();
}

try {
    // Синхронное чтение файла
    const data = fs.readFileSync('restab Мосева.txt', 'utf8');
    // Вывод содержимого файла
    // console.log('Данные файла:', data);
    parseRestabTable(data);
} catch (err) {
    // Обработка ошибок (например, если файл не найден)
    console.error('Ошибка при чтении файла:', err);
}


function parseRestabTable(restab){
    let arrAuthorsObj=[]

    //Загрузили таблицу #restab в объект cheerio
    let $restab = cheerio.load(restab, null, false);
    const persons = $restab('tbody').children('tr[valign="top"][bgcolor="#f5f5f5"]');

    for (let elemPersons of persons) {
        let authorsObj = {
            nameAuthor: null,
            listOfPublications: null,
            titleHightSchool: null,
            NumberOfPublications: null
        };

        try {
            const id = $restab(elemPersons).attr('id');
            if (!id) {
                throw new Error("ID не найден для элемента person");
            }
            authorsObj.listOfPublications = `https://elibrary.ru/author_items.asp?authorid=${deleteA(id)}&show_refs=1&show_option=1`;

            const nameAuthor = $restab(elemPersons).find('td.midtext').find('font[color="#00008f"]').find('b:last').text();
            if (!nameAuthor) {
                throw new Error("Не удалось найти имя автора в предоставленном HTML");
            }
            authorsObj.nameAuthor = nameAuthor;

            let $element = $restab(elemPersons);

            let brElement=$element.find('br:last');
            // Сначала находим родительский элемент, так как `.contents()` возвращает все дочерние узлы, включая текстовые
            let parentOfBr = brElement.parent();

// Получаем все узлы после 'br:last' включая текстовые узлы
            let allContents = parentOfBr.contents();
            let textAfterBr = "";

// Находим индекс последнего 'br' в дочерних узлах
            let brIndex = allContents.index(brElement) + 1;  // +1 чтобы начать поиск с элемента следующего за br

// Итерируемся по всем узлам после последнего <br>
            allContents.slice(brIndex).each(function() {
                if (this.nodeType === 3) {  // nodeType 3 соответствует текстовому узлу
                    textAfterBr += $element(this).text();
                }
            });

            console.log(textAfterBr.trim());

            console.log(brElement.length)

            console.log($element.html())
            console.log(authorsObj)


        } catch (error) {
            console.error("Ошибка при обработке данных элемента:", error.message);
            continue; // Пропускаем текущий элемент и продолжаем со следующим
        }

        arrAuthorsObj.push(authorsObj);
    }

    // persons.each((index, element) => {
    //     const id = $restab(element).attr('id');
    //     authorsObj.listOfPublications=`https://elibrary.ru/author_items.asp?authorid=${deleteA(id)}&show_refs=1&show_option=1`;
    //     const htmlContent = $restab(element).html();
    //     const nameAuthor = $restab(element).find('td.midtext').find('font[color="#00008f"]').find('b:last').text();
    //     authorsObj.nameAuthor=nameAuthor;
    //     let brElements=$restab(element).find('br');
    //     brElements.each((index, brElement) => {
    //         // Получить следующий элемент после <br>
    //         const nextNode = brElement.nextSibling;
    //         // Проверить, является ли следующий элемент текстовым узлом
    //         if (nextNode && nextNode.nodeType === 3) {
    //             // Вывести текст следующего узла
    //             authorsObj.titleHightSchool=nextNode.nodeValue.trim();
    //         }
    //     });
    //     arrAuthorsObj.push(authorsObj);
    // });

    // let linkContents = [];
    // persons.each((index, person) => {
    //     // Найти все теги <a> с атрибутом title
    //     const links = $restab(person).find('a[title="Список публикаций данного автора на портале elibrary.ru"]');
    //
    //     // Пройтись по каждому найденному тегу <a> и добавить его содержимое в массив
    //     links.each((i, link) => {
    //         const content = $restab(link).text(); // Получить текстовое содержимое тега <a>
    //         linkContents.push(content); // Добавить содержимое в массив
    //     });
    // });

    // console.log(linkContents);
    console.log(arrAuthorsObj)


}

function deleteA(str){
    return str.replace(/^a/, '');
}

function removeLeadingNumbersAndDot(str) {
    // Регулярное выражение для поиска цифр, точки и пробела в начале строки
    const regex = /^[\d.]+\s*/;
    // Заменяем найденное регулярным выражением пустую строку
    return str.replace(regex, '');
}