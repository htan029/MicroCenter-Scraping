const puppeteer = require('puppeteer');

class Product {
    constructor(){
        this.title = "unknow";
        this.model = "unknow";
        this.price = 0;
        this.stock = "unknow";
        this.memerySize = "unknow";
    }

    

    fromTitleToModel() {
        if (this.title.includes("3090")) this.model = "3090";
        if (this.title.includes('3080')) {
            if (this.title.includes('Ti')) {
                this.model = '3080 Ti';
            } else {
                this.model = '3080';
            }
        } 
        if (this.title.includes('3070')) {
            if (this.title.includes('Ti')) {
                this.model = '3070 Ti';
            } else {
                this.model = '3070';
            }
        }
        if (this.title.includes('3060')) {
            if (this.title.includes('Ti')) {
                this.model = '3060 Ti';
            } else {
                this.model = '3060';
            }
        }
        if (this.title.includes('3050')) {
            if (this.title.includes('Ti')) {
                this.model = '3050 Ti';
            } else {
                this.model = '3050';
            }
        }
    }

    fromTitleToMemery() {
        if (this.title.includes("3GB")) this.memerySize = "3GB";
        if (this.title.includes("4GB")) this.memerySize = "4GB";
        if (this.title.includes("5GB")) this.memerySize = "5GB";
        if (this.title.includes("6GB")) this.memerySize = "6GB";
        if (this.title.includes("8GB")) this.memerySize = "8GB";
        if (this.title.includes("10GB")) this.memerySize = "10GB";
        if (this.title.includes("12GB")) this.memerySize = "12GB";
        if (this.title.includes("14GB")) this.memerySize = "14GB";
        if (this.title.includes("16GB")) this.memerySize = "16GB";
        if (this.title.includes("18GB")) this.memerySize = "18GB";
        if (this.title.includes("20GB")) this.memerySize = "20GB";
        if (this.title.includes("22GB")) this.memerySize = "22GB";
        if (this.title.includes("24GB")) this.memerySize = "24GB";
    }

    get titleI() { return this.title; }
    get modelI() { return this.model; }
    get priceI() { return this.price; }
    get stockI() { return this.stock; }
    get memerySizeI() { return this.memerySize; }

    set titleI(title) { this.title = title; };
    set modelI(model) { this.model = model; }; 
    set priceI(price) { this.price = price; };
    set stockI(stock) { this.stock = stock; };
    set memerySizeI(memerySize) { this.memerySize = memerySize; };
}

let titles;
let prices;
let stocks;

async function scrapeProduct(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    titles = await new Array();
    prices = await new Array();
    stocks = await new Array();
    const [el] = await page.$x('//*[@id="productGrid"]/ul');
    var temp = await page.$$eval('.product_wrapper .detail_wrapper a', elements=> elements.map(item=>item.textContent));
    for (let i = 0; i < temp.length; i++) {
        await titles.push(temp[i]);
    }
    prices = await page.$$eval('.product_wrapper .price_wrapper .price span', elements=> elements.map(item=>item.textContent));
    for (let i = 0; i < temp.length; i++) {
        await prices.push(temp[i]);
    }
    stocks = await page.$$eval('.product_wrapper .detail_wrapper .stock', elements=> elements.map(item=>item.textContent));
    for (let i = 0; i < temp.length; i++) {
        await stocks.push(temp[i]);
    }

    browser.close();
}


async function fetchData() {
    await scrapeProduct('https://www.microcenter.com/search/search_results.aspx?Ntk=all&sortby=match&N=4294808776&myStore=false&storeid=101&rpp=96');
    // console.log(titles);
    const products = [];
    
    //prefeb
    for (let i = 0; i < titles.length; i++) {
        let product = new Product();
        product.titleI = titles[i];
        product.fromTitleToModel(); 
        product.fromTitleToMemery();
        products.push(product);
    }

    for (let i = 0; i < await prices.length;) {
        if (await prices[i].length == 1 || await prices[i].length > 10) {
            await prices.splice(i,1);
        } else {
            prices[i] = await prices[i].replace('$', '');
            prices[i] = await prices[i].replace(',', '');
            products[i].priceI = await Number(prices[i]);
            i++;
        }
    }
    for (let i = 0; i < stocks.length;) {
        if (!stocks[i].includes("IN STOCK") && !stocks[i].includes("SOLD OUT")){
            stocks.splice(i,1);
        } else {
            if (stocks[i].includes("IN STOCK")) {
                stocks[i] = "IN STOCK";
            } else {
                stocks[i] = "SOLD OUT";
            }
            products[i].stockI = stocks[i];
            i++;
        }
    }
    // for (let i = 0 ;i < products.length; i++) {
    //     console.log(products[i].modelI + "    " + products[i].priceI + "   " + products[i].stockI + "   " + products[i].memerySizeI);
    // }
    return products;
}


async function printData() {
    await console.clear();
    const products = await fetchData();
    const all_products_name = await ["3090", "3080 Ti", "3080", "3070 Ti", "3070", "3060 Ti", "3060", "3050"];
    for (let i = 0; i < await all_products_name.length; i++) {
        let high = await 0;
        let low = await Number.MAX_VALUE;
        let lowerInStock = await Number.MAX_VALUE;
        let lowerInStockName = await "Unknow";
        for (let j = 0; j < await products.length; j++) {
            if (await products[j].modelI == await all_products_name[i]) {
                if (await products[j].priceI > await high) high = await products[j].priceI;
                if (await products[j].priceI < await low) low = await products[j].priceI;
                if (await products[j].stockI == await "IN STOCK" && await products[j].priceI < await lowerInStock) {
                    lowerInStock = await products[j].priceI;
                    lowerInStockName = await products[j].titleI;
                } 
            }
        }

        //print
        await console.log("\x1b[93m" + (await all_products_name[i] + ":").padEnd(9) + "\x1b[91m" + await high + " \x1b[34m<--> \x1b[92m" + await low);
        if (lowerInStock != Number.MAX_VALUE) {
            console.log("\x1b[33mLowest in stock: \x1b[32m" + lowerInStock + "  \x1b[0mName: " + lowerInStockName);
        }
    }
}


async function main() {
    await setInterval(await printData, 60000);
}

main();