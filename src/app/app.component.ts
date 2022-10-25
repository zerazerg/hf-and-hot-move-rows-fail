import { Component, OnInit } from '@angular/core';
import { DetailedSettings } from 'handsontable/plugins/formulas';
import { GridSettings } from 'handsontable/settings';
import { HyperFormula, Sheet, SimpleCellAddress, ExportedChange } from 'hyperformula';
import { cloneDeep } from 'lodash';

type TableSetting = { 
  mustBeRendered: boolean, 
  hotSettings: any | undefined
}

type AfterRowMoveI = {
  movedRows: number[], 
  finalIndex: number, 
  dropIndex: number | undefined, 
  movePossible: boolean, 
  orderChanged: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private hf: HyperFormula;
  
  public hotSettingsList: any[] = [];
  public afterRowMoveInputs: AfterRowMoveI[] = [];
  public changesList: ExportedChange[][] = [];

  public formulas: any;

  // public container: HTMLElement;

  private readonly sheetName: string = 'Sheet1';

  ngOnInit(): void {

    const datos: Sheet = [
      ['ID','0123456', '=B2'],
      ['Value of ID (=B1)','=B1', ""],
      ['Length of ID (=LEN(B1)','=LEN(B1)', ''],
      ['(A1 & B1) => LOST first 0 character','=A1&"_"&B1', ''],
      ['How to format ID keep the 0 character?','ID_0123456', ''],
    ];
    console.log(`HotTestComponent.ngOnInit datos BASE  => `, cloneDeep(datos));
    this.hf = HyperFormula.buildFromArray(datos);

    this.formulas = {
      engine: this.hf,
      sheetName: this.sheetName
    } as DetailedSettings;
    const hotSettings = {
      data: cloneDeep(datos),
      colHeaders: true,
      rowHeaders: true,
      type: 'text',
      height: 'auto',
      manualRowMove: true,
      formulas: this.formulas,
      licenseKey: 'non-commercial-and-evaluation',
      afterRowMove: async (movedRows: number[], finalIndex: number, dropIndex: number | undefined, movePossible: boolean, orderChanged: boolean) => 
        await this.afterRowMoveCallback(movedRows, finalIndex, dropIndex, movePossible, orderChanged),
      
    } as GridSettings;

    this.hotSettingsList.push(hotSettings);
    
    console.log(`HotTestComponent.ngOnInit hotSettings  => `, cloneDeep(hotSettings));

    console.log(`HotTestComponent.ngOnInit HF data  => `, cloneDeep(this.hf.getSheetValues(0)));

  }

  private async afterRowMoveCallback(movedRows: number[], finalIndex: number, dropIndex: number | undefined, movePossible: boolean, orderChanged: boolean): Promise<void> {

    console.log(`HotTestComponent.afterRowMoveCallback orderChanged  => <${orderChanged}>`);
    console.log(`HotTestComponent.afterRowMoveCallback movedRows  => <${movedRows}>`);
    console.log(`HotTestComponent.afterRowMoveCallback finalIndex  => <${finalIndex}>`);
    console.log(`HotTestComponent.afterRowMoveCallback dropIndex  => <${dropIndex}>`);
    console.log(`HotTestComponent.afterRowMoveCallback movePossible  => <${movePossible}>`);

    if(!orderChanged) return;

    this.afterRowMoveInputs.push({movedRows, finalIndex, dropIndex, movePossible, orderChanged});

    console.log(`HotTestComponent.afterRowMoveCallback PRE HF data  => `, cloneDeep(this.hf.getSheetValues(0)));

    const currentTableData = this.hf.getSheetValues(0);
    const sheetId = this.hf.getSheetId(this.sheetName) as number;
    const startRow: number = movedRows[0];
    const targetRow: number = finalIndex > startRow ? finalIndex : finalIndex;

    const sourceStart: SimpleCellAddress = { 
      sheet: sheetId, 
      col: 0, 
      row: startRow 
    };
    const sourceEnd: SimpleCellAddress = { 
      sheet: sheetId, 
      col: currentTableData[startRow].length - 1, 
      row: startRow
    };
    const destination: SimpleCellAddress = {
      sheet: sheetId, 
      col: 0, 
      row: dropIndex as number
    };
    console.log(`HotTestComponent.afterRowMoveCallback sourceStart  => `, cloneDeep(sourceStart));
    console.log(`HotTestComponent.afterRowMoveCallback sourceEnd  => `, cloneDeep(sourceEnd));
    console.log(`HotTestComponent.afterRowMoveCallback destination  => `, cloneDeep(destination));

    const changes = this.hf.moveRows(sheetId, startRow, 1, dropIndex as number);
    this.changesList.push(changes != null && changes.length > 0 ? changes : []);
    
    const hotSettings2 = {
      data: cloneDeep(this.hf.getSheetSerialized(0)),
      colHeaders: true,
      rowHeaders: true,
      type: 'text',
      height: 'auto',
      manualRowMove: true,
      formulas: this.formulas,
      licenseKey: 'non-commercial-and-evaluation',
      afterRowMove: (movedRows: number[], finalIndex: number, dropIndex: number | undefined, movePossible: boolean, orderChanged: boolean) => 
        this.afterRowMoveCallback(movedRows, finalIndex, dropIndex, movePossible, orderChanged)
    } as GridSettings;

    // if(this.hotSettingsList.length >= 2) this.hotSettingsList.splice(0,1);
    // this.hotSettingsList = this.hotSettingsList.map(hotSettings => null);
    this.hotSettingsList.push(hotSettings2);

    console.log(`HotTestComponent.afterRowMoveCallback POST HF data  => `, cloneDeep(this.hf.getAllSheetsSerialized()));

  }

}
