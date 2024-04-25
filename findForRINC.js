import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {flattenObjectArrays, parsePage, parseRestabTable} from './parseCheerio.js';
import readline from 'readline';
import {flipingPages} from './flipingPage2.js';

puppeteer.use(StealthPlugin());


const inputsParams={
    SPINDotkulova: '3052-6119',
    SPINPolanceva: '8112-8560',
    SPINMoseva: '1313-0436',
    SPINKysin: '5407-1197',
    SPINPotapchenko: '9952-5540',
    SPINTishkin: '8890-3510',
    IDDotkulova: '893597',
    IDPolanceva: '1035887',
    IDMoseva: '946893',
    IDKysin: '873546',
    IDPotapchenko: '837252',
    IDTishkin: '110',
    IDMosevaAl: '1230650'

};

const optionValue = {
    SPIN: 'SPIN',
    ORCID: 'ORCID',
    RSCI: 'RSCI'
};







async function someFunc(inputdata) {

    const regexSPIN=/^\d{4}-\d{4}$/;
    const regexID=/^\d{1,9}$/;

    let finalResultArticles= {
        nameAuthor: null,
        articlesList: [],
        get foundArticles() {
            return `Найденно публикаций : ${this.articlesList.length}`;
        }};

    const browser = await puppeteer.launch({ headless: false, userDataDir: './tmp' });
    const page = await browser.newPage();
    await page.goto('https://elibrary.ru/authors.asp', { waitUntil: 'networkidle0' }); // Замените на нужный URL

    // Нажать "Очистить"
    const clearSelector = '#show_param > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(5) > div';
    await page.click(clearSelector);

    //Выбираем поиск в библиотеке по показателю e-lib
    const setElibrarySelect = '#show_param > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(3) > div > select';
    await page.select(setElibrarySelect, '2');

    //Выбираем сортировку авторов
    const setSortedSelect = '#sortorder';
    await page.select(setSortedSelect, '1');

    if(regexSPIN.test(inputdata)){
        console.log('\nЭто SPIN код');
        //меняем тип параметра для поиска
        const selectSelector = '#codetype';//находим тип параметра для поиска на странице
        await page.select(selectSelector, optionValue.SPIN);//выбираем параметр для поиска

        // Ввести цифры параметра для поиска
        const inputSelector = 'input#codevalue'; // Замените на нужный селектор
        await page.type(inputSelector, inputdata);

    }else if(regexID.test(inputdata)){
        console.log('\nЭто id автора')
        //меняем тип параметра для поиска
        const selectSelector = '#codetype';//находим тип параметра для поиска на странице
        await page.select(selectSelector, optionValue.RSCI);//выбираем параметр для поиска

        // Ввести цифры параметра для поиска
        const inputSelector = 'input#codevalue'; // Замените на нужный селектор
        await page.type(inputSelector, inputdata);
    }

    else {
        console.log('Скорей всего вы ввели имя')
        // Ввести фамилию
        const inputSelector = 'input#surname';
        await page.type(inputSelector, inputdata);//вводим текст в поле ввода имени
    }

    //Нажимаем кнопку "Искать"
    const enterSelector = '#show_param > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(6) > div';
    await page.waitForSelector(enterSelector);
    await page.click(enterSelector);


    try {
        // Ожидание завершения навигации
        // await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 100000 });
        // await page.waitForNavigation({ waitUntil: 'load', timeout: 100000 });
    }
    catch (error) {
        // Обработка ошибки
        console.error('Произошла ошибка во время навигации:');
        console.error('Сообщение об ошибке:', error.message);
        console.error('Стек вызовов:', error.stack);
        return null;
        // Здесь можно добавить дополнительный код для обработки или логирования ошибки
    }

    // await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });

                                        //body > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(3) > table > tbody > tr > td.redref > font > b:nth-child(1) > font
    //Проверяем результат поиска автора
    const foundAuthorsSelector = `body > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(3) > table > tbody > tr > td.redref > font > b:nth-child(1) > font`;

    try {
        // Ожидаем появления селектора в течение заданного времени
        await page.waitForSelector(foundAuthorsSelector, { timeout: 30000 }); // Установите timeout по вашему усмотрению
        // Продолжение работы программы, если селектор найден
    } catch (error) {
        if (error.name === 'TimeoutError') {
            // Если появилась ошибка таймаута, то считаем, что авторы не найдены
            console.log('Авторов по вашему запросу не найдено');
        } else {
            // Обработка других возможных ошибок
            console.error('Произошла ошибка:', error);
        }
        await browser.close();
        return null; // Прекращаем дальнейшее выполнение функции или выходим из программы

    }

    // await page.waitForSelector(foundAuthorsSelector);


    let objChoice=null;
    try {
        const foundAuthorsSelectorTextContent = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent.trim() : null;
        }, foundAuthorsSelector);

        // Проверяем, получен ли текст и не является ли он пустой строкой
        if (!foundAuthorsSelectorTextContent) {
            console.log("Авторов не найдено!");
        } else {
            // console.log(`По данному запросу количество найденных авторов: ${foundAuthorsSelectorTextContent}`);
            const restabTable =  await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                return element ? element.innerHTML : 'Элемент не найден';
            }, '#restab');
            // console.log(restabTable);
            objChoice=parseRestabTable(restabTable);
        }
        if (objChoice === null){
            console.log('Данных по введенным вами параметров не обнаружено!')
        }else{
            // console.log(objChoice);
            await browser.close();

            return JSON.stringify(objChoice);
        }

    } catch (error) {
        console.error("Произошла ошибка при попытке получить количество авторов:", error);
        console.log("Авторов не найдено!");
    }
}
// someFunc(inputsParams.IDMosevaAl);
// console.log(someFunc(inputsParams.SPINPotapchenko));
// console.log(someFunc("Мосева"));
// someFunc("fghdfgkfjg");
// console.log(someFunc("Дрожжин"));


