FROM node:18

# Taken from: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
#   Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
#   Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
#   installs, work.
ENV CHROME_BIN "/usr/bin/google-chrome"
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY data ./
COPY template ./

# Install
RUN npm install

# Execution command - using shell to be able to forward the invoice argument
COPY . .
CMD [ "sh", "-c", "node App.js --invoice ${invoice}" ]