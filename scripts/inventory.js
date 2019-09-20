"use strict";

const inventory = function() {
  var fullInventoryData = null;
  var spreadsheetId = '1NFuOdmj7njWshl28rvKHrmVt4HyQ8o2gmcAI6MDqIPk';
  var objInventory = {};

  async function init() {
    var loadSuccess = await loadInventoryData();
    if (!loadSuccess) return;
    if (!makeInventoryObjects()) return;
    console.log('done initializing');
  }

  async function loadInventoryData() {
    var success = false;
    setStatus('loading...');
    
    var result = await simpleSheetsAPI.getAllSheetData(spreadsheetId);
    if (!result.success) {
      setStatus('load failed: ' + result.details);
    } else {
      fullInventoryData = result.data;
      setStatus('');
      success = true;
    }
    
    return success;
  } 

  function makeInventoryObjects() {
    var success = true;
    var sheetData = fullInventoryData.sheetdata;
    
    var itemRow = sheetData.items[0];
    console.log(itemRow);
    
    return success;
  }
  
  function getCategoryName(key) {
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

  return {
    init: init
  };  
}();