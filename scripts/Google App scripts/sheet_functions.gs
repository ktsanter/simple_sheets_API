//------------------------------------------------------------------------
// simpleSpreadsheet "class"
//  - basic set of Google Sheet manipulation functions
//------------------------------------------------------------------------
var simpleSpreadsheet = function(spreadsheetId) {
  this.errmsg = "";
  this.doc = null;
  this.sheets = null;

  try {
    this.doc = SpreadsheetApp.openById(spreadsheetId);
  } catch (e) {
    this.errmsg = "error opening document: '" + e + "'";
  }
  
  if (this.doc != null) {
    try {
      this.sheets = this.doc.getSheets();
    } catch (e) {
      this.errmsg = "error retrieving sheets: '" + e + "'";
    }
  }
}

//-----------------------------------------------------------------------
// **** code below adds static methods to class ****
//-----------------------------------------------------------------------

//----------------------------------------------------------------------
// return all sheet data for the given sheet name as 2D array
//----------------------------------------------------------------------
simpleSpreadsheet.prototype.getSheetData = function(sheetName) {
  var data = null;
  if (this.doc != null) {
    var sheet = this.doc.getSheetByName(sheetName);
    
    if (sheet == null) {
      this.errmsg = "unable to read data from sheet '" + sheetName + "'";
      
    } else {
      data = sheet.getDataRange().getValues();
    }
  }
  
  return data;
}

//--------------------------------------------------------------------
// write given data to sheet with specified name
//   - will be written from cell A1, overwriting current data
//--------------------------------------------------------------------
simpleSpreadsheet.prototype.putSheetData = function(sheetName, sheetData) {
  var success = false;
  
  if (this.doc == null) {
    this.errmsg = "unable to open file";
  } else if (sheetData == null) {
    this.errmsg = "cannot write null data";
  }
  
  if (this.doc != null && sheetData != null) {
    var sheet = this.doc.getSheetByName(sheetName);
    
    if (sheet == null) {
      this.errmsg = "unable to write to sheet '" + sheetName + "'";

    } else {
      var range = sheet.getRange(1, 1, sheetData.length, sheetData[0].length);
      range.setValues(sheetData);
      success = true;
    }
  }
  
  return success;
}

//************************************************************************
// end of static methods for simpleSpreadsheet "class"
//************************************************************************

