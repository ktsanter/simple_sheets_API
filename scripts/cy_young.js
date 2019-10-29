"use strict";

const cyyoung = function() {
  var spreadsheetId = '1GX8T2bdlj2ee9iGHktCuWa8PNEXYk6T462-w91p4dzE';
  var sheetName = 'Cy Young winners';
  var cyRawData = null;
  var cyData = null;

  const page = {};

  async function init() {
    page.body = document.getElementsByTagName('body')[0];
    page.body.appendChild(_renderTitle());    

    var loadSuccess = await loadData();
    if (!loadSuccess) return;
    
    _organizeData();
    page.body.appendChild(_renderPage());
  }

  function _renderTitle() {
    var container = createDiv(null, 'demo-header', 'Cy Young Award winners');
    container.appendChild(createDiv('status', null));
    
    return container;
  }
  
  async function loadData() {
    var success = false;
    setStatus('loading...');
    
    var result = await simpleSheetsAPI.getSheetData(spreadsheetId, sheetName);
    if (!result.success) {
      setStatus('load failed: ' + result.details);
    } else {
      cyRawData = result.data.sheetdata[sheetName];
      setStatus('');
      success = true;
    }
    
    return success;
  } 

  function _organizeData() {
    cyData = [];
    for (var i = 1; i < cyRawData.length; i++) {
      var rowData = cyRawData[i];
      var item = {
        year: rowData[0],
        nlPitcher: rowData[1],
        nlTeam: rowData[2],
        nlImage: rowData[3],
        alPitcher: rowData[4],
        alTeam: rowData[5],
        alImage: rowData[6]
      }
      cyData.push(item);
    }
  }
  
  function _renderPage() {
    var container = createDiv(null, null);
    
    var selectVals = [];
    for (var i = 0; i < cyData.length; i++) {
      selectVals.push({
        id: i,
        value: i,
        textval: cyData[i].year
      });
    }
    
    selectVals.unshift({id: -1, value: -1, textval: 'select year...'});
    
    container.appendChild(createSelect('yearSelect', null, _handleSelect, selectVals));
    
    page.result = createDiv('pitcherResults', null);
    container.appendChild(page.result);
    
    return container;
  }
  
  function _showPitchers(index) {
    while (page.result.firstChild) {
      page.result.removeChild(page.result.firstChild);
    }
    if (index < 0) return;
    
    var entry = cyData[index];
    page.result.appendChild(_renderPitcher(entry.alPitcher, 'American League', entry.alImage));
    page.result.appendChild(_renderPitcher(entry.nlPitcher, 'National League', entry.nlImage));
}
  
  function _renderPitcher(pitcherName, pitcherLeague, pitcherImageURL) {
    var container = createDiv(null, 'pitcher-container');
    
    container.appendChild(createDiv(null, 'pitcher-league', pitcherLeague));
    container.appendChild(createImage(null, 'player-image', pitcherImageURL, pitcherName));
    container.appendChild(createDiv(null, null, pitcherName));
    
    return container;
  }
  
  //-------------------------------------------------
  // event handlers 
  //-------------------------------------------------
  function _handleSelect(e) {
    _showPitchers(e.target.value);
  }

  //-------------------------------------------------
  // utility functions 
  //-------------------------------------------------
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
  
  function createImage(id, classList, src, title, handler) {
    var elem = createElement('img', id, classList);
    if (src != null) elem.src = src;
    if (title) elem.title = title;
    if (handler) elem.addEventListener('click', handler, false);
    
    return elem;
  }  

  return {
    init: init
  };  
}();