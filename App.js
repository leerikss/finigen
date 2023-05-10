// Example usage: node App.js --invoice 400101

import {Command} from 'commander'
import {InvoiceUtil} from "./InvoiceUtil.js";
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import dot from 'dot';
import { fileURLToPath } from 'url';

const FILE_PREFIX = 'lasku';

(async () => {
    try {
        // Parse command line arguments
        const options = parseArgs();

        // Input & output folders
        let inPath = (fs.existsSync('./in/data') && fs.existsSync('./in/template')) ? './in' : '.';
        let outPath = './out';

        // Parse YAML data
        console.log("Parsing YAML files from the '"+inPath+"/data' folder..")
        const invoice = parseYaml(inPath + '/data/invoices.yml')[options.invoice];
        const company = parseYaml(inPath + '/data/company.yml');
        const customer = parseYaml(inPath + '/data/customers.yml')[invoice.customer];

        // Process template
        console.log("Processing the '"+inPath+"/template/invoice.html' template file..")
        const html = processInvoiceTemplate(inPath+'/template/invoice.html', company,customer, invoice);

        // Copy template files
        console.log("Copying files from the '"+inPath+"/template' folder..")
        copyTemplateFiles(inPath, outPath, 'html');

        // Output invoice HTML file
        const companyName = company.name.replaceAll(/[^a-zA-Z0-9_]/g, '');
        const fileName = FILE_PREFIX + '_' + companyName + '_' +
            InvoiceUtil.getInvoiceNumber(customer.number, invoice.number);
        console.log("Writing '"+outPath+"/"+fileName+".html'..")
        fs.writeFileSync(outPath+'/'+fileName+'.html', html);

        // Generate invoice PDF from the HTML file
        console.log("Generating '"+outPath+"/"+fileName+".pdf'..")
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const htmlPath = path.join(__dirname, outPath + '/' + fileName+'.html');
        const pdfPath = outPath + '/' + fileName+'.pdf';
        await generatePdfFromHtml(htmlPath,pdfPath, options.Docker);

        console.log("All done:)")
    } catch (e) {
        console.error(e);
    }

})();

function parseArgs() {
    const program = new Command();
    program
        .option('--invoice <value>')
        .parse(process.argv);
    return program.opts();
}

function parseYaml(filePath) {
    const ymlCompany = fs.readFileSync(filePath, 'utf8')
    return YAML.parse(ymlCompany);
}

function processInvoiceTemplate(templateFile, company, customer, invoice) {

    // Prepare template
    const tpl = fs.readFileSync(templateFile, { encoding: 'utf8' } );
    const dotc = dot.template(tpl, {strip:false});

    const data = {
        "company": company,
        "customer": customer,
        "invoice": invoice,
        "iban": InvoiceUtil.getIban(company.iban),
        "totalSums": InvoiceUtil.getTotalSums(invoice.services),
        "invNr": InvoiceUtil.getInvoiceNumber(customer.number, invoice.number),
        "refNr": InvoiceUtil.getReferenceNumber(customer.number, invoice.number),
        "dueDate": InvoiceUtil.getDueDate(invoice.issued, invoice.termsDays),
        "comName": InvoiceUtil.getCompanyName(company.name)
    }

    return dotc(data);
}

function copyTemplateFiles(inPath, outPath, ignoreExtension) {
    // Copy files from template folder
    // fs.rmSync(OUT, { recursive: true, force: true });
    fs.cpSync(inPath + '/template', outPath, {
        recursive: true,
        force: true,
        filter(source) {
            return !source.endsWith(ignoreExtension);
        }
    })
}

async function generatePdfFromHtml(htmlPath, pdfPath) {

    // Create a browser instance
    const options = {
        headless: 'new'
    };
    // Hack to get puppeteer working inside Docker
    if(process.env.CHROME_BIN) {
        options.executablePath = process.env.CHROME_BIN;
        options.args = [ "--no-sandbox"];
    }
    const browser = await puppeteer.launch(options);

    // Open local HTML file
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath);

    // Generate PDF
    await page.pdf({
        path: pdfPath,
        //margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
        printBackground: true,
        format: 'A4',
    });

    // Close the browser instance
    await browser.close();
}