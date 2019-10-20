var API_KEY = 'simpleSheetAPI';

//--------------------------------------------------------------------------
// functions to be called for GET and POST request
//   - these are object with pairs of data set names and the function
//     that should be called for them, e.g.
//     var dispatchFunctions_Get = { "allstudents": getAllStudentScores }
//--------------------------------------------------------------------------
var dispatchFunctions_GET = {
  "getsheetdata": getSheetData,
  "getallsheetdata": getAllSheetData
}
  
var dispatchFunctions_POST = {
  "writesheetdata": writeSheetData
};  

//-------------------------------------------------------------------
// app-specific GET request functions (from dispatcher)
//   - each should return an object using either 
//     webAppAPIErrorResult(details_string), or
//     webAppAPISuccessResult(details_string, { data: <single object or array of objects> })
//-------------------------------------------------------------------

// get data from a single sheet in a document
function getSheetData(options) {
  var success = false;
  var docId = options.spreadsheetid;
  var sheetName = options.sheetname;
  
  var ss = new simpleSpreadsheet(docId);
  if (ss.doc != null) {
    var sheetData = {};
    sheetData[sheetName] = ss.getSheetData(sheetName);
    success = (sheetData[sheetName] != null);
  }
  
  var result = null;
  if (success) {
    result = webAppAPISuccessResult("getSheetData succeeded", {
      docname: ss.doc.getName(),
      docid: docId,
      sheetnames: [sheetName],
      sheetdata: sheetData
    });
    
  } else {
    result = webAppAPIErrorResult(ss.errmsg);
  }
  
  return result;
}

// get data from all sheets in a document
function getAllSheetData(options) {
  var success = false;
  var docId = options.spreadsheetid
  
  var ss = new simpleSpreadsheet(docId);
  if (ss.doc != null) {
    var sheetNames = [];
    var sheetData = {};
    for (var i = 0; i < ss.sheets.length; i++) {
      var sheetName = ss.sheets[i].getName();
      sheetNames.push(sheetName);
      sheetData[sheetName] = ss.getSheetData(sheetName);
    }
    success = (sheetData != {});
  }
  
  var result = null;
  if (success) {
    result = webAppAPISuccessResult("getAllSheetData succeeded", { 
      docname: ss.doc.getName(),
      docid: docId,
      sheetnames: sheetNames, 
      sheetdata: sheetData
    });
  } else {
    result = webAppAPIErrorResult(ss.errmsg);
  }
  
  return result;  
}

//-------------------------------------------------------------------
// app-specific POST request functions (from dispatcher)
//   - each should return a result object of the form:
//     { success:  <boolean>, details: <text> }
//-------------------------------------------------------------------

// write data to given sheet - note this overwrites any existing data
function writeSheetData(options) {
  var docId = options.spreadsheetid;
  var sheetName = options.sheetname;
  var sheetData = options.sheetdata;

  var ss = new simpleSpreadsheet(options.spreadsheetid);
  
  var result = null;
  if (ss != null && ss.putSheetData(sheetName, sheetData)) {
    var writtenData = {};
    writtenData[sheetName] = sheetData;

    result = webAppAPISuccessResult("writeSheetData succeeded", {
      docname: ss.doc.getName(),
      docid: docId,
      sheetnames: [sheetName],
      sheetdata: writtenData
    });
  } else {
    result = webAppAPIErrorResult(ss.errmsg);
  }
  
  return result;
}

//------------------------------------------------------------------
// local test routines
//------------------------------------------------------------------
function test_getSheetData() {
  var options = {
    spreadsheetid: "1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74",
    sheetname: "Sheet1"
  };
  Logger.log(JSON.stringify(getSheetData(options)));
}

function test_getAllSheetData() {
  var options = {
    spreadsheetid: "1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74"
  };

  Logger.log(JSON.stringify(getAllSheetData(options)));
}

function test_writeSheetData() {
  var options = {
    spreadsheetid: "1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74",
    sheetname: "Sheet3",
    sheetdata: [
      ["a", "b" , "c", "d", "e"],
      ["f", "g", "h", "i", "j"],
      ["k", "l", "m", "n", "o"]
    ]           
  };
  Logger.log(JSON.stringify(writeSheetData(options)));
}

