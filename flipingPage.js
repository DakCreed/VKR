import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";


puppeteer.use(StealthPlugin());


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.elibrary.ru/author_items.asp?authorid=946893&show_option=1&show_refs=3', { waitUntil: 'networkidle0' });

    // const rightPanel = await page.$('.right-panel');
    //
    // const result = await page.evaluate(() => {
    //     const element = document.querySelector('.right-panel');
    //     return element.className;
    // });
    // console.log(result);

    // Найдите элемент div с классом right-panel
    const rightPanel = await page.$('.right-panel>a');

    // // Найдите все элементы <a> внутри right-panel
    // const links = await rightPanel.$$('a');
    //
    // // Переберите все найденные элементы <a> и найдите тот, который содержит искомый текст
    // let y = null;
    // for (let link of links) {
    //     const textContent = await page.evaluate(el => el.textContent, link);
    //     if (textContent.trim() === 'Следующая страница') {
    //         y = link;
    //         break;
    //     }
    // }
    //
    // // Проверьте, что элемент был найден
    // if (y) {
    //     console.log('Элемент найден');
    //     // Если нужно, вы можете выполнить какие-либо действия с элементом
    //     // Например, нажать на элемент
    //     console.log(y)
    //     await y.click();
    // } else {
    //     console.log('Элемент не найден');
    // }

})();