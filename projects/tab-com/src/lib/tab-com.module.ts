import { InjectionToken, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { TabComConfig } from './tab-com-config.model';
import { TabComService } from './tab-com.service';


@NgModule({
  declarations: [],
  imports: [
  ],
  exports: [],
  providers:[
    TabComService
  ]
})
export class TabComModule { 

  constructor(@Optional() @SkipSelf() parentModule?: TabComModule) {
    if (parentModule) {
      throw new Error(
        'TabComModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config?:TabComConfig): ModuleWithProviders<TabComModule> {
    return {
      ngModule: TabComModule,
      providers: [
        TabComService,
        {provide: TAB_CONFIG, useValue: config}
      ]
    };
  }
}

export const TAB_CONFIG = new InjectionToken<TabComConfig>('app.config');


export * from './tab-com.service';
export * from './channel-even.model';
export * from './tab-com-config.model';