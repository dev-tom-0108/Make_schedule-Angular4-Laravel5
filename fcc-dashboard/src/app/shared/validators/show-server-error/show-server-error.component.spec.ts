import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowServerErrorComponent } from './show-server-error.component';

describe('ShowServerErrorComponent', () => {
  let component: ShowServerErrorComponent;
  let fixture: ComponentFixture<ShowServerErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowServerErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowServerErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
