let processCount = 0;
let objectCounts = {};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addProcessButton').addEventListener('click', addProcess);
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function addProcess() {
  processCount++;
  const processDiv = document.createElement('div');
  processDiv.setAttribute('id', `process_${processCount}`);
  
  const idLabel = document.createElement('label');
  idLabel.innerHTML = `Process Id: <input type="text" id="process_${processCount}_id" value="${uuidv4()}" readonly />`;
  
  const processLabel = document.createElement('label');
  processLabel.innerHTML = `Process: <input type="text" id="process_${processCount}_process" />`;
  
  const textareaLabel = document.createElement('label');
  textareaLabel.innerHTML = `Textarea: <textarea id="process_${processCount}_textarea"></textarea>`;
  
  const objectDiv = document.createElement('div');
  objectDiv.setAttribute('id', `process_${processCount}_objects`);
  
  const addObjectButton = document.createElement('button');
  addObjectButton.innerHTML = 'Add Object';
  addObjectButton.onclick = addObject.bind(null, processCount);
  
  processDiv.appendChild(idLabel);
  processDiv.appendChild(processLabel);
  processDiv.appendChild(textareaLabel);
  processDiv.appendChild(objectDiv);
  processDiv.appendChild(addObjectButton);
  
  const removeProcessButton = document.createElement('button');
  removeProcessButton.innerHTML = 'Remove Process';
  removeProcessButton.onclick = removeProcess.bind(null, processCount);

  processDiv.appendChild(removeProcessButton);
  document.getElementById('processes').appendChild(processDiv);
}

function removeProcess(processId) {
  const processDiv = document.getElementById(`process_${processId}`);
  processDiv.parentNode.removeChild(processDiv);
}

function addObject(processId) {
  if (!objectCounts[processId]) {
    objectCounts[processId] = 0;
  }
  
  objectCounts[processId]++;
  
  const objectDiv = document.createElement('div');
  objectDiv.setAttribute('id', `process_${processId}_object_${objectCounts[processId]}`);
  
  const idLabel = document.createElement('label');
  idLabel.innerHTML = `Object Id: <input type="text" id="process_${processId}_object_${objectCounts[processId]}_id" value="${uuidv4()}" readonly />`;

  const textLabel = document.createElement('label');
  textLabel.innerHTML = `Text: <input type="text" id="process_${processId}_object_${objectCounts[processId]}_text" />`;
  
  const objectLabel = document.createElement('label');
  objectLabel.innerHTML = `Object: <input type="text" id="process_${processId}_object_${objectCounts[processId]}_object" />`;
  
  objectDiv.appendChild(idLabel);
  objectDiv.appendChild(textLabel);
  objectDiv.appendChild(objectLabel);
  
  const removeObjectButton = document.createElement('button');
  removeObjectButton.innerHTML = 'Remove Object';
  removeObjectButton.onclick = removeObject.bind(null, processId, objectCounts[processId]);

  objectDiv.appendChild(removeObjectButton);
  document.getElementById(`process_${processId}_objects`).appendChild(objectDiv);

}

function removeObject(processId, objectId) {
  const objectDiv = document.getElementById(`process_${processId}_object_${objectId}`);
  objectDiv.parentNode.removeChild(objectDiv);
}
