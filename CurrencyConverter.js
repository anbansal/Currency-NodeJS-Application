var request = require("request");
var cTable = require('console.table');
var BASE_URL = 'https://currency-converter5.p.rapidapi.com';
var BASE_CUR = 'USD'
var API_KEY = 'YOUR_KEY_GOES_HERE'
var options = {
    method: 'GET',
    qs: { format: 'json', to: 'USD', from: BASE_CUR, amount: '1' },
    headers: {
        'x-rapidapi-host': 'currency-converter5.p.rapidapi.com',
        'x-rapidapi-key': API_KEY
    }
};
function currencyConverter(temp){
    let tempObj = {}
    tempObj['Base Currency'] = BASE_CUR
    tempObj['Foreign Currency'] = Object.keys(temp.rates)[0]
    tempObj['Foreign Currency Name'] = Object.values(temp.rates)[0].currency_name
    tempObj['Foreign Currency Value'] = Object.values(temp.rates)[0].rate
    return tempObj
}
function parseCurrencies(obj) {
    const currenciesCode = Object.keys(obj.currencies)
    return currenciesCode.map(x => {
        options.url = BASE_URL + '/currency/convert'
        options.qs.to = x
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                let data = JSON.parse(body)
                if (data.status !== 'success') {
                    reject(data);
                }
                else {
                    resolve(data);
                }
            })
        })

    })
}
(() => {
    options.url = BASE_URL + '/currency/list';
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            let data = JSON.parse(body)
            if (data.status !== 'success') {
                reject(data);
            }
            else {
                resolve(data);
            }
        })
    })
}
)()
    .then(data => parseCurrencies(data))
    .then(promises => Promise.all(promises)
        .then((datas) => datas.map(data => currencyConverter(data)))
        .then((dataObjs) => {
            let table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 50, 100, 1000, 10000]
            console.table(dataObjs.filter(value => value['Foreign Currency Value'] < table[0]))
            for (let i = 1; i < table.length; i++) {
                dataObjsMatch = dataObjs.filter(value => value['Foreign Currency Value'] >= table[i - 1] && value['Foreign Currency Value'] < table[i])
                if (dataObjsMatch.length > 0) {
                    console.table(dataObjsMatch)
                }
            }
            console.table(dataObjs.filter(value => value['Foreign Currency Value'] >= table[table.length - 1]))
        })
    )
