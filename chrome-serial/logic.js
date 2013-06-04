var connectionId = -1;

var dtr=false;var rts=false;
var selectedPort;

function onSetControlSignals(result) {console.log(result);
  console.log("onSetControlSignals: " + result);
};

function changeSignals() {
  chrome.serial.setControlSignals(connectionId,
                                               { dtr: dtr, rts: rts },
                                               onSetControlSignals);
}

function onGetControlSignals(options) {console.log(options.dtr);
if((options.cts==false)&&(options.dcd==false))
  {console.log("heyy");
    options.cts=true;
    setTimeout(function(){options.dcd=true;},0);
chrome.serial.read(connectionId,8,function(readInfo){
  console.log(readInfo);
});
  }
else
  {
    readSignals();
  }
}

function readSignals() {
  chrome.serial.getControlSignals(connectionId,
                                               onGetControlSignals);
}

function onOpen(openInfo) {
  connectionId = openInfo.connectionId;
   chrome.serial.read(connectionId,18,function(readInfo){
console.log("readInfo",readInfo);
changeSignals();
});
  if (connectionId == -1) {
    setStatus('Could not open');
    return;
  }
  setStatus('Connected');

  
  readSignals();
 
  setInterval(readSignals, 1000);
};

function setStatus(status) {
  document.getElementById('status').innerText = status;
}

function buildPortPicker(ports) {
  var eligiblePorts = ports.filter(function(port) {
    return !port.match(/[Bb]luetooth/);
  });

  var portPicker = document.getElementById('port-picker');
  eligiblePorts.forEach(function(port) {
    var portOption = document.createElement('option');
    portOption.value = portOption.innerText = port;
    portPicker.appendChild(portOption);
  });

  portPicker.onchange = function() {
    if (connectionId != -1) {
      chrome.serial.close(connectionId, openSelectedPort);
      return;
    }
    openSelectedPort();
  };
}

function openSelectedPort() {
  var portPicker = document.getElementById('port-picker');
   selectedPort = portPicker.options[portPicker.selectedIndex].value;
   //var selectedPort="COM69";
  chrome.serial.open(selectedPort,{bitrate:1000},onOpen);
}



 

  chrome.serial.getPorts(function(ports) {
    buildPortPicker(ports)
    openSelectedPort();
  });

