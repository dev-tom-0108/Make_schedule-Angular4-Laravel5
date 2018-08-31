import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const LANG_CN_NAME = 'cn';
export const LANG_EN_NAME = 'en';

@Injectable()
export class Lang {
    public lang:string;
    
    constructor(
        private translate   : TranslateService) {
        const browserLang = this.translate.getBrowserLang();
        this.lang = browserLang.match(/en|cn/) ? browserLang :LANG_CN_NAME;
        this.translate.addLangs([LANG_EN_NAME, LANG_CN_NAME]);
        this.setLang( this.getLang() );
        //this.translate.setDefaultLang( this.lang ); 
        //this.setLang( this.lang );     
    }

    setLang( lang:string ) {

        this.lang = lang;
        localStorage.setItem('currengLang', JSON.stringify( lang ));     
        this.translate.use( lang );          
    }
    getLang():string {
        this.lang = JSON.parse( localStorage.getItem('currengLang') );
        return this.lang ? this.lang : LANG_CN_NAME;
    }
    public get( key : string ){
        return this.translate.get( key );
    }
}
