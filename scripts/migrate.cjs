const enJson = require('./en.json')
const esJson = require('./es.json')
const ptJson = require('./pt.json')
const ruJson = require('./ru.json')
const trJson = require('./tr.json')
const viJson = require('./vi.json')
const zhCnJson = require('./zh-cn.json')
const zhTwJson = require('./zh-tw.json')
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2)
const zhCnDictory = {}
Object.keys(zhCnJson).forEach((key) => {
  if(!zhCnDictory[zhCnJson[key]]){
    zhCnDictory[zhCnJson[key]] = key
  } else {
    // 如果同一汉字匹配到多个则报错
    zhCnDictory[zhCnJson[key]] = null
  }
})

const data = [
  {
    resource:enJson,
    targetPath:path.join(__dirname,'../i18n/lang/en.json'),
  },
  {
    resource:esJson,
    targetPath:path.join(__dirname,'../i18n/lang/es.json'),
  },
  {
    resource:ptJson,
    targetPath:path.join(__dirname,'../i18n/lang/pt.json'),
  },
  {
    resource:ruJson,
    targetPath:path.join(__dirname,'../i18n/lang/ru.json'),
  },
  {
    resource:trJson,
    targetPath:path.join(__dirname,'../i18n/lang/tr.json'),
  },
  {
    resource:viJson,
    targetPath:path.join(__dirname,'../i18n/lang/vi.json'),
  },
  {
    resource: zhCnJson,
    targetPath:path.join(__dirname,'../i18n/lang/zh-cn.json'),
  },
  {
    resource:zhTwJson,
    targetPath:path.join(__dirname,'../i18n/lang/zh-tw.json'),
  }
]
args.forEach(i=>{
  const key = args[0] === 'key' ? i : zhCnDictory[i]
  if(key){
    data.forEach(el=>{
      const text = el.resource[key]
      const data  = fs.readFileSync(el.targetPath,'utf8')
      if(data){
        const origin = JSON.parse(data)
        if(!origin[key]){
          origin[key] = text
          fs.writeFileSync(el.targetPath,JSON.stringify(origin,null,2),'utf-8')
        } else {
          console.log("当前 key 已存在",key)
        }
      }
    })
  } else {
    console.log("不存在这个中文或者有多个相同中文:",i)
  }
})
