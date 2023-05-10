(function(win) {

    let Invoice = {"barcodeId": "payment-details__barcode", "QRCodeId": "payment-details__qrcode"};

    let zeroPad = function(val,num) {
        return (""+val).padStart(num,"0");
    };

    let getBarcode = function(iban, sum, refNr, dueDate) {
        iban = iban.replace("FI", "");
        let eur = zeroPad(sum.substring(0,sum.length-3), 6);
        let cen = sum.substring(sum.length-2);
        refNr = zeroPad(refNr, 23);
        let y = dueDate.substring(2,4);
        let m = dueDate.substring(5,7);
        let d = dueDate.substring(8,10);
        return "4" + iban + eur + cen + refNr + y + m + d;
    }

    let getQRCode = function(bic, iban, sum, cusDesc, refNr, dueDate) {
        return "BCD\n" + "001\n" + "1\n" + "SCT\n" + bic+"\n" + cusDesc+"\n" + iban+"\n" +
            "EUR" + sum + "\n" +
            "\n" +
            refNr + "\n" +
            "\n" +
            "ReqdExctnDt/" + dueDate;
    }

    Invoice.generateCodes = function(bic,iban,sum,refNr,dueDate,comName) {

        sum = Number.parseFloat(sum).toFixed(2);

        JsBarcode(
            "#"+Invoice.barcodeId,
            getBarcode(iban, sum, refNr, dueDate), {
                width: 1.95,
                height: 60
            });

        new QRCode(
            document.getElementById(Invoice.QRCodeId), {
                text: getQRCode(bic, iban, sum, comName, refNr, dueDate),
                width: 125,
                height: 125
            });
    }

    win["Invoice"] = Invoice;

})(window);