"use strict";

const demo1 = function() {
  function init() {
    document.getElementById('btnAllData').addEventListener('click', getAll);
    document.getElementById('btnSingleSheetData').addEventListener('click', getSingle);
  } 

  async function getAll() {
    var spreadsheetId = document.getElementById('txtSpreadsheetId').value;
    
    setResults('loading...');
    var result = await simpleSheetsAPI.getAllSheetData(spreadsheetId);
    if (!result.success) {
      setStatus('load failed: ' + result.details);
    } else {
      setResults(result.data);
    }
  }

  async function getSingle() {
    var spreadsheetId = document.getElementById('txtSpreadsheetId').value;
    var sheetName = document.getElementById('txtSheetName').value;
    
    setResults('loading...');
    var result = await simpleSheetsAPI.getSheetData(spreadsheetId, sheetName);
    if (!result.success) {
      setResults('load failed: ' + result.details);
    } else {
      setResults(result.data);
    }
  }

  function setResults(resultData) {
    var elem = document.getElementById('demoResults');
    var resultType = typeof resultData;
    var resultString = '';
    
    if (resultType == 'string') {
      resultString = resultData;
      
    } else if (resultType == 'object') {
      resultString = JSON.stringify(resultData, null, 2);
    }
    
    elem.innerHTML = resultString;
  }
  
  return {
    init: init
  };
}();