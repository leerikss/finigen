# FIN Invoice Generator

Generates a PDF (and HTML) invoice meeting Finnish invoice requirements.<br>
The invoice data is separated into YAML files, and the styling can be configured 
via Front-End code (HTML/CSS/JS/images).

![Alt text](screenshot.png?raw=true "finigen screenshot")

## Install

### Option 1: npm
~~~shell
npm install
~~~

### Option 2: docker
~~~shell
docker build . -t finigen
~~~

## Customize
Create a new folder named "in", copy the data/ and the template/ folders inside it, and customize the copied files
to your liking. The in/ folder is git ignored.
~~~shell
mkdir -p in
cp -rf data in
cp -rf template in
~~~

## Execute
### Option 1 a: npm
~~~shell
npm start <invoice key>
~~~

### Option 1 b: node
~~~shell
node App.js --invoice <invoice key>
~~~

### Option 2: docker
~~~shell
docker run -e invoice=<invoice key> -v ./in:/app/in -v ./out:/app/out finigen
~~~

### Mandatory arguments
**--invoice \<value\>** - must match an existing key in the data/invoices.yaml file

## Output folder
The invoice files (HTML,PDF etc.) will be generated into a new folder named "out".
The out/ folder is git ignored.

## Credits
- HTML to PDF conversion: https://pptr.dev/
- QR code generation: https://davidshimjs.github.io/qrcodejs/
- Barcode generation: https://lindell.me/JsBarcode/
- doT template engine: https://olado.github.io/doT/index.html
- YAML parsing: https://www.npmjs.com/package/yaml
- Background image Photo by mrish_marina_alekseevna from Pexels: https://www.pexels.com/photo/abstract-blue-painting-6563423/
- Example logo: https://app.logo.com/

## Links
- https://www.yrittajat.fi/tietopankki/markkinointi-ja-myynti/laskutus/
- https://www.finanssiala.fi/wp-content/uploads/2021/03/QR_koodin_kaytto_tilisiirtolomakkeella.pdf
- https://www.finanssiala.fi/wp-content/uploads/2021/03/Pankkiviivakoodi-opas.pdf
