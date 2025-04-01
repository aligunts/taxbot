const fs = require("fs"); const path = require("path"); const filePath = path.join(__dirname, "../src/components/Chat.tsx"); let content = fs.readFileSync(filePath, "utf8"); content = content.replace(`import {
  calculatePersonalIncomeTax,
  calculatePAYE,
  calculateCompanyIncomeTax,
  calculateCapitalGainsTax,
  formatTaxResults
} from "../utils/taxCalculations";`, `import {
  calculatePersonalIncomeTax,
  calculatePAYE,
  calculateCompanyIncomeTax,
  calculateCapitalGainsTax,
  formatTaxResults,
  TaxationMethod
} from "../utils/taxCalculations";`); fs.writeFileSync(filePath, content, "utf8");
