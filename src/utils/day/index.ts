import dayjs from 'dayjs'
import * as C  from './unit'
import 'dayjs/locale/zh'
import 'dayjs/locale/zh-tw'
import 'dayjs/locale/en'

import relativeTime from 'dayjs/plugin/relativeTime'
import  updateLocale from 'dayjs/plugin/updateLocale'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(relativeTime,{
  thresholds:[{
    l: 's',
    r: 59,
    d: C.S
  }, {
    l: 'm',
    r: 89
  }, {
    l: 'mm',
    r: 59,
    d: C.MIN
  }, {
    l: 'h',
    r: 89
  }, {
    l: 'hh',
    r: 23,
    d: C.H
  }, {
    l: 'd',
    r: 35
  }, {
    l: 'dd',
    r: 28,
    d: C.D
  }, {
    l: 'M',
    r: 45
  }, {
    l: 'MM',
    r: 11,
    d: C.M
  }, {
    l: 'y',
    r: 17
  }, {
    l: 'yy',
    d: C.Y
  }]
})
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1 m',
    mm: '%d m',
    h: '1 h',
    hh: '%d h',
    d: '1 d',
    dd: '%d d',
    M: '1 M',
    MM: '%d M',
    y: '1 y',
    yy: '%d y',
  },
})

const lang = localStorage.language || 'en'
dayjs.locale(lang === 'zh-cn' ? 'zh' : (lang === 'zh-tw' ? 'zh-tw' : 'en'))
export default dayjs
