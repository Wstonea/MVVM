class MyVue{
    constructor(options){
        // options: new MyVue 后的实例
        this.$options = options
        let data = this.$data = options.data
        //处理实例节点
        this.$el = this.isElementNode(this.$options.el) ? this.$options.el : document.querySelector(this.$options.el)
        //属性代理
        Object.keys(data).forEach(key=>{
            this.proxyData(key)
        })
        //数据劫持, 劫持data, 给data 设置 defindProperty,用于数据变化后叫 watcher 跟新视图
        new Observs(this,data)
        //编译器,传入实例 用于初始化页面 生成 watcher
        new Compiler(this)
    }
    //判断实例对象的el是不是一个dom节点
    isElementNode(el){
        //更具 nodetype 来判断是一个元素节点或者是一个属性节点/文本节点
        return el.nodeType === 1
    }
    //为 data 里的数据做代理,让其能 this.msg 等同于 this.data.meg
    proxyData(dataKey){
        Object.defineProperty(this,dataKey,{
            get(){
                return this.$data[dataKey]
            },
            set(newValue){
                return this.$data[dataKey] = newValue
            }
        })
    }
}