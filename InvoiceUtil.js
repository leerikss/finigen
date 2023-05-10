'use strict';

class InvoiceUtil {

    static validateServices(services) {
        if(!services.length) {
            throw "InvoiceUtil services[] is empty or undefined";
        }
        services.forEach(s => {
            if(typeof s.quantity !== 'number') {
                throw "InvoiceUtil service[n] must have a quantity";
            }
            if(typeof s.price !== 'number') {
                throw "InvoiceUtil service[n] must have a price";
            }
            if(typeof s.taxRate !== 'number' || s.taxRate < 10 || s.taxRate > 100) {
                throw "InvoiceUtil service[n] must have a taxRate between 10 and 100";
            }
        });

    }

    static getTotalSums(services) {
        this.validateServices(services);

        let sumTaxes = 0, sumExclTaxes = 0;

        services.forEach(service => {
            service.total = service.quantity * service.price;
            sumExclTaxes += service.total;
            sumTaxes += service.total * (service.taxRate/100);
        })
        return {
            sumExclTaxes: sumExclTaxes,
            sumTaxes: sumTaxes,
            sumInclTaxes: sumExclTaxes + sumTaxes
        }
    }

    static getSum
    static getInvoiceNumber(cusNr, iNr) {
        // Validate
        if(typeof cusNr !== 'number') {
            throw "Customer number in not a number"
        }
        if(typeof iNr !== 'number') {
            throw "InvoiceUtil number is not a number";
        }
        let invNr = ('' + cusNr + iNr).padStart(4,"0");
        if (invNr.length > 20) {
            throw "Customer and invoice number combined exceeds 20 numbers limit";
        }
        return invNr;
    }

    static getReferenceNumber(cusNr,iNr) {
        let invNr = this.getInvoiceNumber(cusNr, iNr);
        // Calculate checksum
        let m, sum = Array.from(invNr).reverse()
            .map(nr => {
                m = (m === 7) ? 3 : (m === 3) ? 1 : 7;
                return parseInt(nr) * m;
            })
            .reduce((a,b) => a + b, 0);
        let checkSum = 10 - (sum % 10);
        return invNr + checkSum; // String
    }

    static getIban(iban) {
        let i = iban.replaceAll(" ", "");
        if (i.length !== 18 || i.substring(0, 2) !== "FI") {
            throw "Company IBAN must be of format: 'FI' + 16 numbers";
        }
        return i;
    }

    static getDueDate(issued, termsDays) {
        if(issued.length !== 10 || issued.indexOf('-') === -1 || !Date.parse(issued)) {
            throw "InvoiceUtil issued date format must be of format yyyy-mm-dd";
        }
        if(new Date(issued).valueOf() < new Date().valueOf()) {
            throw "InvoiceUtil issued date cannot be in the past";
        }
        if(typeof termsDays !== 'number' || termsDays < 0) {
            throw "InvoiceUtil payment terms days must be > 0"
        }
        let dueDate = new Date(Date.parse(issued));
        dueDate.setDate(dueDate.getDate() + termsDays);
        return this.dateFormat_YYYY_MM_DD(dueDate);
    }

    static dateFormat_YYYY_MM_DD(date) {
        return date.getFullYear() + '-' +
            (''+(date.getMonth()+1)).padStart(2,'0') + '-' +
            (''+date.getDate()).padStart(2,'0');
    }

    static getCompanyName(comName) {
        if(!comName || comName.length < 2 || comName.length > 70) {
            throw "Company name length must be between 2 and 70";
        }
        return comName;
    }
}
export { InvoiceUtil };