const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

const pportal = require("./parentportal")
const config = require("./config")
const pp = new pportal
const accountSid = config.twilliosid;
const authToken = config.twilliotoken;
const client = require('twilio')(accountSid, authToken);
let oldgrades = []
function refresh(){
    pp.getGrades("106483").then(res => {
      if (oldgrades.length == 0) {
        oldgrades = res
        
      }
      console.log("test")
      oldgrades.forEach(grade => {
        let percent1 = parseFloat(grade.grade.substring(0, grade.grade.length - 1))
        let class1 = grade.class
        console.log(res)
        res.forEach(newgrade => {
          let percent2 = parseFloat(newgrade.grade.substring(0, newgrade.grade.length - 1))
          let class2 = newgrade.class
          if (class1 == class2) {
            if (percent1 != percent2 && !isNaN(percent1)) {
              console.log("Grade in class: " + class1 + " chaned")
              client.messages.create({
                body: "Grade in "+class1+" changed from "+percent1+"% to "+percent2+"%",
                from: config.smsfrom,
                to: config.smsto
              })
                .then(message => console.log(message.sid));
                oldgrades = res
            }
          }
        })
      })

    }).catch(e => {
      console.log(e)
    })
  

}
//login and check at startup
pp.login(config.ppusername, config.pppassword).then(data=>{
refresh()
})

//check on refreshinterval
setInterval(refresh,config.refreshinterval)

//grab a new login token every 30 minutes
setInterval(loginbot=>{
  pp.login(config.ppusername, config.pppassword)
},180000)
