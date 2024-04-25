import fs from 'fs';
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {flattenObjectArrays, parsePage} from './parseCheerio.js';
import * as cheerio from 'cheerio';



puppeteer.use(StealthPlugin());






export async function flipingPages(url){
    //Регулярное выражение для проверки корректности url-адреса для перелистывания страниц
    const checkLinkToPublications = /https:\/\/(?:www\.)?elibrary\.ru\/author_items\.asp\?authorid=\d+&show_refs=1&show_option=1/;
    let finalResultArticles= {
        nameAuthor: null,
        titleHighSchool: "Учреждение не указано",
        articlesList: [],
        get foundArticles() {
            return `Найдено публикаций : ${this.articlesList.length}`;
        }};

    if (!checkLinkToPublications.test(url)){
        console.log('Вы передали не ссылку');
        await browser.close();
        return null;
    }

    const browser = await puppeteer.launch({ headless: false, userDataDir: './tmp' });
    const page = await browser.newPage();


    await page.goto(url, { waitUntil: 'networkidle0' });
    const elementName= await page.$('#thepage > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(1) > font > b');
    finalResultArticles.nameAuthor=await page.evaluate((element) => element.textContent, elementName);

    // Выборка элемента по CSS-селектору
    const elementHandle = await page.$(`#thepage > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(1)>a`);
    const innerHTML = await page.evaluate((element) => {return element.innerHTML}, elementHandle);
    if (innerHTML){finalResultArticles.titleHighSchool=innerHTML.trim();}
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
            // finalResultArticles.articlesList=finalResultArticles.articlesList.join(',');
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
    await browser.close();
    return JSON.stringify(finalResultArticles);

}

// async function main() {
//     const result = await flipingPages('https://elibrary.ru/author_items.asp?authorid=1230650&show_refs=1&show_option=1');
//     console.log(JSON.parse(result));
// }
//
// main();