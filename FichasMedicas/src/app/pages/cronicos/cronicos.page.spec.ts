import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CronicosPage } from './cronicos.page';

describe('CronicosPage', () => {
  let component: CronicosPage;
  let fixture: ComponentFixture<CronicosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CronicosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
