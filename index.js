const puppeteer = require('puppeteer');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const numero = '' //LLENAR ESTO CON EL NUMERO AL QUE SE QUIERA MANDAR

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
    main();
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

function main() {
    setInterval(async () => {
        const browser = await puppeteer.launch({
            headless: false,
            args: [`--window-size=1920,1080`],
        });
        try {
            const page = await browser.newPage();
            page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 0.3,
            });
            await page.goto('https://ais.usvisa-info.com/es-ar/niv/users/sign_in');
            await delay(2000);
            await page.type('#user_email', 'lucaseceiza@outlook.com');
            await page.type('#user_password', 'lucaseceiza12');
            await page.click('#policy_confirmed');
            await page.click('#new_user > p:nth-child(8) > input');
            await delay(5000);
            await page.goto('https://ais.usvisa-info.com/es-ar/niv/schedule/43886158/continue');
            await delay(2000);
            let res = await page.evaluate(() => {
                window.scroll(0, 500);
                if (document.querySelector('#consulate_date_time_not_available') === null) {
                    return true
                } else {
                    return false
                }
            });
            if (res) {
                await delay(2000);
                try {
                    let res = await page.evaluate(async () => {
                        let h1 = document.querySelector('body > center:nth-child(1) > h1');
                        if (h1.innerHTML !== '429 Too Many Requests') {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (res) {
                        console.log('Turno');
                        await client.sendMessage(numero, 'Hay turno disponible bro');
                        await page.screenshot({ path: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` });
                    } else {
                        console.log('Too Many Request');
                        await browser.close();
                    }
                } catch (error) {
                    console.log(error);
                    await page.screenshot({ path: `errores/${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` });
                    await browser.close();
                }
            } else {
                await browser.close();
            }
        } catch (error) {
            console.log(error);
            await page.screenshot({ path: `errores/${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` });
            await browser.close();
        }
    }, 30000);
};