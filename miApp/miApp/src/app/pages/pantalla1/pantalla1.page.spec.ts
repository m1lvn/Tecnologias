import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pantalla1Page } from './pantalla1.page';

describe('Pantalla1Page', () => {
  let component: Pantalla1Page;
  let fixture: ComponentFixture<Pantalla1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Pantalla1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
