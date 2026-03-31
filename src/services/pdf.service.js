import puppeteer from "puppeteer";

/**
 * Service to generate a PDF from the React frontend URL.
 * Requires the frontend to have a special print route, e.g., /resume/:id/print
 */
export const generatePdfFromUrl = async (url) => {
  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Navigate to the print-only version of the resume
    await page.goto(url, { waitUntil: "networkidle0" });

    // Emulate media type for css @media print
    await page.emulateMediaType("print");

    // Generate PDF Buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // required to show Tailwind backgrounds
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      scale: 1, // 1:1 scale
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Puppeteer Export Error:", error);
    throw new Error("Failed to generate PDF from URL");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
