function passKeyboardEvents (e) {
  var attributes = {
    code:     e.code,
    keyCode:  e.keyCode,
    charCode: e.charCode
  };

  var evt = new KeyboardEvent(e.type, attributes);

  document.dispatchEvent(evt);
}

function catchParentEvents () {
  console.info('catching parent events');
  parent.addEventListener('keypress', passKeyboardEvents);
  parent.addEventListener('keydown', passKeyboardEvents);
  parent.addEventListener('keyup', passKeyboardEvents);
}

function releaseParentEvents () {
  console.info('releasing parent events.');
  removeEventListener('keypress', passKeyboardEvents);
  removeEventListener('keydown', passKeyboardEvents);
  removeEventListener('keyup', passKeyboardEvents);
}
