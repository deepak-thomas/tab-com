export interface ChannelEvent{
    send:(topic:string,data:any,includeSelf:boolean)=>void
}