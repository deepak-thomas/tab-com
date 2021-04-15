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

  topic = 'tab';
  data = "";
  sub:Subscription;
  sendForm:FormGroup;
  subscribeForm:FormGroup;
  constructor(private tcs:TabComService,private fb:FormBuilder, private cdr:ChangeDetectorRef) {
    this.sendForm = this.fb.group({
      topic: ['tab', Validators.required],
      data: ['',Validators.required]
    });
    this.subscribeForm = this.fb.group({
      topic: ['tab',Validators.required]
    });
   }

  ngAfterViewInit(): void {
    this.subscribe();
  }
  send(){
    this.tcs.send(this.sendForm.value.topic,this.sendForm.value.data);
  }
  subscribe(){
    if(this.sub){
      this.sub.unsubscribe();
    }
    this.topic = this.subscribeForm.value.topic;
    this.sub = this.tcs.subscribe(this.subscribeForm.value.topic).subscribe((data:string)=>{
      this.data = data;
      this.cdr.detectChanges();
    });
  }
}
