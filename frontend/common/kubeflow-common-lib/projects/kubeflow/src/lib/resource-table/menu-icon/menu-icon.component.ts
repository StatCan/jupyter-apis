import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ActionEvent, MenuIconValue } from '../types';
import { STATUS_TYPE } from '../status/types';

/**
 * @title Menu with icons
 */
@Component({
  selector: 'lib-menu-icon',
  templateUrl: 'menu-icon.component.html',
  styleUrls: ['./menu-icon.component.scss'],
})
export class MenuIconComponent {

  @Input()
  action: MenuIconValue;

  @Input()
  data: any;

  @Output()
  emitter = new EventEmitter<ActionEvent>();

  constructor() {}

  // Event emitting functions
  public emitClickedEvent(name: string) {
    const ev = new ActionEvent(name, this.data);
    this.emitter.emit(ev);
  }

  // Returns if given input has a defined icon
  public hasIcon(item: any){
    return item?.icon;
  }

  // Helpers for checking the Action's State
  public isPhaseDisabled(item: any): boolean {
    return (
      item.status === STATUS_TYPE.TERMINATING ||
      item.status === STATUS_TYPE.UNAVAILABLE
    );
  }
}
