import { mock1 } from './mock.js'
import MixPcd from './segMultiFmeMap.js'

const { getDt, setMixFme, flushDataTransformer } = MixPcd
const { data, range } = mock1

setMixFme(0)
flushDataTransformer(range)

const dt = getDt()

const res = dt.splitmixFmeData()
console.log(`🚀 -> res:`, res)
res.forEach((fme, idx) => {
  console.log(`🚀 -> res.forEach -> idx:`, idx)
  fme.forEach(item => {
    console.log(`🚀 -> item:`, item)
  })
})
