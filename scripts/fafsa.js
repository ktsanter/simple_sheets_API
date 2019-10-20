"use strict";

const fafsa = function() {
  var spreadsheetId = '1PEPzC9eNODx5IX6R7pJmWSk74rYbVkpx8Q3m_j7Ielk';
  var sheetName = 'FAFSA';
  var dataHeaderRow = 2;
  var dataFirstContentRow = 3;
  var fafsaData = null;

  async function init() {
    var loadSuccess = await loadFAFSAData();
    if (!loadSuccess) return;
    
    displayResults();
  }

  async function loadFAFSAData() {
    var success = false;
    
    setStatus('loading (this may take a few seconds)...');
    
    fafsaData = await simpleSheetsAPI.getSheetDataAsObjectArray(spreadsheetId, sheetName, dataHeaderRow, dataFirstContentRow);
    if (fafsaData == null) {
      setStatus('load failed');
    } else {
      setStatus('');
      success = true;
    }
    
    return success;
  } 

  function displayResults() {
    var rowCount = fafsaData.length;
    var michiganCount = 0;
    var michiganCompleted = 0;
    
    for (var i = 0; i < fafsaData.length; i++) {
      var fafsaRecord = fafsaData[i];
      if (fafsaRecord.state == 'MI') {
        michiganCount++;
        if (!isNaN(fafsaRecord.completed)) {
          michiganCompleted += fafsaRecord.completed;
        }
      }
    }
    
    var elemResults = document.getElementById('results');
    var html = '';
    html += 'Total rows: ' + rowCount + '<br>';
    html += 'Michigan rows: ' + michiganCount + '<br>';
    html += 'Michigan completed FAFSAs: ' + michiganCompleted + '<br>';
    html += '<em>Note schools reporting < 5 are not included in the completed total</em>';
    elemResults.innerHTML = html;
  }

  //---- event handlers ---------------------------------------------

  //---- utility functions ------------------------------------------
  function setStatus(msg) {
    var elem = document.getElementById('status');
    
    elem.innerHTML = msg;

    if (msg == '' || msg == null) {
      elem.style.display = 'none';
    } else {
      elem.style.display = 'inline-block';
    }
  }
  
  return {
    init: init
  };  
}();