export default function useDrag({
  defaultValue, maxValue,minValue,
  direction
}:{
  defaultValue:number,
  maxValue:number,
  direction:'clientX' | 'clientY',
  minValue:number
}) {
    const modelValue = shallowRef(defaultValue)
    function drag(e:MouseEvent) {
      let startVal = e[direction]
      document.onmousemove = e=>{
        if(e[direction] >= maxValue || e[direction]<=minValue){
          return
        }
        // 向上移动
        if(e[direction] < startVal){
          modelValue.value -= startVal - e[direction]
        } else {
          modelValue.value += e[direction] - startVal
        }

        startVal = e[direction]
      }
      document.onmouseup = ()=>{
        document.onmousemove = null
        document.onmouseup = null
      }
    }
    return [modelValue,drag] as const
}
