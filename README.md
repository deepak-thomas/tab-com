# TabCom

TabCom provide with TabComService which is a angular wrapper service for commincating between different tab of a browser.

Demo - 

# Useage

You will need to import `TabComModule` for that you want to communicate by adding following linr in the module.ts file.

```
import { TabComModule } from 'tab-com';
…
@NgModule ({....
  imports: [...,
  TabComModule,
…]
})
```
You can communciate using a certain channel name by

```
import { TabComModule } from 'tab-com';
…
@NgModule ({....
  imports: [...,
  TabComModule.forRoot({key:"<channel-name>"},
…]
})
```
## Usage 

Throughout the your module you can use `TabComService` in order to communicate with different tabs

### Send Data to different tabs

You can send data to different tab based on a topic by 
```
//In your component
constructor( private tcs:TabComService) {
}

send(data){
    this.tcs.send('send',data);
}
```
### Listen to Data Send from other Tabs

You can listen to topic to which all the different tab are communicating by 

```
//In your component
constructor( private tcs:TabComService) {
}

listen(){
    this.tcs.subscribe('send').subscribe( data=>{
      this.data = data;
    });
}
```

## License

MIT License