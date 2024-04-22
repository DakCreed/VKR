import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import {flattenObjectArrays, parsePage} from './parseCheerio.js';
import readline from 'readline';

const baseURLAuthorSearch='https://elibrary.ru/authors.asp';
const baseURLAuthorsTo=`https://elibrary.ru/author_items.asp?authorid=110&show_refs=1&show_option=1`
const baseURL=`https://elibrary.ru/`;
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
}

puppeteer.use(StealthPlugin());

let finalResultArticles= {
    nameAuthor: "Гусев Аркадий Эдуардович",
    articlesList: [],
    get foundArticles() {
        return `Найденно публикаций : ${this.articlesList.length}`;
    }};

async function someFunc(inputdata) {
    const browser = await puppeteer.launch({ headless: false, userDataDir: './tmp' });
    const page = await browser.newPage();
    await page.goto('https://elibrary.ru/authors.asp', { waitUntil: 'networkidle0' }); // Замените на нужный URL

    // Нажать "Очистить"
    const clearSelector = '#show_param > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(5) > div';
    await page.click(clearSelector);

    //Выбираем поиск в библиотеке по показателю e-lib
    const setElibrarySelect = '#show_param > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(3) > div > select';
    await page.select(setElibrarySelect, '2');

    const regexSPIN=/^\d{4}-\d{4}$/;
    const regexID=/^\d{1,9}$/;


    if(regexSPIN.test(inputdata)){
        console.log('\nЭто спин код');
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
        const inputSelector = 'input#surname'; // Замените на нужный селектор
        await page.type(inputSelector, inputdata);
    }




    // // Поиск div по селектору и нажатие на него
    // const divSelector = '#show_param > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(6) > div'; // Замените на нужный селектор
    // // await page.waitForSelector(divSelector);
    // await page.click(divSelector);

    // //меняем тип параметра для поиска
    // const selectSelector = '#codetype';//находим тип параметра для поиска на странице
    // await page.select(selectSelector, optionValue.SPIN);//выбираем параметр для поиска
    //
    // // Ввести цифры параметра для поиска
    // const inputSelector1 = 'input#codevalue'; // Замените на нужный селектор
    // await page.type(inputSelector1, inputsParams.SPINDotkulova);

    //Нажимаем кнопку "Искать"
    const enterSelector = '#show_param > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(6) > div';
    await page.waitForSelector(enterSelector);
    await page.click(enterSelector);

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const foundAuthorsSelector = `body > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(3) > table > tbody > tr > td.redref > font > b:nth-child(1) > font`;
    const foundAuthorsSelectorTextContent = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent : null;
    }, foundAuthorsSelector);
    console.log(`По данному запросу количество найденных авторов : ${foundAuthorsSelectorTextContent} `);



    // Находим ссылку на все публикации автора
    // const hrefValue = await page.$eval('#restab > tbody > tr:nth-child(4) > td:nth-child(4) > div > a:nth-child(1)',
    //     (link, baseURL) => {
    //         return `${baseURL}${link.getAttribute('href')}`; // Получаем значение атрибута href
    //     },
    //     baseURL // Передайте baseURL в качестве аргумента функции
    // );
    //
    // await page.goto(hrefValue, { waitUntil: 'networkidle0' });
    // console.log(hrefValue);

    //Получаем Html-код таблицы restab, в которой хранятся ссылки на авторов
    // const restabTable = await page.$eval('#restab > tbody', element => element.innerHTML)
}
// someFunc(inputsParams.IDMosevaAl);
// someFunc(inputsParams.SPINPotapchenko);
someFunc("Мосева");
const people = [
    { name: "Иван Иванов", hightSchool: "МГУ", linksToArticles: ["link1", "link2", "link3", "link4"] },
    { name: "Петр Петров", hightSchool: "СПбГУ", linksToArticles: ["link1", "link2", "link3", "link4"] },
    { name: "Алина Кузнецова", hightSchool: "НГУ", linksToArticles: ["link5", "link6", "link7"] },
    { name: "Олег Савельев", hightSchool: "УрФУ", linksToArticles: ["link8", "link9"] },
    { name: "Мария Чернова", hightSchool: "ТГУ", linksToArticles: ["link10", "link11", "link12", "link13"] },
    { name: "Сергей Дмитриев", hightSchool: "ВШЭ", linksToArticles: ["link14", "link15", "link16", "link17", "link18"] }
];

async function askUserToArrayObject(arr) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'Выберите номер объекта и нажмите Enter: '
        });

        // Выводим первые два свойства каждого объекта.
        console.log('Доступные объекты:');
        arr.forEach((item, index) => {
            console.log(`${index + 1}: ${item.name}, ${item.hightSchool}`);
        });

        rl.prompt();

        // Обработчик ввода.
        rl.on('line', (line) => {
            const index = parseInt(line.trim(), 10) - 1;

            if (index >= 0 && index < arr.length) {
                // Если номер валиден, выводим весь объект.
                console.log('Выбран объект:');
                console.log(arr[index]);
                rl.close();
                resolve(arr[index]);
            } else {
                // Если введен неверный номер, сообщаем об ошибке и перезапрашиваем ввод.
                console.log('Некорректный ввод. Пожалуйста, выберите правильный номер.');
                rl.prompt();
            }
        });

        rl.on('close', () => {
            resolve(null);
        });
    });
}
// (async () => {
//     try {
//         const selectedObject = await askUserToArrayObject(people);
//         if (selectedObject) {
//             console.log('Вы успешно выбрали объект:', selectedObject);
//         } else {
//             console.log('Выход из программы или объект не был выбран.');
//         }
//     } catch (error) {
//         console.error('Произошла ошибка:', error);
//     }
// })();