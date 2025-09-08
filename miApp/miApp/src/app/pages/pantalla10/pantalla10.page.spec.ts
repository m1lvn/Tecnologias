import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pantalla10Page } from './pantalla10.page';

describe('Pantalla10Page', () => {
  let component: Pantalla10Page;
  let fixture: ComponentFixture<Pantalla10Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Pantalla10Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
