const markdownpdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../docs/taxbot-documentation.md');
const outputFile = path.join(__dirname, '../docs/taxbot-documentation.pdf');

const options = {
  remarkable: {
    html: true,
    breaks: true,
    syntax: ['typescript', 'javascript']
  },
  cssPath: path.join(__dirname, 'pdf-style.css')
};

// Create the PDF
markdownpdf(options)
  .from(inputFile)
  .to(outputFile, function () {
    console.log('PDF generated successfully!');
  }); 