import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FichaDetallePage } from './ficha-detalle.page';

describe('FichaDetallePage', () => {
  let component: FichaDetallePage;
  let fixture: ComponentFixture<FichaDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FichaDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
