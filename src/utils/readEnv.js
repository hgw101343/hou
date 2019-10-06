const fs = require('fs');
const path = require('path')

module.exports = (file) => {
    let fileName = path.join(__dirname, file);
    let data = fs.readFileSync(fileName, { encoding: 'utf8'});
    let d = data.replace(/[​\u00a0\u1680​\u180e\u2000​\u2001\u2002​\u2003\u2004​ \u2005\u2006​\u2007\u2008​\u2009\u200a​\u2028\u2029​\u202f\u205f​\u3000]/g, '').replace(/\n|\r\n/g, ',')
    let arr = d.split(',').map(item=> item.split('='));
    let obj = {}
    arr.forEach(item => {
        obj[item[0]] = item[1]
    })
    return obj
}
