import { Component, OnInit, OnDestroy } from '@angular/core';
import { IDatePickerConfig } from 'ng2-date-picker';
import { BookingService } from 'app/layout/booking/booking.service';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import { ActionsService, BookingAction } from 'app/layout/actions.service';

var moment = require('moment');
var days = [moment({ days: '8' })];

@Component({
  selector: 'app-step-date',
  templateUrl: './step-date.component.html',
  styleUrls: ['./step-date.component.scss']
})

export class StepDateComponent implements OnInit, OnDestroy {

  datePickerConfig: IDatePickerConfig;
  private componetDestroyed = new Subject();
  selectedDate;
  selectedDate1;
  nextMonth;;
  constructor(
    private bookingService: BookingService,
    private datepipe: DatePipe,
    private actionService: ActionsService
    ) {
    this.datePickerConfig = {
        firstDayOfWeek: 'su',
        monthFormat: 'MMMM YYYY',
        closeOnSelect: true,
        disableKeypress: true,
        allowMultiSelect: false,
        onOpenDelay: 0,
        weekDayFormat: 'dd',
        showNearMonthDays: false,
        showWeekNumbers: false,
        enableMonthSelector: false,
        yearFormat: 'YYYY',
        format: "D MMM YYYY",
        showGoToCurrent: false,
        dayBtnFormat: 'D',
        timeSeparator: ':',
        multipleYearsNavigateBy: 10,
        isDayDisabledCallback: function (e) {
            return bookingService.isHoliday(e);
        }

    };
  }

  ngOnInit() {
    this.selectedDate = moment();
    this.nextMonth = moment(new Date()).add(1, 'M');
    const formattedDate = this.datepipe.transform(this.selectedDate, 'yyyy-MM-dd');
    // update status
    this.bookingService.booking.setStatus({date:formattedDate});
  }
    ngOnDestroy(){
        this.componetDestroyed.next();
        this.componetDestroyed.unsubscribe();
    }
    dateclick(select) {
        if (select) {
            this.selectedDate = null;
            const formattedDate = this.datepipe.transform(this.selectedDate1, 'yyyy-MM-dd');
            // update status
            this.bookingService.booking.setStatus({date:formattedDate});
        } else {
            const formattedDate = this.datepipe.transform(this.selectedDate, 'yyyy-MM-dd');
            // update status
            this.bookingService.booking.setStatus({date:formattedDate});
            this.selectedDate1 = null;
        }

    }

    next() {
        this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 1);
        this.bookingService.updateBookingStatus({ date : this.selectedDate});
    }
}
