export class NetworkClient{
constructor(){const token=localStorage.getItem("pixel-frontier-session");this.socket=window.io({auth:{token},reconnection:true,reconnectionAttempts:Infinity});this.handlers=new Map();this.socket.on("session:token",value=>localStorage.setItem("pixel-frontier-session",value));this.socket.onAny((event,...args)=>{for(const fn of this.handlers.get(event)||[])fn(...args)})}
on(event,fn){if(!this.handlers.has(event))this.handlers.set(event,new Set());this.handlers.get(event).add(fn);return()=>this.handlers.get(event)?.delete(fn)}
emit(event,payload){this.socket.emit(event,payload)}
get connected(){return this.socket.connected}
}