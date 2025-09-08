import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pantalla12Page } from './pantalla12.page';

describe('Pantalla12Page', () => {
  let component: Pantalla12Page;
  let fixture: ComponentFixture<Pantalla12Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Pantalla12Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
