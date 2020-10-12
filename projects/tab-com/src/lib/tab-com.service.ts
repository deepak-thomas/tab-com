import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChannelEvent } from './channel-even.model';
import { TabComConfig } from './tab-com-config.model';
import { TAB_CONFIG } from './tab-com.module';

@Injectable()
export class TabComService {
    
    private channelName:string;
    
    sender:ChannelEvent;
    
    constructor(@Inject(TAB_CONFIG) config:TabComConfig) {
        if(config?.key){
            this.channelName = config.key || 'tab-com';
        } 
        if ('BroadcastChannel' in window) {
            this.sender = this.broadcastChannelApiFactory();
        } else if ('localStorage' in window) {
            this.sender = this.localStorageApiFactory();
        }else{
            this.sender = this.emptyApiFactory();
        }
    }
    
    callbacks = {};

    send(topic:string,data:any,includeSelf = false){
        this.sender.send(topic,data,includeSelf);
    }
    
    subscribe(topic:string):Observable<any> {
        if (!(topic in this.callbacks)) {
            this.callbacks[topic] = new Subject();
        }
        return this.callbacks[topic];
    }
    
    private broadcast(topic:string, data:any) {
        if (topic in this.callbacks) {
            let passedData:any;
            try{
                passedData = JSON.parse(data);
            } catch(err){
                passedData=data;
            }
            this.callbacks[topic].next(passedData);
        }
    }
    
    private broadcastChannelApiFactory():ChannelEvent {
        /*
        *  The BroadcastChannel API allows simple communication between
        *  browsing contexts (including tabs), sort of like a PubSub that
        *  works across different tabs. This is the ideal solution for
        *  messaging between different tabs, but it is relatively new.
        *
        *  Support table for BroadcastChannel: http://caniuse.com/#feat=broadcastchannel
        */
        
        const channel = new BroadcastChannel(this.channelName);
        channel.onmessage = e => this.broadcast(e.data.topic, e.data.data);
        let that = this;
        function send(topic, data, includeSelf=false) {
            channel.postMessage({topic, data});
            if (includeSelf) {
                that.broadcast(topic, data);
            }
        }
        return{send};
    }
    
    private localStorageApiFactory():ChannelEvent {
        /*
        *  The localStorage is a key-value pair storage, and browser tabs from
        *  the same origin have shared access to it. Whenever something
        *  changes in the localStorage, the window object emits the `storage`
        *  event in the other tabs letting them know about the change.
        *
        *  Support table for localStorage: http://caniuse.com/#search=webstorage
        */
        
        const storage = window.localStorage;
        const prefix = `${this.channelName}:`;
        const queue = {};
        
        function send(topic, data, includeSelf=false) {
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