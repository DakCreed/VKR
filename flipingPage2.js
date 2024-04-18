import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {flattenObjectArrays, parsePage} from './parseCheerio.js';



puppeteer.use(StealthPlugin());


let finalResultArticles= {
    nameAuthor: "Гусев Аркадий Эдуардович",
    articlesList: [],
    get foundArticles() {
        return `Найденно публикаций : ${this.articlesList.length}`;
    }};



(async (inputString) => {
    console.log(inputString)
    const browser = await puppeteer.launch({ headless: true, userDataDir: './tmp' });
    const page = await browser.newPage();

    await page.goto('https://www.elibrary.ru/author_items.asp?authorid=1035887&pubrole=100&show_refs=1&show_option=0', { waitUntil: 'networkidle0' });
    const elementName= await page.$('#thepage > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(1) > font > b');
    finalResultArticles.nameAuthor=await page.evaluate((element) => element.textContent, elementName);
    let countPage = 1;
    while (true) {
        // Получение содержимого элемента
        const element = await page.$('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a');
        const textContent = await page.evaluate((element) => element.textContent, element);

        if (textContent==="Предыдущая страница" || textContent==="Выделить все публикации на этой странице") {

            // Получение HTML-кода страницы
            const htmlContent = await page.content();

            finalResultArticles.articlesList.push(parsePage(htmlContent));
            finalResultArticles.articlesList=flattenObjectArrays(finalResultArticles.articlesList);

            console.log(finalResultArticles.nameAuthor);
            console.log(finalResultArticles.articlesList);
            console.log(finalResultArticles.foundArticles);

            break;
        }


        // Получение HTML-кода страницы
        const htmlContent = await page.content();

        finalResultArticles.articlesList.push(parsePage(htmlContent));
        try {
            await Promise.all([
                page.click('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a'),

                page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
        } catch (error) {
            console.error('Произошла ошибка при нажатии на элемент или ожидании навигации:', error);
            // Дополнительные действия, если необходимо, например, закрыть браузер или выполнить другие действия в ответ на ошибку
        }
        countPage++
    }

    // await browser.close();
})('Строка на входе');
