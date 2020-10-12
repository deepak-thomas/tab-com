import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators,FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TabComService } from 'tab-com';

@Component({
  selector: 'app-tab-com-demo',
  templateUrl: './tab-com-demo.component.html',
  styleUrls: ['./tab-com-demo.component.scss']
})
export class TabComDemoComponent implements AfterViewInit {

  topic = 'topic';
  data = "dadsad";
  sub:Subscription;
  sendForm:FormGroup;
  subscribeForm:FormGroup;
  constructor(private tcs:TabComService,private fb:FormBuilder, private cdr:ChangeDetectorRef) {
    this.sendForm = this.fb.group({
      topic: ['topic', Validators.required],
      data: ['',Validators.required]
    });
    this.subscribeForm = this.fb.group({
      topic: ['topic',Validators.required]
    });
   }

  ngAfterViewInit(): void {
    this.subscribe();
  }
  send(){
    this.tcs.send(this.sendForm.value.topic,this.sendForm.value.data,true);
  }
  subscribe(){
    if(this.sub){
      this.sub.unsubscribe();
    }
    this.topic = this.subscribeForm.value.topic;
    this.sub = this.tcs.subscribe(this.subscribeForm.value.topic).subscribe(data=>{
      this.data = data;
      this.cdr.detectChanges();
    })
  }
}
