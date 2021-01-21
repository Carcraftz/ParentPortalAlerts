const fetch = require("node-fetch")
const cheerio = require("cheerio")
const util = require('util');
const config = require("./config")

module.exports = class ParentPortal {
  constructor() {
    this.cookie = "none";
    this.subjectdata = false
  }

  async login(username, password) {
    await fetch(config.baseurl+"/genesis/j_security_check", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      },
      "referrer": config.baseurl+"/genesis/sis/view?gohome=true",
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}`,
      "redirect": 'manual',
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    }).then(res => {
      console.log(res.status)
      let cookie = res.headers.get('set-cookie').split(";")[0];
      console.log(cookie)
      this.cookie = cookie
      console.log("req made")
      return res.text()
    }).then(text => {
      console.log(text)
      return true
    }).catch(err => {
      console.log(err)
    })
    return true;
  }
  async getGrades(studentid) {
    let finalres = {}
    console.log(this.cookie + "; lastvisit=C9CA16BD069040FBADB64A38D87F8C4A")
    let res = await fetch(config.baseurl+"/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=weeklysummary&action=form&studentid=" + studentid, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": this.cookie + "; lastvisit=972A1FFE7DD64E21B42D009660166915"
      },
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": null,
      "method": "GET",
      "mode": "cors"
    })
    console.log(res.status);
    let html = await res.text()
   // console.log(html)
    console.log("saving grades")
    let res2 = await this.saveGrades(html)

    console.log("got response")
    return res2


  }
  async saveGrades(html) {
    let $ = cheerio.load(html)
    let vals = []
    $(".list> tbody > tr > td ").each((index, element) => {
      let tdtext = $(element).text().replace(/(\r\n|\n|\r)/gm, "").trim();
      if (tdtext.includes("Email:")) {
        tdtext = tdtext.substring(0, tdtext.length - 6).trim();
      }
      //console.log(tdtext)
      vals.push(tdtext)
    });
    let subjects = this.splitArrayIntoChunksOfLen(vals, 8)
    subjects.shift()
    //console.log(subjects)
    console.log("Loading data for " + subjects.length + " subjects")
    let newdata = []
    subjects.forEach(subject => {
      newdata.push({
        class: subject[0],
        teacher: subject[1],
        grade: subject[2]
      })
    })
    return newdata;
  }
  splitArrayIntoChunksOfLen(arr, len) {
    var chunks = [], i = 0, n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
    return chunks;
  }
}

