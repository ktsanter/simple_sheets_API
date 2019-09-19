"use strict";

const student = function() {
  var fullRosterData = null;
  var spreadsheetId = '1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74';
  var sheetName = 'roster';
  var objRoster = {};

  async function init() {
    var loadSuccess = await loadRosterData();
    if (!loadSuccess) return;
    if (!makeRosterObjects()) return;
    loadStudentSelections();
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

  function loadStudentSelections() {
    var success = true;
    
    var studentData = objRoster.data;
    var lastNameIndex = objRoster.info.lastname;
    var firstNameIndex = objRoster.info.firstname;

    var selectionData = [];
    
    for (var i = 0; i < studentData.length; i++) {
      var name = studentData[i][lastNameIndex] + ', ' + studentData[i][firstNameIndex];
      selectionData.push({
        id: 'student' + i,
        value: i,
        textval: name
      });
    }
    
    var selectionData = selectionData.sort( function(a, b) {
      return a.textval.localeCompare(b.textval);
    });
    
    selectionData.unshift({id: 'nostudent', value: '-1', textval: 'select a student'});
    var elemSelect = createSelect('selectId', 'select-class', e => handleSelection(e), selectionData);
    document.getElementById('selection').appendChild(elemSelect);
    
    return success;
  }

  function showStudentData(studentIndex) {
    var elemResults = document.getElementById('results');
    while (elemResults.firstChild) {
      elemResults.removeChild(elemResults.firstChild);
    }
    
    if (studentIndex < 0) return;
    
    var studentData = objRoster.data[studentIndex];
    var infoIndex = objRoster.info;
    var studentInfo = {
      "lastname": studentData[infoIndex.lastname],
      "firstname": studentData[infoIndex.firstname],
      "preferred": studentData[infoIndex.preferred],
      "id": studentData[infoIndex.id],
      "picture": studentData[infoIndex.picture],
      "email": studentData[infoIndex.email]
    }
    var elemInfo = renderStudentInfo(studentInfo);
    elemResults.appendChild(elemInfo);
    
    var headers = ['task', 'score (%)'];
    var contents = [];  
    var tasks = objRoster.score;
    for (var i = 0; i <  tasks.length; i++) {
      var task = tasks[i];
      var taskName = Object.keys(task)[0];
      var taskScoreIndex = task[taskName];
      var studentScore = Math.round(studentData[taskScoreIndex] * 100);
      contents.push([taskName, studentScore]);
    }
      
    var elemTable = createTable('resultTable', null, headers, contents);
    elemResults.appendChild(elemTable);
    
    elemResults.appendChild(renderStats(calculateStats(studentData)));
  }

  function renderStudentInfo(studentInfo) {
    var elem = createDiv('infoContainer', 'clearfix', '');
    
    var elemPicContainer = createDiv('picContainer', null, null);
    elem.appendChild(elemPicContainer);
    if (studentInfo.picture == '') {
      elemPicContainer.appendChild(createDiv('picture', null, '<br><br>no image'));
    } else {
      elemPicContainer.appendChild(createImage('picture', null, studentInfo.picture, 'student image', studentInfo.firstName + studentInfo.lastname));
    }
    
    var htmlInfo = '';
    htmlInfo += '<strong>' + studentInfo.firstname + ' ' + studentInfo.lastname + '</strong><br>';
    htmlInfo += 'ID: ' + studentInfo.id + '<br>';
    htmlInfo += 'email: ' + studentInfo.email;
    elem.appendChild(createDiv('info', null, htmlInfo));
    
    return elem;
  }

  function calculateStats(studentScoreData) {
    var quizzes = objRoster.quiz;
    var assignments = objRoster.assignment;
    var tests = objRoster.test;
    
    var quizSum = 0.0;
    var assignmentSum = 0.0;
    var testSum = 0.0;
    
    for (var i = 0; i < quizzes.length; i++) {
      var task = quizzes[i];
      var taskName = Object.keys(task)[0];
      var scoreIndex = task[Object.keys(task)[0]];
      var score = studentScoreData[scoreIndex];  
      quizSum += score;
    }
    
    for (var i = 0; i < assignments.length; i++) {
      var task = assignments[i];
      var taskName = Object.keys(task)[0];
      var scoreIndex = task[Object.keys(task)[0]];
      var score = studentScoreData[scoreIndex];  
      assignmentSum += score;
    }
    
    for (var i = 0; i < tests.length; i++) {
      var task = tests[i];
      var taskName = Object.keys(task)[0];
      var scoreIndex = task[Object.keys(task)[0]];
      var score = studentScoreData[scoreIndex];  
      testSum += score;
    }  
    
    var quizMean = Math.round(quizSum / quizzes.length * 1000) / 10;
    var assignmentMean = Math.round(assignmentSum / assignments.length * 1000) / 10;
    var testMean = Math.round(testSum / tests.length * 1000) / 10;
    var weightedScore = Math.round(((2 * quizMean + assignmentMean + 4 * testMean) / 7 * 10)) / 10;
      
    var stats = {
      "quizmean": quizMean,
      "assignmentmean": assignmentMean,
      "testmean": testMean,
      "weightedscore": weightedScore
    };
    
    return stats;
  }

  function renderStats(stats) {
    var elem = createDiv('stats', null, null);
    
    var html = '';
    html += 'quizzes: ' + stats.quizmean + '%<br>';
    html += 'assignments: ' + stats.assignmentmean + '%<br>';
    html += 'tests: ' + stats.testmean + '%<br>';
    html += 'weighted score: ' + stats.weightedscore + '%<br>';
    
    elem.innerHTML = html;
    return elem;
  }

  //---- event handlers ---------------------------------------------
  function handleSelection(e) {
    showStudentData(e.target.value);
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

  function createDiv(id, classList, html) {
    var elem = createElement('div', id, classList);
    if (html != null) elem.innerHTML = html;
    
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

  function createImage(id, classList, src, alt, title, handler) {
    var elem = createElement('img', id, classList);
    if (src != null) elem.src = src;
    if (alt) elem.alt = alt;
    if (title) elem.title = title;
    if (handler) elem.addEventListener('click', handler, false);
    
    return elem;
  }
  
  return {
    init: init
  };  
}();