import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestsEditComponent } from './edit.component';

describe('EditComponent', () => {
  let component: GuestsEditComponent;
  let fixture: ComponentFixture<GuestsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuestsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
