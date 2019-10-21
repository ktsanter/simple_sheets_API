"use strict";

const scaffolding = function() {
  const SPREADSHEET_URL = 'https://drive.google.com/open?id=1Sd8pUBlcu_jaPLe2iMnYTeYXvrZVLJOOrBcUzlW6Wns';  // use this in a browser to view the source data
  const SPREADSHEET_ID = '1Sd8pUBlcu_jaPLe2iMnYTeYXvrZVLJOOrBcUzlW6Wns';
  
  function init() {
    document.getElementById('btnTest').addEventListener('click', test);    
  }

  async function test() {
    var res;
    
    console.log('testing: retrieve data from "basic2by2" sheet...');
    res = await getBasicSheetData(SPREADSHEET_ID, 'basic');
    console.log(res);
    
    console.log('\ntesting: retrieve data from "baseballteams" sheet...');
    res = await getSheetDataArray('baseballteams');
    console.log(res);
    
    console.log('\ntesting: get 1D array from column 0 in "randomnumbers" sheet...');
    res = await getColumn(SPREADSHEET_ID, 'randomnumbers', 0);
    console.log(res);
    
    console.log('\ntesting: calculate stats for "randomnumbers" sheet...');
    res = await calculateBasicStats();
    console.log(res);
  }
  
  /*-----------------------------------------------------------------
   * return 2D sheetdata array for the "basic" sheet in the demo spreadsheet
   *----------------------------------------------------------------*/
  async function getBasicSheetData() {
    var result = await simpleSheetsAPI.getSheetData(SPREADSHEET_ID, 'basic2by2');

    if (result.success) {
      result = result.data.sheetdata.basic2by2;
    } else {
      result = null;
    }
    
    return result;
  }
  
  /*-----------------------------------------------------------------
   * return 2D sheetdata array for the given sheet in the demo spreadsheet
   *----------------------------------------------------------------*/
  async function getSheetDataArray(sheetName) {
    var result = await simpleSheetsAPI.getSheetData(SPREADSHEET_ID, sheetName);

    if (result.success) {
      result = result.data.sheetdata[sheetName];
    } else {
      result = null;
    }
    
    return result;
  }
  
  /*-----------------------------------------------------------------
   * return 1D array representing a column from the given sheet
   *----------------------------------------------------------------*/
  async function getColumn(spreadsheetId, sheetName, columnNumber) {
    var result = await simpleSheetsAPI.getSheetData(spreadsheetId, sheetName);

    if (result.success) {
      var resultData = result.data.sheetdata[sheetName];
      var colData =[];
      for (var i = 0; i < resultData.length; i++) {
        colData.push(resultData[i][columnNumber]);
      }
      result = colData;
      
    } else {
      result = null;
    }
    
    return result;
  }
  
  
  /*-----------------------------------------------------------------
   * retrieve a list of random numbers and calculate some stats
   *----------------------------------------------------------------*/
  async function calculateBasicStats() {
    var colData = await getColumn(SPREADSHEET_ID, 'randomnumbers', 0);
    console.log(colData);
    var sumValue, meanValue, minValue, maxValue;
    
    // calculate the stats for the data in colData
    
    return {
      sum: sumValue,
      mean: meanValue,
      min: minValue,
      max: maxValue,
      data: colData
    }
  }
  

  return {
    init: init
  };
}();