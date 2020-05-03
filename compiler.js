//编译器
class Compiler{
    constructor(vm){
        this.vm =vm
        //剪切 dom 树
        this.fragment = this.nodeFragment(vm.$el)
        //在处理 fragemnt的指令
        this.compile(this.fragment)
        //处理完后在挂载到 实例 #app 上
        vm.$el.appendChild(this.fragment)
    }
    //把实例 #app 节点下的所有节点剪切下来
    nodeFragment(el){
        //生成fragment袋子
        let fragment = document.createDocumentFragment()
        let child = null
        // 剪叶子 ,把 app节点下的节点剪下来
        while(child = el.firstChild){
            fragment.appendChild(child)
        }
        return fragment
    }
    //处理剪切来的节点
    compile(fragment){
        let nodes = fragment.childNodes
        nodes.forEach(node=>{
            this.isWhatNode(node)
            // 递归调用, 是为了处理 元素节点里面的 文本节点,让其使用 data 的数据
            this.compile(node)
        })
    }
    //判断是什么 节点
    isWhatNode(node){
        if(node.nodeType === 1){
            //是元素节点
            this.handleElementNode(node,this.vm)
        }
        else if(node.nodeType === 3){
            //是文本节点
            this.handleTextNode(node,this.vm)
        }
    }
    //处理文本节点
    handleTextNode(node,vm){
        //正则匹配文本节点的内容,是否使用了 data 里的数据
        let reg = /\{\{(.+?)\}\}/g;
        //把 data数据 赋给文本节点                         result为匹配到 data数据 中的 key 
        node.nodeValue = node.nodeValue.replace(reg,(data,result)=>{
            //生成订阅者
            new Watcher(vm,result,function(newValue,oldValue){
                node.nodeValue = node.nodeValue.replace(oldValue,newValue)
            });
            return DirectiveUtil.getValue(result,vm)
        })

    }
    //处理与元素节点
    handleElementNode(node,vm){
        //获取到元素节点上的 属性节点 借此来看使用了什么 命令
        let attrs = node.attributes
        //Array.from 的目的是为了把 attrs 变成一个 可遍历 的数组
        Array.from(attrs).forEach(attr=>{
            // 解构获取到该 属性的 key 和 value
            let {nodeName,nodeValue} = attr
            //筛选掉没有使用 vue指令 的普通 元素标签
            if(this.isGeneralInstructions(nodeName) || this.isEventInstructions(nodeName)){
                //处理 普通指令
                if(this.isGeneralInstructions(nodeName)){
                    // 解构得到 指令类别
                    let [,type] = nodeName.split("-")
                    // 根据 指令类别 传入 该节点 节点指令对应data的key 实例
                    DirectiveUtil[type](node,nodeValue,vm)
                }else{//处理 事件指令
                    // 获取改事件的类别,是 @ 还是 : 或者是其他的指令
                    let eventType = nodeName.slice(0,1)
                    //获取改事件的 name,是 click 还是 mousermove 或者是其他
                    let eventName = nodeName.slice(1,)
                    // 根据指令类别 传入 该节点 事件名字 处理事件的函数 实例
                    DirectiveUtil[eventType](node,eventName,nodeValue,vm)
                }
                // 处理完 事件指令 后删除在节点上的显示
                node.removeAttribute(nodeName)
            }
        })
    }
    // 判断是 普通 指令
    isGeneralInstructions(nodeName){
        return nodeName.startsWith("v-")
    }
    //判断是 事件 指令
    isEventInstructions(nodeName){
        return nodeName.includes("@")
    }

}
//处理vue指令的工具对象
DirectiveUtil = {
    //获取 dataKey 的数据
    getValue(dataKey,vm){
        //dataKey 就是 data 中的某个数据 ,reduce 的目的是为了分解对象 如 person.name 这时就需要获取到 person.name 的数据
        return dataKey.split(".").reduce((data,res)=>{//
            return data[res]
        },vm.$data)
    },
    text(node,key,vm){
        /**
         *  node: 元素节点
         *  value: data指令的 key
         *  vm: 实例
         */
        //生成 订阅者 ,用于 数据变化后 的 视图更新
        new Watcher(vm,key,function(newValue){
            node.innerText = newValue
        })
        node.innerText = this.getValue(key,vm);
    },
    class(node,value,vm){
        //不想写了...
    },
    model(node,value,vm){
        // 如果不添加订阅者,该 node 的视图层数据就不能与 data 的数据一致
        new Watcher(vm,value,function(newValue){
            node.value = newValue
        }) 
        node.addEventListener("input",(e)=>{
            vm[value] = e.target.value
        })
        node.value = vm[value]
    },
    "@":(node,eventName,nodeValue,vm)=>{
        /**
         *  node: 元素节点
         *  eventName: 事件的名字 是click mousermove 或者其他
         *  nodeValue: 事件的处理函数, 实例里某个函数
         *  vm: 实例
         */
        //给该节点 监听一个 事件
        node.addEventListener(eventName,vm.$options.methods[nodeValue].bind(vm))
    }
}