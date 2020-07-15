var NiceScript = function(){
    function run(code) {
        try {
            if(checkSyntax(code)) {
                var handler = {
                    get(obj, prop) {                                                         
                            return Reflect.has(obj, prop.toString()+'__$') ? obj[prop.toString()+'__$'] : undefined;
                    },
                    set(obj, prop, value) {
                            Reflect.set(obj, prop+'__$', value);
                    },
                    has(obj,prop) {                        
                            return obj && Reflect.has(obj, prop.toString()+'__$');
                    }
                };
                var catchAllHandler = {
                    get(obj, prop){
                        return Reflect.get(obj,prop);
                    },
                    set(){

                    },
                    has(){return true}
                };     
                var allowList = {
                    __proto__: null,
                    console__$:console,
                    alert__$: function(){ 
                        alert("Sandboxed alert:"+arguments[0]);
                    },
                    String__$: String,
                    Number__$: Number,
                    Array__$: Array,
                    Symbol__$: Symbol,
                    Math__$: Math,
                    RegExp__$: RegExp,
                    Object__$: Object,
                    eval__$: function(code){
                        return NiceScript.run("return "+code);
                    }      
                };
                if(!Object.isFrozen(String.prototype)) {
                    Function.prototype.constructor = null;
                    Object.freeze(Object);
                    Object.freeze(String);
                    Object.freeze(Number);
                    Object.freeze(Array);
                    Object.freeze(Symbol);
                    Object.freeze(Math);
                    Object.freeze(Function);
                    Object.freeze(RegExp);
                    Object.freeze(Object.prototype);
                    Object.freeze(String.prototype);
                    Object.freeze(Number.prototype);
                    Object.freeze(Array.prototype);
                    Object.freeze(Symbol.prototype);
                    Object.freeze(Math.prototype);
                    Object.freeze(Function.prototype);
                    Object.freeze(RegExp.prototype);
                    Object.defineProperty((async function(){}).constructor.prototype, 'constructor', {value: null});
                    Object.defineProperty((async function*(){}).constructor.prototype, 'constructor', {value: null});
                    Object.defineProperty((function*(){}).constructor.prototype, 'constructor', {value: null});                     
                }
                var proxy = new Proxy(allowList, handler);  
                var catchAllProxy = new Proxy({__proto__:null, proxy:proxy, globalThis:new Proxy(allowList, handler), window:new Proxy(allowList, handler)}, catchAllHandler);                     
                var output = Function('proxy', 'catchAllProxy', `
                    with(catchAllProxy) {     
                        with(proxy) {  
                            return (function(){                                               
                                "use strict";
                                ${code};
                            })();
                        }
                    }                    
                `)(proxy, catchAllProxy); 
                return output;                                       
            }
        } catch(e) {
            document.getElementById('errorOutput').value = e;
            throw e;
        }
    }
    function checkSyntax(code) {
        Function(code);
        if(/\bimport\s*(?:[(]|\/[*]|\/\/|<!--|-->)/.test(code)) {
            throw new Error("Dynamic imports are blocked");
        }
        return true;
    }
    return {run: run};
}();
