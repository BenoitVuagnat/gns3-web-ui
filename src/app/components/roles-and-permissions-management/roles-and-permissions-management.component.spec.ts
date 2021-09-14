/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RolesAndPermissionsManagementComponent } from './roles-and-permissions-management.component';

describe('RolesAndPermissionsManagementComponent', () => {
  let component: RolesAndPermissionsManagementComponent;
  let fixture: ComponentFixture<RolesAndPermissionsManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolesAndPermissionsManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesAndPermissionsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
