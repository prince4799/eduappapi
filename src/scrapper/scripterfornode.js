/*const puppeteer = require('puppeteer');

(async () => {
    //   const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
        executablePath: `/usr/bin/google-chrome`,
        //...
    });
    const page = await browser.newPage();
    await page.goto('https://www.wix.com');
    const elem = await page.evaluate(() => {
        document.getElementsByClassName('c')[1].getElementsByTagName("button")[0].click()
        console.log(">>>>",document.getElementsByClassName('c')[1].getElementsByTagName("button")[0].click());
    })
    await browser.close();
})();
*/

//=============================================================================================

/*const puppeteer = require('puppeteer');

async function runScriptOnPage(url, script) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const result = await page.evaluate(script);

    await page.waitForNavigation();
    const pageTitle = await page.title();
    console.log(">>>>>>>>>>",pageTitle);
    await browser.close();
    return result;
}



const url = 'https://gdurl.com/';
const script1 = () => {
    const URL = "https://drive.google.com/file/d/1JDjOW7Yp0i7qD6jXkT00XyIfN5BPQgpp/view?usp=share_link"
    const elem = document.getElementById("url");
    console.log(elem)
    return elem.value = URL;

    // if (elem) {
    //   return  document.getElementsByClassName('c')[1].getElementsByTagName("button")[0].click()
    //    currentUrl =  page.url();
    //    console.log(`Current URL: ${currentUrl}`);
    //    return currentUrl;
    // }
};


const script2 = () => {
    return document.getElementsByClassName('c')[1].getElementsByTagName("button")[0].click()
};



runScriptOnPage(url, script1).then((result) => {
    if (result) {
        runScriptOnPage(url, script2).then((result) => {
            console.log("result for script2", result);
        }).catch((err) => { console.error("error for script2", err) })
    }
    console.log("result", result);
}).catch((error) => {
    console.error("error for script1", error);
});
*/


//========================================================================================

/*const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://gdurl.com/');

    // Fill the input with a URL
    const URL = "https://drive.google.com/file/d/1JDjOW7Yp0i7qD6jXkT00XyIfN5BPQgpp/view?usp=share_link"

    await page.type('#url', URL);

    // Click the "Create Permanent Link" button
    Promise.all([
        page.waitForNavigation(),

        await page.waitForSelector('div.c'),
        //    await page.$('div.c button').click(),
        console.log(">>>>>", await page.$('div.c ')),
        // await button.click();
        await page.evaluate(() => {
            const buttons = document.getElementsByClassName('c')[1].getElementsByTagName('button');
            buttons[0].click();
        }),
    ]);

    await page.waitForNavigation();

    // Check if the new page is loaded successfully
    const pageTitle = await page.title();
    console.log(">>>>>>", pageTitle);
    const newTitle = 'Direct Permalinks for Google Drive '
    if (pageTitle.includes(newTitle)) {
        console.log('New page loaded successfully');
        // Run another script on the new page
        await page.waitForFunction(() => {
            const el = document.querySelector('#created input[type="url"]');
            console.log('#created input[type="url"] element found', el);

            return el && el.value !== '';
        }, { timeout: 10000 }).catch(() => page.waitForTimeout(5000)),
            console.log('#created input[type="url"] element found1');

        // await page.waitForTimeout(5000);
        const shortlink = await page.$eval('#created input[type="url"]', el => el.value);
        console.log('#created input[type="url"] element found2', shortlink);




        // await page.evaluate(() => {
        //     console.log('evaluating');
        //     // Code to run on the new page
        //     //    shortlink=document.getElementById('created').getElementsByTagName('input')[4].value
        //     shortlink = document.getElementById('created').getElementsByTagName('input')[4].value

        //     console.log(">>", shortlink)
        // });
    }
    await browser.close();
})();
*/


const puppeteer = require('puppeteer');

async function createPermanentLink(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://gdurl.com/');

  // Fill the input with a URL
  await page.type('#url', url);

  // Click the "Create Permanent Link" button
  await Promise.all([
    page.waitForNavigation(),
    page.click('div.c button'),
  ]);

  // Wait for the new page to load
  await page.waitForSelector('#created input[type="url"]');

  // Get the shortlink
  const shortlink = await page.$eval('#created input[type="url"]', el => el.value);

  await browser.close();

  return shortlink;
}

// Export the function for use in other modules
module.exports = createPermanentLink;
