import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'lib-form-section-image',
  templateUrl: './section.image.component.html',
  styleUrls: ['./section.image.component.scss'],
})
export class FormSectionImageComponent implements OnInit {
  @Input()
  title: string;

  @Input()
  text: string;

  @Input()
  link: string;

  @Input()
  linkText: string;

  @Input()
  readOnly: string;

  @Input()
  style: string;

  @Input()
  icon: string;

  constructor() {}

  ngOnInit() {}
}
