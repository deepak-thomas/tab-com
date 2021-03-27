import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChannelEvent } from './channel-even.model';
import { TabComConfig } from './tab-com-config.model';
import { TAB_CONFIG } from './tab-com.module';

@Injectable()
export class TabComService {
    
    private channelName:string;
    
    sender:{[index:string]:ChannelEvent}={};
    callbacks = {};

    constructor(@Inject(TAB_CONFIG) config:TabComConfig) {
        if(config?.key){
            this.channelName = config.key || 'tab-com';
        } 
        this.createChannel(this.channelName)
    }

    /**
     * Used to create a new channel to communicate with other tabs
     * @param channelName Name of the channel used to communicate
     */
    createChannel(channelName:string){
        if ('BroadcastChannel' in window) {
            this.sender[channelName] = this.broadcastChannelApiFactory(this.channelName);
        } else if ('localStorage' in window) {
            this.sender[channelName] = this.localStorageApiFactory(this.channelName);
        }else{
            this.sender[channelName] = this.emptyApiFactory();
        }
    }

    /**
     * Used to send Data over the channel
     * @param topic Topic used to send in the channel
     * @param data Data to be send
     * @param channelName ( Optional ) Name of the Channel to be used to send the data  
     * @param includeSelf ( Optional ) Send it to the current window 
     */
    send(topic:string,data:any,channelName = this.channelName,includeSelf = false){
        this.sender[channelName].send(topic,data,includeSelf);
    }
    
    /**
     * Used to listen to data being send in the channel 
     * @param topic Topic used to listen in the channel
     * @param channelName ( Optional ) Channel used to send the data
     * @returns 
     */
    subscribe<T>(topic:string,channelName = this.channelName):Observable<T> {
        if (!(channelName in this.callbacks)) {
            this.callbacks[channelName] = {};
        }
        if (!(topic in this.callbacks[channelName])) {
            this.callbacks[channelName][topic] = new Subject();
        }
        return this.callbacks[channelName][topic];
    }
    
    private broadcast(topic:string, data:any) {
        let passedData:{channelName:string,data:any};
        try{
            passedData = JSON.parse(data);
        } catch(err){
            passedData=data;
        }
        if (passedData.channelName in this.callbacks) {
            if(topic in this.callbacks[passedData.channelName]){
                this.callbacks[passedData.channelName][topic].next(passedData.data);
            }
        }
    }
    
    private broadcastChannelApiFactory(channelName:string):ChannelEvent {
        /*
        *  The BroadcastChannel API allows simple communication between
        *  browsing contexts (including tabs), sort of like a PubSub that
        *  works across different tabs. This is the ideal solution for
        *  messaging between different tabs, but it is relatively new.
        *
        *  Support table for BroadcastChannel: http://caniuse.com/#feat=broadcastchannel
        */
        
        const channel = new BroadcastChannel(channelName);
        channel.onmessage = e => this.broadcast(e.data.topic, e.data.data);
        let that = this;
        function send(topic, data, includeSelf=false) {
            data = {...{data:data},...{channelName:channelName}};
            channel.postMessage({topic, data});
            if (includeSelf) {
                that.broadcast(topic, data);
            }
        }
        return{send};
    }
    
    private localStorageApiFactory(channelName):ChannelEvent {
        /*
        *  The localStorage is a key-value pair storage, and browser tabs from
        *  the same origin have shared access to it. Whenever something
        *  changes in the localStorage, the window object emits the `storage`
        *  event in the other tabs letting them know about the change.
        *
        *  Support table for localStorage: http://caniuse.com/#search=webstorage
        */
        
        const storage = window.localStorage;
        const prefix = `${channelName}:`;
        const queue = {};
        
        function send(topic:string, data:any, includeSelf=false) {
            data = {...{data:data},...{channelName:channelName}};
            const key = prefix + topic;
            if (storage.getItem(key) === null || storage.getItem(key) === '') {
                storage.setItem(key, JSON.stringify(data));
                storage.removeItem(key);
                if (includeSelf) {
                    this.broadcast(topic, data);
                }
            } else {
                /*
                * The queueing system ensures that multiple calls to the send
                * function using the same name does not override each other's
                * values and makes sure that the next value is sent only when
                * the previous one has already been deleted from the storage.
                * NOTE: This could just be trying to solve a problem that is
                * very unlikely to occur.
                */
                if (!((key) in queue)) {
                    queue[key] = [];
                }
                queue[key].push(data);
            }
        }
        let that = this;
        window.addEventListener('storage', e => {
            if (!e.key) { return; }
            if (e.key.indexOf(prefix) === 0 && (e.oldValue === null || e.oldValue === '')) {
                const topic = e.key.replace(prefix, '');
                const data = JSON.parse(e.newValue);
                that.broadcast(topic, data);
            }
        });
        
        window.addEventListener('storage', e => {
            if (!e.key) { return; }
            if (e.key.indexOf(prefix) === 0 && (e.newValue === null || e.newValue === '')) {
                const topic = e.key.replace(prefix, '');
                if (topic in queue) {
                    send(topic, queue[topic].shift());
                    if (queue[topic].length === 0) {
                        delete queue[topic];
                    }
                }
            }
        });
        return{send};
    }
    
    private emptyApiFactory():ChannelEvent {
        /*
        *  When the browser does not support any of the APIs that we're using
        *  for messaging, just present an empty api that does just gives
        *  warnings regarding the lack of support.
        */
        
        function noop() {
            console.warn('TabCom messaging is not supported.');
        }
        return {send:noop};    
    }
    
    
}