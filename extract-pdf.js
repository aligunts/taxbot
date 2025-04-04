const fs = require("fs");
const pdf = require("pdf-parse");

const dataBuffer = fs.readFileSync("./FIRS Taxes_ Nigeria Comprehensive Guide_.pdf");

pdf(dataBuffer)
  .then(function (data) {
    // Number of pages
    console.log("Total pages: " + data.numpages);

    // Get first 10000 characters of text
    const excerpt = data.text.substring(0, 10000);
    console.log("Excerpt: \n" + excerpt);

    // Write the full text to a file for easier analysis
    fs.writeFileSync("firs-tax-guide-text.txt", data.text);
    console.log("Full text written to firs-tax-guide-text.txt");
  })
  .catch(function (error) {
    console.log(error);
  });
