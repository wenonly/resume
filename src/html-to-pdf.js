const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

/**
 * Convert HTML content to PDF file
 * @param {string} htmlContent - The HTML content to convert
 * @param {object} options - Configuration options for PDF generation
 * @param {string} options.outputPath - Path where the PDF file will be saved
 * @param {string} [options.executablePath] - Path to Chrome/Chromium executable
 * @param {string} [options.format='A4'] - Page format (A4, Letter, etc.)
 * @param {boolean} [options.landscape=false] - Page orientation
 * @param {number} [options.scale=1] - Scale of the webpage rendering
 * @param {boolean} [options.printBackground=false] - Print background graphics
 * @param {object} [options.margin] - Page margins
 * @param {string} [options.margin.top] - Top margin
 * @param {string} [options.margin.right] - Right margin
 * @param {string} [options.margin.bottom] - Bottom margin
 * @param {string} [options.margin.left] - Left margin
 * @param {string} [options.headerTemplate] - HTML template for the print header
 * @param {string} [options.footerTemplate] - HTML template for the print footer
 * @param {boolean} [options.displayHeaderFooter=false] - Whether to display header and footer
 * @param {string} [options.pageRanges] - Paper ranges to print
 * @returns {Promise<string>} Path to the generated PDF file
 */
async function convertHtmlToPdf(htmlContent, options) {
    // Create temporary HTML file
    const tmpDir = path.dirname(options.outputPath);
    const tmpHtmlPath = path.join(tmpDir, `tmp_${Date.now()}.html`);
    fs.writeFileSync(tmpHtmlPath, htmlContent);

    try {
        // Launch browser
        const browser = await puppeteer.launch({
            executablePath: options.executablePath || await puppeteer.executablePath(),
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setDefaultTimeout(0);
        await page.goto(`file://${tmpHtmlPath}`, { waitUntil: 'networkidle0' });

        // Prepare PDF options
        const pdfOptions = {
            path: options.outputPath,
            scale: options.scale || 1,
            displayHeaderFooter: options.displayHeaderFooter || false,
            headerTemplate: options.headerTemplate || '',
            footerTemplate: options.footerTemplate || '',
            printBackground: options.printBackground || false,
            landscape: options.landscape || false,
            pageRanges: options.pageRanges || '',
            format: options.format || 'A4',
            margin: {
                top: options.margin?.top || '',
                right: options.margin?.right || '',
                bottom: options.margin?.bottom || '',
                left: options.margin?.left || ''
            }
        };

        // Generate PDF
        await page.pdf(pdfOptions);
        await browser.close();

        // Clean up temporary file
        fs.unlinkSync(tmpHtmlPath);

        return options.outputPath;
    } catch (error) {
        // Clean up temporary file in case of error
        if (fs.existsSync(tmpHtmlPath)) {
            fs.unlinkSync(tmpHtmlPath);
        }
        throw error;
    }
}

module.exports = convertHtmlToPdf;