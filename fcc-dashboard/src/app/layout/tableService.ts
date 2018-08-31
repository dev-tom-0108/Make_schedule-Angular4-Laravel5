import 'fabric';
import { BookingStates } from 'app/layout/booking/booking.service';
var FontFaceObserver = require('fontfaceobserver'); 
declare const fabric: any;
export enum TableStyle{
    Rect = 0,
    Circle = 1
} 
export enum TableStatus{
    Available   = 0,
    Processing  = 1,
    Upcoming    = 2,
    Overlapping = 3,
    Block       = 4,
  }
export class TableService{
    public minScale = 0.5;
    public maxScale = 2;
    public ShowMaxChairNum: number = 20;  
    public chairOptions: any = {
        bigrect: {
        "top-12-0": {
            type: "top-right",
            left: -72,
            top: 35,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "top-12-1": {
            type: "top-right",
            left: -72 + 25,
            top: 35,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "top-12-2": {
            type: "top-right",
            left: -72 + 50,
            top: 35,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "top-12-3": {
            type: "top-right",
            left: -72 + 75,
            top: 35,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "top-12-4": {
            type: "top-right",
            left: -72 + 100,
            top: 35,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "top-12-5": {
            type: "top-right",
            left: -72 + 125,
            top: 35,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "bottom-12-0": {
            type: "top-right",
            left: -72,
            top: -60,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "bottom-12-1": {
            type: "top-right",
            left: -72 + 25,
            top: -60,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "bottom-12-2": {
            type: "top-right",
            left: -72 + 50,
            top: -60,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "bottom-12-3": {
            type: "top-right",
            left: -72 + 75,
            top: -60,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "bottom-12-4": {
            type: "top-right",
            left: -72 + 100,
            top: -60,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "bottom-12-5": {
            type: "top-right",
            left: -72 + 125,
            top: -60,
            fill: '#596068',
            width: 22,
            height: 22,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "left-12-0": {
            type: "top-right",
            left: -93,
            top: -40,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
            
        "left-12-1": {
            type: "top-right",
            left: -93,
            top: -40 + 21,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
    
        "left-12-2": {
            type: "top-right",
            left: -93,
            top: -40 + 42,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
    
        "left-12-3": {
            type: "top-right",
            left: -93,
            top: -40 + 63,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
        "right-12-0": {
            type: "top-right",
            left: 70,
            top: -40,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
            
        "right-12-1": {
            type: "top-right",
            left: 70,
            top: -40 + 21,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
    
        "right-12-2": {
            type: "top-right",
            left: 70,
            top: -40 + 42,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },
    
        "right-12-3": {
            type: "top-right",
            left: 70,
            top: -40 + 63,
            fill: '#596068',
            width: 22,
            height: 20,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
            },    
          "top-right": {
            type: "top-right",
            left: 42,
            top: -75,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: 45,
            opacity: 0.60
          },
          "top-left-1": {
            type: "top-left-1",
            left: -42,
            top: -42,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: -45,
            opacity: 0.60
          }, 
          "top-left-2": {
            type: "top-left-2",
            left: -84,
            top: 0,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: -45,
            opacity: 0.60
          }, 
          "bottom-right-1": {
            type: "bottom-right-1",
            left: 10,
            top: 5,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: -45,
            opacity: 0.60
          }, 
          "bottom-right-2": {
            type: "bottom-right-2",
            left: -34,
            top: 50,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: -45,
            opacity: 0.60
          }, 
          "bottom-left": {
            type: "bottom-left",
            left: -78,
            top: 42,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: -45,
            opacity: 0.60
          }
        },
        rect: {
          "top-right": {
            type: "top-right",
            left: -23.5,
            top: -57,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
          },
          "top-left": {
            type: "top-left",
            left: -57,
            top: -23.5,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
          }, 
          "bottom-right": {
            type: "bottom-right",
            left: 10,
            top: -23.5,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
          }, 
          "bottom-left": {
            type: "bottom-left",
            left: -23.5,
            top: 10,
            fill: '#596068',
            width: 47,
            height: 47,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
          }
        },
        circle: {
          "top-right": {
            type: "top-right",
            left: 0,
            top: -22,
            fill: '#596068',
            width: 24,
            height: 24,
            rx: 4,
            ry: 4,
            angle: -60,
            opacity: 0.60
          },
          "top-left": {
            type: "top-left",
            left: -13,
            top: -44,
            fill: '#596068',
            width: 24,
            height: 24,
            rx: 4,
            ry: 4,
            angle: 60,
            opacity: 0.60
          },
          "bottom-right": {
            type: "bottom-right",
            left: 23,
            top: 10,
            fill: '#596068',
            width: 24,
            height: 24,
            rx: 4,
            ry: 4,
            angle: 60,
            opacity: 0.60
          }, 
          "left": {
            type: "left",
            left: -44,
            top: -12,
            fill: '#596068',
            width: 24,
            height: 24,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
          },
          "bottom-left": {
            type: "bottom-left",
            left: -23,
            top: 10,
            fill: '#596068',
            width: 24,
            height: 24,
            rx: 4,
            ry: 4,
            angle: 30,
            opacity: 0.60
          },
          "right": {
            type: "right",
            left: 20,
            top: -12,
            fill: '#596068',
            width: 24,
            height: 24,
            rx: 4,
            ry: 4,
            angle: 0,
            opacity: 0.60
          }
        }
    }
    public tableStyleOptions: any = {
        rect: {
          width: 100,
          height: 100,
          fill: '#596068',
          left: 0,
          top: 0,
          rx: 4,
          ry: 4,
          angle: 0
        },
        circle: {
          radius: 39.5,
          fill: '#596068',
          left: 0,
          top: 0
        }
    };
    public seatRectPositions: Array<string> = ["top-right",   "bottom-left", "top-left", "bottom-right"];
    public seatBigrectPositions20: Array<string> = ["top-12-0",  "top-12-1", "top-12-2", "top-12-3", "top-12-4","top-12-5", 
                                                "bottom-12-0",  "bottom-12-1", "bottom-12-2", "bottom-12-3", "bottom-12-4", "bottom-12-5", 
                                                "left-12-0", "left-12-1", "left-12-2", "left-12-3",
                                                "right-12-0", "right-12-1", "right-12-2", "right-12-3"];

    public createChairs( table: any ) {
        let chairs = [];
        let seatsNum = table.seats > this.ShowMaxChairNum ? this.ShowMaxChairNum : table.seats;
        for (let i = 0; i < seatsNum; i++) {
            let chair: any = {};

            if ( table.style == TableStyle.Circle ) {
                // if style is circle
            let radius = 55;
            chair = {
                type    : "chair",
                originX : 'center',
                originY : 'center',
                left    : radius * Math.sin( 2 * Math.PI /seatsNum * i ),
                top     : radius * Math.cos( 2 * Math.PI /seatsNum * i ),
                fill    : table.table_layout.rect.fill,
                width   : 24,
                height  : 24,
                rx      : 4,
                ry      : 4,
                angle   : 180 - 360 / seatsNum * i,
                opacity : 0.60
                };
                if (seatsNum > 15) {
                chair.width    = 14;
                }
            } else {
            
            if ( table.seats <= 4 ) {
                chair = { ...this.chairOptions.rect[this.seatRectPositions[i]] };
                } else if (table.seats <= 10 ) {
                let k = 2 * i;
                chair = { ...this.chairOptions.bigrect[this.seatBigrectPositions20[k]] };
                if ( i < 6) {
                    chair.width *= 2;
                }
                else {
                    chair.height *= 2;
                }
            } else {
                chair = { ...this.chairOptions.bigrect[this.seatBigrectPositions20[i]] };
            }
            }
        //   let scale = table.style == TableStyle.Circle ? 1.5 : 1;
            let scale = 1;
            chair.left    = scale * chair.left;
            chair.top     = scale * chair.top;
            chair.scaleX  = scale;//table.table_layout.scaleX;
            chair.scaleY  = scale;//table.table_layout.scaleY;
            chairs.push(new fabric.Rect(chair));
        }
        return chairs;
    }

    public createRectGroup(table: any) {
        let rect;

        rect = new fabric.Rect({
            type    : "rect",
            fill    : table.table_layout.rect.fill,
            width   : table.table_layout.rect.width,
            height  : table.table_layout.rect.height,
            rx      : table.table_layout.rect.rx,
            ry      : table.table_layout.rect.ry,
            angle   : 0,
            scaleX  : 1,
            scaleY  : 1,
            originX : 'center',
            originY : 'center'
        });

        if (table.seats > 4) {
            rect.width *= 1.7;
        }

        let chairs = this.createChairs( table );
        return new fabric.Group(chairs.concat([rect]), { top: table.table_layout.top, left: table.table_layout.left, angle: table.table_layout.angle, padding: 20 });
    }

    public createCircleGroup(table: any) {

        let circle = new fabric.Circle({
            type    :"circle",
            radius  : table.table_layout.circle.radius,
            fill    : table.table_layout.rect.fill,
            originX : 'center',
            originY : 'center',
            scaleX  : 1.5,
            scaleY  : 1.5
        });
    
        let chairs = this.createChairs(table);

        let group = [circle];
        return new fabric.Group(chairs.concat(group), { top: table.table_layout.top, left: table.table_layout.left, angle: table.table_layout.angle, padding: 20 });
    }

    public createPercentGroup( table : any ){

        let percentB = new fabric.Circle({
            type            : 'percent',
            radius          : 30,
            stroke          : 'rgba(255,255,255,0.2)',
            strokeWidth     : 3,
            fill            : '',            
            originX         : 'center',
            originY         : 'center',
            scaleX          : 1,
            scaleY          : 1
        });

        var percent = new fabric.Circle({
            type            : 'percent',            
            radius          : 30,
            originX         : 'center',
            originY         : 'center',
            angle           : -90,
            startAngle      : 0,
            endAngle        : ( 2 * Math.PI / 100 ) * table.percent,
            stroke          : 'rgba(255,255,255,0.8)',
            strokeWidth     : 3,
            fill            : ''
          });        

        let group = [percentB];
        return new fabric.Group( group.concat(percent), { originX: 'center',originY: 'center', angle: -table.table_layout.angle } );
    }

    public createTextGroup(table: any ) {
        let text = new fabric.Text( table.table_name, {
            originX     : 'center',
            originY     : 'center',
            fontFamily  : table.table_layout.name.fontFamily,
            fontSize    : table.table_layout.name.fontSize,
            fill        : table.table_layout.name.fill,
            top         : 0 
        });
        text.lockScalingX   = true;
        text.lockScalingY   = true;
        text.lockUniScaling = true;
        text.lockRotation   = true;

        let time  = null;
        let group = [text];

        let scaleX = 1;
        let scaleY = 1;
        if (table.table_layout.scaleX < 1)
            scaleX = 1 + ( 1 - table.table_layout.scaleX )
        else
            scaleX = 1 / ( table.table_layout.scaleX )
        if (table.table_layout.scaleY < 1)
            scaleY = 1 + ( 1 - table.table_layout.scaleY )
        else
            scaleY = 1 / ( table.table_layout.scaleY );

        let textGroup =  new fabric.Group(group, {
            originX : 'center',
            originY : 'center',
            height  : 250,
            width   : 250,
            scaleX  : scaleX,
            scaleY  : scaleY,
            angle   : -table.table_layout.angle, 
            left    : -(table.table_layout.width / 2)
        });

        return textGroup;
    } 

    public createTimeGroup(table: any ) {
     
        let timerect = new fabric.Rect({
            left    : 0,
            top     : 35,
            fill    : '#1A1D22',
            width   : 78,
            height  : 28,
            rx      : 3,
            ry      : 3,
            angle   : 0,
            opacity : 1
        });
        let timetext = new fabric.Text( table.tableObj.table_layout.time, {
            fontFamily  : table.tableObj.table_layout.name.fontFamily,
            fontSize    : 12,
            fill        : "#D8DEE8",
            top         : 0,
            left        : 0,
            originX     : 'center',
            originY     : 'center'
        });

        var m = table.getBoundingRect();

        //console.log( m );
        let timeGroup = new fabric.Group([timerect], {
            top     : m.top + m.height - 18, 
            left    : m.left + ( m.width - timerect.width )/ 2
        });

        timeGroup.lockScalingFlip = true;
        timeGroup.lockMovementX = true;
        timeGroup.lockMovementY = true;
        timeGroup.hasControls = false;
        timeGroup.hasBorders = false;

        timeGroup.add(timetext);
        return timeGroup;
    }    
}