// Создаем интерфейс readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


async function main() {
    let a = null;
    try {
        // Получаем массив объектов
        let authors1 = await someFunc("Мосева");
        if (authors1===null){
            console.log('Данных не найденно!');
            return null;
        }
        authors1 = JSON.parse(authors1);
        // Выводим информацию о количестве найденных авторов
        console.log(`Найдено авторов: ${authors1.length}`);
        // Выводим каждый объект и его индекс пользователю
        authors1.forEach((author, index) => {
            console.log(`${index + 1}: ${author.nameAuthor}, ${author.titleHightSchool}, количество публикаций: ${author.NumberOfPublications}`);
        });

        // Устанавливаем подсказку для пользователя
        rl.setPrompt('Выберите номер автора для получения ссылки на публикации (введите число): ');
        rl.prompt();

        // Обрабатываем ввод пользователя
        rl.on('line', async (answer) => {
            const index = parseInt(answer, 10) - 1; // Преобразуем введенное значение в число и корректируем индекс
            if (index >= 0 && index < authors1.length) { // Исправлено authors на authors1
                console.log(`==================================================================================================\n\n Результат : `)
                console.log(`Ф.И.О. : ${authors1[index].nameAuthor}`);
                console.log(`Текущая организация : ${authors1[index].titleHightSchool}`);
                console.log(`Количество публикаций : ${authors1[index].NumberOfPublications}`);
                console.log(`Список публикаций: ${authors1[index].listOfPublications}`); // Исправлено authors на authors1
                a = await flipingPages(authors1[index].listOfPublications);
                console.log(JSON.parse(a));
                rl.close(); // Закрываем интерфейс после получения ответа
            } else {
                console.log('Некорректный ввод, попробуйте снова.');
                rl.prompt(); // Повторно выводим подсказку для повторного ввода
            }
        });

    } catch (error) {
        console.error('Произошла ошибка при получении данных:', error);
        rl.close();
    }
}

// async function main() {
//     try {
//         const listsWithPublication= await someFunc("Мосева");
//         const userObject = JSON.parse(listsWithPublication);
//         // console.log(userObject);
//
//         // const result = await flipingPages('https://elibrary.ru/author_items.asp?authorid=837252&show_refs=1&show_option=1');
//         // if (result === null) {
//         //     throw new Error("flipingPages вернула null");
//         // }
//         // console.log(JSON.parse(result));
//     } catch (error) {
//         console.error('Произошла ошибка:', error.message);
//         console.error('Стек вызовов:', error.stack);
//         // Можно добавить дополнительные действия по обработке ошибки, например, запись в лог-файл
//     }
// }

main();
