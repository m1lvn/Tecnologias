import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagenologiaPage } from './imagenologia.page';

describe('ImagenologiaPage', () => {
  let component: ImagenologiaPage;
  let fixture: ComponentFixture<ImagenologiaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagenologiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
