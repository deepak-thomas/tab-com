import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { TabComDemoComponent } from './tab-com-demo/tab-com-demo.component';
import {MatInputModule} from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { TabComModule } from 'tab-com';


@NgModule({
  declarations: [
    AppComponent,
    TabComDemoComponent
  ],
  imports: [
    BrowserModule,
    TabComModule.forRoot({key:"tab-demo-key"}),
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
