import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'show-server-error',
  templateUrl: './show-server-error.component.html',
  styleUrls: ['./show-server-error.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class ShowServerErrorComponent {

  @Input() errorMsg: any;
  



  shouldShowErrors(): boolean {
    return ( this.errorMsg.show === true );
  }
  isSuccessMsg(): boolean {
    return ( this.errorMsg['type'] === 'SUCCESS');
  }
}
