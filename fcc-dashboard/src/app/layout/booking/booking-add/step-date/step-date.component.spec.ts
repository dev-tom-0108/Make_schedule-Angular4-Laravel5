/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StepDateComponent } from './step-date.component';

describe('StepDateComponent', () => {
  let component: StepDateComponent;
  let fixture: ComponentFixture<StepDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
