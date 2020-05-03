
class Observs{
    constructor(vm,data){
        this.vm = vm
        this.observs(data)
    }
    //数据劫持,给数据添加 definproperty
    observs(data){
        // 判断劫持的数据是否为一个对象 ,如果不是,就不劫持了
        if(typeof data === "object"){
            //获取到该对象的每一项 key 值,生成 definproperty
            Object.keys(data).forEach(key=>{
                this.defineReactive(data,key,data[key])
            })
        }
    }
    // 生成 definproperty
    defineReactive(data,key,value){
        //递归遍历 对象的每一项,让其每一项都能生成 definproperty
        this.observs(value)
        //生成订阅器, 用于发布通知 叫 watcher 跟新视图
        let dep = new Dep();
        Object.defineProperty(data,key,{
            get(){
                // 如果 该订阅器是有 对象的(某个data的 key),就像 订阅者数组里添加 订阅者
                if(Dep.target){
                    dep.addSub(Dep.target)
                }
                return value
            },
            set:(newValue)=>{
                // 如果 新值 与 旧值 一样就不更新了
                if(value !== newValue){
                    //劫持新设置的数据
                    this.observs(newValue)
                    // value 就是被代理的 datakey 的值, 而newValue 就是每次触发set时传入的新值 
                    value = newValue
                    //订阅器 通知 订阅者 更新页面
                    dep.notify()
                }
            }
        })
    }
}