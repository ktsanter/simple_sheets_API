"use strict";

const nz_to_american = function() {
  var spreadsheetId = '1Wr5Jn7K36ZS3pbERQ5RxPPR1HVKrSERVwUhIBkwrmVw';
  var sheetName = 'vocabulary';
  var vocabData = null;

  const page = {};
  
  var currentCardNumber;
  var currentCardFront;

  async function init() {
    page.body = document.getElementsByTagName('body')[0];
    page.body.appendChild(_renderTitle());    

    var loadSuccess = await loadData();
    if (!loadSuccess) return;
    
    page.body.appendChild(_renderPage());
  }

  function _renderTitle() {
    var container = createDiv(null, 'demo-header', 'New Zealand to American vocabulary');
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
      vocabData = result.data.sheetdata[sheetName];
      setStatus('');
      success = true;
    }
    
    return success;
  } 
 
  function _renderPage() {
    var container = createDiv(null, null);
        
    page.card = createDiv(null, 'card', JSON.stringify(vocabData));
    container.appendChild(page.card);
    page.cardNumberContainer = createDiv(null, 'card-number');
    _renderCard(1, true);
    
    container.appendChild(createElement('br'));
    container.appendChild(createIcon(null, 'flip-button fas fa-sync-alt', 'flip card', _flipCard));
    container.appendChild(createIcon(null, 'card-button far fa-caret-square-left', 'previous card', _handlePrevCard));
    container.appendChild(page.cardNumberContainer);
    container.appendChild(createIcon(null, 'card-button far fa-caret-square-right', 'next card', _handleNextCard));
    
    return container;
  }
  
  function _renderCard(cardNumber, front) {
    while (page.card.firstChild) {
      page.card.removeChild(page.card.firstChild);
    }
    if (cardNumber <= 0 || cardNumber >= vocabData.length) return;
    
    currentCardNumber = cardNumber;
    currentCardFront = front;
    
    var cardContents = createDiv(null, null);
    page.card.appendChild(cardContents);
    
    var cardTitle = createDiv(null, 'card-title');
    cardContents.appendChild(cardTitle);
    
    if (currentCardFront) {
      cardTitle.innerHTML = vocabData[0][0];
      cardContents.classList.add('card-front');
      cardContents.appendChild(createDiv(null, 'card-text', vocabData[cardNumber][0]));
      
    } else {
      cardTitle.innerHTML = vocabData[0][1];
      cardContents.classList.add('card-back');
      cardContents.appendChild(createDiv(null, 'card-text', vocabData[cardNumber][1]));
    }
          
    page.cardNumberContainer.innerHTML = currentCardNumber;
  }
    
  //-------------------------------------------------
  // event handlers 
  //-------------------------------------------------
  function _flipCard() {
    _renderCard(currentCardNumber, !currentCardFront);
  }
  
  function _handlePrevCard() {
    if (currentCardNumber - 1 <= 0) return;
    _renderCard(currentCardNumber - 1, true);
  }
  
  function _handleNextCard() {
    if (currentCardNumber + 1 >= vocabData.length) return;
    _renderCard(currentCardNumber + 1, true);
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
  
  function createButton(id, classList, label, title, handler) {
    var elem = createElement('button', id, classList);
    if (label != null) elem.innerHTML = label;
    if (title != null) elem.title = title;
    if (handler) elem.addEventListener('click', e => handler(e), false);
    
    return elem;
  }
  
  function createIcon(id, classList, title, handler) {
    var elem = createElement('i', id, classList);
    if (title) elem.title = title;
    if (handler) elem.addEventListener('click', handler, false);
    
    return elem;
  }

  return {
    init: init
  };  
}();