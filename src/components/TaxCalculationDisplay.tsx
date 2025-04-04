import React from "react";

type TaxCalculationDisplayProps = {
  vatInclusiveAmount?: string;
  priceBeforeVAT?: string;
  vatAmount?: string;
  vatRate?: string;
  vatTotal?: string;
  annualTurnover?: string;
  taxRate?: string;
  taxAmount?: string;
  calculationType: "vat-inclusive" | "vat-exclusive" | "company-income-tax";
};

const TaxCalculationDisplay: React.FC<TaxCalculationDisplayProps> = ({
  vatInclusiveAmount,
  priceBeforeVAT,
  vatAmount,
  vatRate = "7.5%",
  vatTotal,
  annualTurnover,
  taxRate,
  taxAmount,
  calculationType,
}) => {
  // Format numerics with commas
  const formatNumber = (num: string | undefined) => {
    if (!num) return "";
    const parsed = parseFloat(num.replace(/[₦,]/g, ""));
    return isNaN(parsed)
      ? num
      : parsed.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const formattedVatInclusiveAmount = formatNumber(vatInclusiveAmount);
  const formattedPriceBeforeVAT = formatNumber(priceBeforeVAT);
  const formattedVatAmount = formatNumber(vatAmount);
  const formattedVatTotal = formatNumber(vatTotal);
  const formattedAnnualTurnover = formatNumber(annualTurnover);
  const formattedTaxAmount = formatNumber(taxAmount);

  // Convert rate string to decimal
  const getDecimalRate = (rate: string) => {
    const num = parseFloat(rate.replace("%", "")) / 100;
    return num.toString();
  };

  let display = "";

  if (calculationType === "vat-inclusive") {
    display = `----------------------------------------
VAT CALCULATION – NIGERIA 🇳🇬

Given:
VAT-inclusive price: ₦${formattedVatInclusiveAmount}

Calculation Steps:
1. Let P be the price before VAT.
2. VAT-inclusive price = P + ${vatRate} × P
3. Therefore: ${parseFloat(getDecimalRate(vatRate)) + 1} × P = ₦${formattedVatInclusiveAmount}
4. Solve for P:
   P = ₦${formattedVatInclusiveAmount} ÷ ${parseFloat(getDecimalRate(vatRate)) + 1} = ₦${formattedPriceBeforeVAT}

Breakdown:
- VAT-inclusive Amount: ₦${formattedVatInclusiveAmount}
- Price before VAT:     ₦${formattedPriceBeforeVAT}
- VAT Amount:           ₦${formattedVatAmount}

Verification:
₦${formattedPriceBeforeVAT} + ₦${formattedVatAmount} = ₦${formattedVatInclusiveAmount}
----------------------------------------`;
  } else if (calculationType === "vat-exclusive") {
    display = `----------------------------------------
VAT CALCULATION – NIGERIA 🇳🇬

Given:
Price before VAT: ₦${formattedPriceBeforeVAT}

Calculation Steps:
1. VAT = ₦${formattedPriceBeforeVAT} × ${getDecimalRate(vatRate)} = ₦${formattedVatAmount}
2. Total = Price + VAT = ₦${formattedPriceBeforeVAT} + ₦${formattedVatAmount} = ₦${formattedVatTotal}

Breakdown:
- Price before VAT:     ₦${formattedPriceBeforeVAT}
- VAT Amount:           ₦${formattedVatAmount}
- VAT-inclusive Total:  ₦${formattedVatTotal}
----------------------------------------`;
  } else if (calculationType === "company-income-tax") {
    display = `----------------------------------------
COMPANY INCOME TAX – NIGERIA 🇳🇬

Given:
Annual Turnover: ₦${formattedAnnualTurnover}

Calculation Steps:
1. Tax Rate: ${taxRate}
2. Tax = ₦${formattedAnnualTurnover} × ${getDecimalRate(taxRate || "0%")} = ₦${formattedTaxAmount}

Breakdown:
- Turnover:     ₦${formattedAnnualTurnover}
- Tax Rate:     ${taxRate}
- Tax Payable:  ₦${formattedTaxAmount}
----------------------------------------`;
  }

  return (
    <div className="font-mono text-sm bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
      {display}
    </div>
  );
};

export default TaxCalculationDisplay;
