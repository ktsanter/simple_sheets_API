"use strict";

var fullRosterData = null;
var spreadsheetId = '1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74';
var sheetName = 'roster';
var objRoster = {};

async function init() {
  var loadSuccess = await loadRosterData();
  if (!loadSuccess) return;
  if (!makeRosterObjects()) return;
  loadTaskSelections();
}

async function loadRosterData() {
  var success = false;
  setStatus('loading...');
  
  var result = await simpleSheetsAPI.getSheetData(spreadsheetId, sheetName);
  if (!result.success) {
    setStatus('load failed: ' + result.details);
  } else {
    fullRosterData = result.data;
    setStatus('');
    success = true;
  }
  
  return success;
} 

function makeRosterObjects() {
  var success = true;
  
  var rosterData = fullRosterData.sheetdata[sheetName];
  var categoryRow = rosterData[0];
  var labelRow = rosterData[1];
  var dataRows = rosterData.slice(2);
  
  var rosterInfoIndex = {};
  var rosterQuizIndex = [];
  var rosterAssignmentIndex =[];
  var rosterTestIndex = [];
  var rosterScoreIndex = [];
  
  for (var i = 0; i < categoryRow.length; i++) {
    var category = categoryRow[i];
    var label = labelRow[i];
    var record = {};
    record[label] = i;
    
    if (category == 'info') {
      rosterInfoIndex[label] = i;
    
    } else if (category == 'quiz') {
      rosterQuizIndex.push(record);
      rosterScoreIndex.push(record);
    
    } else if (category == 'assignment') {
      rosterAssignmentIndex.push(record);
      rosterScoreIndex.push(record);
    
    } else if (category == 'test') {
      rosterTestIndex.push(record);
      rosterScoreIndex.push(record);
    }
  }
  
  objRoster = {
    'info': rosterInfoIndex,
    'quiz': rosterQuizIndex,
    'assignment': rosterAssignmentIndex,
    'test': rosterTestIndex,
    'score': rosterScoreIndex,
    'data': dataRows
  }
  
  return success;
}

function loadTaskSelections() {
  var success = true;
  
  var tasks = objRoster.score;
  var selectionData = [ {id: 'notask', value: '-1', textval: 'select a task'} ];
  
  for (var i = 0; i < tasks.length; i++) {
    selectionData.push({
      id: 'task' + i,
      value: i,
      textval: Object.keys(tasks[i])[0]
    });
  }
  
  var elemSelect = createSelect('selectId', 'select-class', e => handleSelection(e), selectionData);
  document.getElementById('selection').appendChild(elemSelect);
  
  return success;
}

function showTaskData(taskIndex) {
  var elemResults = document.getElementById('results');
  while (elemResults.firstChild) {
    elemResults.removeChild(elemResults.firstChild);
  }
  
  if (taskIndex < 0) return;
  
  var headers = ['student', 'score (%)'];
  var contents = [];  var task = objRoster.score[taskIndex];
 
  var taskName = Object.keys(task)[0];
  var taskScoreIndex = task[taskName];  

  var lastNameIndex = objRoster.info.lastname;
  var firstNameIndex = objRoster.info.firstname;

  var scoreData = objRoster.data;
  for (var i = 0; i < scoreData.length; i++) {
    var scoreDataRow = scoreData[i];
    var name = scoreDataRow[lastNameIndex] + ', ' + scoreDataRow[firstNameIndex];
    var score = Math.round(scoreDataRow[taskScoreIndex] * 100);
    contents.push([name, score]);
  }
  
  var stats = calculateStats(contents);
  var statDisplay = '';
  statDisplay += 'average: ' + stats.meanScore + '%<br>';
  statDisplay += 'high score: ' + stats.maxScore + '%<br>';
  statDisplay += 'low score: ' + stats.minScore + '%<br>';
  document.getElementById('stats').innerHTML = statDisplay;
  
  var elemTable = createTable('resultTable', null, headers, contents);
  document.getElementById('results').appendChild(elemTable);
}

function calculateStats(scores) {
  var minScore = scores[0][1];
  var maxScore = minScore;
  var sumScore = 0;
  for (var i = 0; i < scores.length; i++) {
    var score = scores[i][1];
    if (score < minScore) minScore = score;
    if (score > maxScore) maxScore = score;
    sumScore += score;
  }
  
  var stats = {
    "minScore": minScore,
    "maxScore": maxScore,
    "meanScore": (sumScore * 1.0) / scores.length
  };
  
  return stats;
}

//---- event handlers ---------------------------------------------
function handleSelection(e) {
  showTaskData(e.target.value);
}

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

function createElement(elemType, id, classList) {
  var elem = document.createElement(elemType);
  if (id && id != '') elem.id = id;
  addClassList(elem, classList);
  return elem;
}

function addClassList(elem, classList) {
  if (classList && classList != '') {
    var splitClass = classList.split(' ');
    for (var i = 0; i < splitClass.length; i++) {
      elem.classList.add(splitClass[i].trim());
    }
  }
}  

function createSelect(id, classList, changehandler, values) {
  var elem = createElement('select', id, classList);
  if (changehandler) elem.addEventListener('change', changehandler, false);
  
  if (values) {
    for (var i = 0; i < values.length; i++) {
      var opt = createElement('option', null, null);
      if (values[i].hasOwnProperty('id')) opt.id = values[i].id;
      if (values[i].hasOwnProperty('value')) opt.value = values[i].value;
      opt.text = values[i].textval;
      elem.appendChild(opt);
    }
  }      
  
  return elem;
}

function createTable(id, classList, headers, contents, captionLabel) {
  var table = createElement('table', id, classList);
  
  if (captionLabel) {
    var caption = table.createCaption();
    caption.innerHTML = captionLabel;
  }
  
  if (headers) {
    var thead = createElement('thead', null, null);
    table.appendChild(thead);
    var tr = createElement('tr', null, null);
    thead.appendChild(tr);
    for (var i = 0; i < headers.length; i++) {
      var th = createElement('th', null, null);
      th.innerHTML = headers[i];
      tr.appendChild(th);
    }
  }
  
  if (contents) {
    var tbody = createElement('tbody', null, null);
    table.appendChild(tbody);
    for (var i = 0; i < contents.length; i++) {
      var tr = createElement('tr', null, null);
      tbody.appendChild(tr);
      for (var j = 0; j < contents[i].length; j++) {
        var td = createElement('td', null, null);
        td.innerHTML = contents[i][j];
        tr.appendChild(td);
      }
    }
  }
  
  return table;
}

function createTableRow(id, classList, attachTo) {
  var elem = createElement('tr', id, classList);
  
  if (attachTo) attachTo.appendChild(elem);
  
  return elem;
}

function createTableCell(id, classList, contents, isHeader, attachTo) {
  var elem;
  if (isHeader) {
    elem = createElement('th', id, classList);
  } else {
    elem = createElement('td', id, classList);
  }
  
  elem.innerHTML = contents;
  
  if (attachTo) attachTo.appendChild(elem);
  
  return elem;
} 
