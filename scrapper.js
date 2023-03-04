// // Import dependencies
// const express = require('express');
// const axios = require('axios');
// const cheerio = require('cheerio');

// // Create express router
// const router = express.Router();

// // Route handler for "/generate/:link"
// router.get('/generate/:link', async (req, res) => {
//   try {
//     // URL to scrape
//     const url = 'https://gdurl.com/';

//     // Get link parameter from request
//     const { link } = req.params;

//     // Make HTTP request to the URL with the link parameter as data
//     const response = await axios.post(url, { url: link });

//     // Load HTML into cheerio
//     const $ = cheerio.load(response.data);

//     // Find the form input field and button
//     const form = $('form[action="/create"]')
//     const input = form.find('input[name="url"]');
//     const button = form.find('button[type="submit"]');

//     // Set the value of the input field to the generated link
//     input.val($('a.generated-link').attr('href'));

//     // Make HTTP POST request to create the permanent link
//     const createResponse = await axios.post(url + 'create', form.serialize());

//     // Load HTML into cheerio
//     const $$ = cheerio.load(createResponse.data);
//     // Find the generated permanent link
//     const permanentLink = $$('a.generated-link').attr('href');
//     console.log(">>>>>>>",$$,permanentLink);

//     // Return the generated permanent link as the response
//     res.send(permanentLink);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// // Export router
// module.exports = router;



// const axios = require('axios');
// const cheerio = require('cheerio');

// async function scrape() {
//   const url = 'https://gdurl.com/1hsZM/stats';
//   const response = await axios.get(url);
//   const $ = cheerio.load(response.data);
//   const downloads = $('#file-stats-downloads .file-stats-value').text().trim();
//   console.log(`Total downloads: ${downloads}`);
// }

// scrape();


const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
  const url = 'https://gdurl.com/1hsZM/stats';
  const response = await axios.get(url);
  const selTool= cheerio.load(response.data);

  // const inputFields = $('input[type="url"]').toArray().map(input => ({
  //   name: $(input).attr('name'),
  //   value: $(input).val()
  // }));
  // console.log(`Input fields with type='url': ${$}`);

  const loadData=selTool("#paige-inner a")
  console.log(">>>>>",loadData+"........");
}

scrape();