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
    const data = fs.readFileSync('restab Дрожжин2.txt', 'utf8');
    // Вывод содержимого файла
    // console.log('Данные файла:', data);
    // parseRestabTable(data);
} catch (err) {
    // Обработка ошибок (например, если файл не найден)
    console.error('Ошибка при чтении файла:', err);
}


export function parseRestabTable(restab){
    let arrAuthorsObj=[]

    //Загрузили таблицу #restab в объект cheerio
    let $restab = cheerio.load(restab, null, false);
    const persons = $restab('tbody').children('tr[valign="top"][bgcolor="#f5f5f5"]');
    let count=0;
    for (let elemPersons of persons) {
        count++;
        let authorsObj = {
            nameAuthor: null,
            listOfPublications: null,
            titleHightSchool: null,
            NumberOfPublications: null
        };

        try {
            // const id = $restab(elemPersons).attr('id');
            // if (!id) {
            //     throw new Error("ID не найден для элемента person");
            // }
            // authorsObj.listOfPublications = `https://elibrary.ru/author_items.asp?authorid=${deleteA(id)}&show_refs=1&show_option=1`;

            const nameAuthor = $restab(elemPersons).find('td.midtext').find('font[color="#00008f"]').find('b:last').text();
            if (!nameAuthor) {
                throw new Error("Не удалось найти имя автора в предоставленном HTML");
            }
            authorsObj.nameAuthor = nameAuthor;


            //Заполняем название университета
            let $hightSchool = $restab(elemPersons);
            let $td = $hightSchool.find('td[align="left"].midtext');
            let lastContent = $td.contents().last();
            if (lastContent.length === 0 || !lastContent[0] || !lastContent[0].data) {
                throw new Error("Не удалось найти текст после последнего <br> или текст отсутствует");
            }
            authorsObj.titleHightSchool = lastContent[0].data.trim();

            //Заполняем количество публикаций
            const $a=$restab(elemPersons);
            // let y=$a.find('a[title="Список публикаций данного автора на портале elibrary.ru"]').text();
            if (!$a.find('a[title="Список публикаций данного автора на портале elibrary.ru"]').text() || $a.find('a[title="Список публикаций данного автора на портале elibrary.ru"]').text().length === 0) {
                authorsObj.NumberOfPublications=0;
            }else {
                authorsObj.NumberOfPublications=Number($a.find('a[title="Список публикаций данного автора на портале elibrary.ru"]').text());
            }


            const id = $restab(elemPersons).attr('id');
            if (!id) {
                throw new Error("ID не найден для элемента person");
            }
            if (authorsObj.NumberOfPublications===0){
                authorsObj.listOfPublications=`Публикации отсутствуют`;
            }else if (authorsObj.NumberOfPublications>0){
                authorsObj.listOfPublications=`https://elibrary.ru/author_items.asp?authorid=${deleteA(id)}&show_refs=1&show_option=1`;
            }

            arrAuthorsObj.push(authorsObj);



        } catch (error) {
            console.error("Ошибка при обработке данных элемента:", error.message);
            continue; // Пропускаем текущий элемент и продолжаем со следующим
        }
    }
    // console.log(arrAuthorsObj);
    return arrAuthorsObj;
}




function deleteA(str){
    return str.replace(/^a/, '');
}