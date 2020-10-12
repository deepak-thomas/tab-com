import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabComDemoComponent } from './tab-com-demo.component';

describe('TabComDemoComponent', () => {
  let component: TabComDemoComponent;
  let fixture: ComponentFixture<TabComDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabComDemoComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabComDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
