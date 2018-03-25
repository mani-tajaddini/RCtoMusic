var wsc = new WebSocket("ws://" + window.location.hostname + ":9999/")
var data
var setList
var plotData

var textarea = document.querySelector('textarea');

textarea.addEventListener('keydown', autosize);

function autosize(){
  var el = this;
  setTimeout(function(){
    el.style.cssText = 'height:auto; padding:0';
    // for box-sizing other than "content-box" use:
    // el.style.cssText = '-moz-box-sizing:content-box';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
  },0);
}

document.getElementById('submitButton1').onclick = function(){
  wsc.send(JSON.stringify({
    type: 'inputString',
    value: document.getElementById('textArea1').value
  }))
}

document.getElementById('submitButton2').onclick = function(){
  wsc.send(JSON.stringify({
    type: 'inputNote',
    value: [document.getElementById('textArea1').value, document.getElementById('textArea2').value]
  }))
}

wsc.onmessage = function(event){
  data = JSON.parse(event.data)
  console.log(JSON.stringify(data.value, null, 2));
  plotData = data.value.plotData
  switch(data.type){
    case "input":
      document.getElementsByClassName('page1')[0].style.display="none"
      document.getElementsByClassName('page2')[0].style.display="block"
      if (plotData) {
        var dat = [
          {
            z: plotData,
            x: data.value.dataAxis,
            y: data.value.dataAxis,
            showscale: false,
            type: 'heatmap'
          }
        ];

        Plotly.newPlot('myDiv', dat);
      }
      // document.getElementById("myTextArea").value = JSON.stringify(data.value.grouping, null, 4);
      document.getElementById("myTextArea").value = data.value.groupingLength;
      break;
    case "inputMusic":
      console.log("bakh: ", data.value);
      setList = data.value.setList
      plotData = data.value.plotData

      MIDI.loadPlugin({
        soundfontUrl: "../soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
          console.log(state, progress);
        },
        onsuccess: function() {
          var delay = 0; // play one note every quarter second
          var velocity = 127; // how hard the note hits
          MIDI.setVolume(0, 127);

          for (var i = 0; i < setList.length; i++) {
            var note = setList[i].pitch
            MIDI.noteOn(0, note, velocity, delay)
            MIDI.noteOff(0, note, delay + 1)
            delay = delay + 1;
          }
        }
      });
      break;
    case "command":
      if(message.value === "restart"){
        document.getElementsByClassName('page1')[0].style.display="block"
        document.getElementsByClassName('page2')[0].style.display="none"
        wsc.send(JSON.stringify({type: "done", value: "done"}))
      }
      break;
  }
}
