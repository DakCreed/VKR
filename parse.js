import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';

// Использование плагина Stealth
puppeteer.use(StealthPlugin());

let loadHtml;
async function getPageContent(url) {
    // Запустить браузер
    const browser = await puppeteer.launch();
    // Открыть новую страницу
    const page = await browser.newPage();
    // Перейти на страницу
    await page.goto(url);
    // Получить HTML-код страницы
    const content = await page.content();
    // Закрыть браузер
    await browser.close();
    // Вернуть HTML-код
    return content;
}

// Использование функции
(async () => {
     const loadHtml = await getPageContent('https://elibrary.ru/author_items.asp?authorid=790792&show_option=1&show_refs=1');
    if (loadHtml) {
        try {
            await fs.writeFile('content.txt', loadHtml, 'utf8');
            console.log('Содержимое сохранено в content.txt');
        } catch (error) {
            console.error('Ошибка при сохранении файла:', error);
        }
    }
     console.log(loadHtml);
})();

