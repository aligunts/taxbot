const fs = require("fs"); const path = require("path"); const filePath = path.join(__dirname, "src/components/Chat.tsx"); let content = fs.readFileSync(filePath, "utf8"); const includePensionPosition = content.indexOf("const includePension"); const beforeResult = content.indexOf("let result;", includePensionPosition); content = content.slice(0, beforeResult) + "
    // Determine taxation method based on query
    let taxMethod = TaxationMethod.Progressive; // Default to progressive taxation
    
    if (lowercaseQuery.includes(\"progressive\") || 
        lowercaseQuery.includes(\"graduated\") || 
        lowercaseQuery.includes(\"bracket\")) {
      taxMethod = TaxationMethod.Progressive;
    } 
    else if (lowercaseQuery.includes(\"flat rate\") || 
             lowercaseQuery.includes(\"flat tax\") || 
             lowercaseQuery.includes(\"single rate\") ||
             lowercaseQuery.includes(\"fixed rate\")) {
      taxMethod = TaxationMethod.FlatRate;
    }
    else if (lowercaseQuery.includes(\"proportional\") || 
             lowercaseQuery.includes(\"same percentage\") ||
             lowercaseQuery.includes(\"constant rate\") ||
             lowercaseQuery.includes(\"equal rate\")) {
      taxMethod = TaxationMethod.Proportional;
    }
    else if (lowercaseQuery.includes(\"regressive\") || 
             lowercaseQuery.includes(\"reverse progressive\") ||
             lowercaseQuery.includes(\"decreasing rate\")) {
      taxMethod = TaxationMethod.Regressive;
    }
" + content.slice(beforeResult); fs.writeFileSync(filePath, content, "utf8"); console.log("Added taxation method detection code");
