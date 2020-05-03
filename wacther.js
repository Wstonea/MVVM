// 生成订阅者和订阅器

// 生订阅者
class Watcher{
    constructor(vm,dataKey,cb){
        this.vm = vm
        //datakey 就是订阅者要监听的 data数据
        this.dataKey = dataKey
        // cb 就是执行 数据具体变化的 函数
        this.cb = cb
        // 订阅者 初始获得的 订阅值 ,用于后面比较 订阅值 与 新值 的 差别,如果相等就不更新视图
        this.value = this.getValue(vm,dataKey)
    }
    getValue(vm,dataKey){
        // 生成订阅器,实例指向 调用 data 的订阅者
        Dep.target = this
        // 订阅者 初始获得的 订阅值
        let value = dataKey.split(".").reduce((a,b)=>{
            return a[b]
        },vm)
        // 如果不让 订阅器 重新 指向为空,订阅者就会一直重复添加,最后 内存gg
        Dep.target = null
        return value
    }
    updata(){
        //newValue: 此时实例上的数据已经被 defineproperty 代理的set 更改了,只是视图层还没有刷新,所以需要去刷新视图
        let newValue = this.dataKey.split(".").reduce((a,b)=>a[b],this.vm)
        // 如果 newValue 与 this.value 相等就不更新视图
        if(newValue !== this.value){
            // cb 就是执行 数据具体变化的 函数
            this.cb(newValue,this.value)
            // 更新 该订阅者 的订阅者,不更新的话就只能 执行一次数据与视图层的变化
            this.value = newValue
        }
    }
}
let uid=0
// 订阅器
class Dep{
    constructor(){
        this.subs = []
        this.uid = uid++
    }
    // 添加订阅者
    addSub(watcher){
        this.subs.push(watcher)
    }
    //通知订阅者更新
    notify(){
        this.subs.forEach(item=>item.updata())
    }
}