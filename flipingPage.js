import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from 'fs';
import path from 'path';


puppeteer.use(StealthPlugin());

let filePath=null;

// (async () => {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//     await page.goto('https://www.elibrary.ru/author_items.asp?authorid=790792&show_refs=1&show_option=1', { waitUntil: 'networkidle0' });
//     // Получение содержимого элемента
//     const element = await page.$('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a');
//     const textContent = await page.evaluate(el => el.textContent, element);
//     // Вывод содержимого в консоль
//     console.log(textContent);
//     // Получение HTML-кода страницы
//     const htmlContent = await page.content();
//     console.log(typeof htmlContent);
//     let count=1;
//     // Определите путь к файлу, куда вы хотите сохранить HTML-код
//     filePath = path.join(process.cwd(), `html_fails/page${count}.txt`);
//     // Запись HTML-кода в файл
//     fs.writeFileSync(filePath, htmlContent);
//     console.log(`HTML-код сохранен в файл: ${filePath}`);
//     // Нажатие на элемент
//     await element.click();
//
//     count++;
//     // Определите путь к файлу, куда вы хотите сохранить HTML-код
//     filePath = path.join(process.cwd(), `html_fails/page${count}.txt`);
//     // Запись HTML-кода в файл
//     fs.writeFileSync(filePath, htmlContent);
//     console.log(`HTML-код сохранен в файл: ${filePath}`);
//     // Нажатие на элемент
//     await element.click();
//
// })();

(async () => {
    const browser = await puppeteer.launch({ headless: false, userDataDir: './tmp' });
    const page = await browser.newPage();
    await page.goto('https://www.elibrary.ru/author_items.asp?authorid=110&show_option=1&show_refs=1', { waitUntil: 'networkidle0' });

    let count = 1;
    while (count <= 17) { // Замените 2 на количество страниц, которые вы хотите сохранить
        // Получение содержимого элемента
        const element = await page.$('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a');
        const textContent = await page.evaluate(el => el.textContent, element);
        // Вывод содержимого в консоль
        console.log(textContent);
        // Получение HTML-кода страницы
        const htmlContent = await page.content();
        console.log(typeof htmlContent);
        // Определите путь к файлу, куда вы хотите сохранить HTML-код
        filePath = path.join(process.cwd(), `html_fails/page${count}.txt`);
        // Запись HTML-кода в файл
        fs.writeFileSync(filePath, htmlContent);
        console.log(`HTML-код сохранен в файл: ${filePath}`);
        // Нажатие на элемент
        await Promise.all([
            page.click('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        count++;
    }

    // await browser.close();
})();