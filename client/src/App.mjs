"use strict";
import {div, button} from 'muvjs/muv-dom';

// MODEL

const BOARD_N = 10;

const initializeBoard = () => {
  let board = [];
  for(let r=0; r < BOARD_N; r++){
    board[r] = [];
    for(let c=0; c < BOARD_N; c++){
      board[r][c] = [];
    }
  }

  return board;
}


const PLAYER_ONE_ID = 0;
const PLAYER_TWO_ID = 1;

const SHIPS = [
{ 
  class: "carrier",
  size: 5
},{ 
  class: "battleship",
  size: 4
},
{ 
  class: "destroyer",
  size: 3
},{ 
  class: "submarine",
  size: 3
},{ 
  class: "patrol-boat",
  size: 2
}
]

const getRandomInt = max => {
  return Math.floor(Math.random() * max);
}

const generateShips = board => {

  const player_ids = [PLAYER_ONE_ID,PLAYER_TWO_ID];

  for(let player_id of player_ids){

    let remainingShips = SHIPS.slice();

    while(remainingShips.length > 0){
      const shipIndex = getRandomInt(remainingShips.length)
      const ship = remainingShips[shipIndex];
      remainingShips = remainingShips.slice(0,shipIndex).concat(remainingShips.slice(shipIndex+1));

      const isVertical = getRandomInt(2) === 0;

      let space = [];
      let row, col;

      do {
        row = getRandomInt(BOARD_N - (isVertical ? ship.size : 0));
        col = getRandomInt(BOARD_N - (isVertical ? 0 : ship.size));

        space = [];
        for(let i=0; i< ship.size; i++){
          space[i] = board[row + (isVertical ? i : 0)][col + (isVertical ? 0 : i)][player_id]
        }



      } while(space.filter(s => !!s).length > 0);

      for(let i=0; i< ship.size; i++){
        board[row + (isVertical ? i : 0)][col + (isVertical ? 0 : i)][player_id] = ship
      }


    }
  }

  return board;

}

export const model =
{
  playerNumber: 1,
  boardID: 1,
  playerTurn: 1,
  board: generateShips(initializeBoard())
};

// UPDATE

const attack = position => {
  return {
    type: "attack",
    position
  }
};

const completeRequest = (requestName,xhr) => {
  return {
    type: "complete-request",
    requestName,
    xhr
  }
};

const signIn = () => {
  return {
    type: "sign-in"
  }
};

const actionCableReceivedData = data => {
  return {
    type: "action-cable-received-data",
    data
  }
};

const isShip = (item) => {
  return !!item && !!item.class;
}

const shipIsDown = (model,row,col,boardFace) => {
  let shipBeingAttacked = model.board[row][col][boardFace];
  for(let r=0; r< BOARD_N; r++){
    for(let c=0; c< BOARD_N; c++){
      if((r !== row || c !== col) && model.board[r][c][boardFace] && model.board[r][c][boardFace].class === shipBeingAttacked.class){
        return false; 
      }
    }
  }

  return true;
}

const gameIsOver = (model, row,col, boardFace) => {
  for(let r=0; r< BOARD_N; r++){
    for(let c=0; c< BOARD_N; c++){
      if((r !== row || c !== col) && model.board[r][c][boardFace] && model.board[r][c][boardFace].class){
        return false; 
      }
    }
  }

  return true;
}

export const update = model => action => {
  let effects = [];
  switch (action.type) {
    case "attack":
    let peg = {type: "miss"}
    const r = action.position[0];
    const c = action.position[1];


    const otherPlayerID = (model.playerNumber - 1) % 2 === PLAYER_ONE_ID ? PLAYER_TWO_ID : PLAYER_ONE_ID;

    let isHit = false;


    if(isShip(model.board[r][c][otherPlayerID])) {
      peg.type = "hit";
      if(shipIsDown(model,r,c,otherPlayerID)){
        alert('Ship Down!');
      }
      if(gameIsOver(model, r,c, otherPlayerID)){
        alert('Congratulations!! You Won!');
      }
    }


    model = { ...model };
    model.board = model.board.slice();
    model.board[r] = model.board[r].slice();
    model.board[r][c][otherPlayerID] = peg;

    effects = effects.concat(makeRequest(updateBoardRequestName,{
      method: 'PUT', path: 'boards/'+model.boardID, data: {board: {last_player_id: model.playerNumber, grid: JSON.stringify(model.board)}}
    }));
    break;

    case "complete-request":
    let response = JSON.parse(action.xhr.responseText);
    console.log("Request Completed: ", response);

    switch(action.requestName){
      case getUsersRequestName:
      const numberOfUsers = response.length;

      effects = effects.concat(makeRequest(
        numberOfUsers === 0 || numberOfUsers % 2 === 0 ?
        createFirstUserRequestName : createSecondUserRequestName,{
          method: 'POST', path: 'users'
        }));
      break;

      case createFirstUserRequestName: 

      model = {...model};
      model.playerNumber = response.id;

      effects = effects.concat(makeRequest(creatNewBoardRequestName,{
        method: 'POST', path: 'boards', data: {board: {player_one_id: model.playerNumber,grid: JSON.stringify(model.board)}}
      }));

      effects.push(connectToActionCable(model.playerNumber));

      break;

      case creatNewBoardRequestName:
      model = {...model};
      model.boardID = response.id;
      model.playerTurn = model.playerNumber;

      break;

      case createSecondUserRequestName: 

      model = {...model};
      model.playerNumber = response.id;

      effects = effects.concat(makeRequest(getActiveBoardRequestName,{
        method: 'GET', path: `users/${model.playerNumber-1}/active_board`
      }));

      effects.push(connectToActionCable(model.playerNumber));

      break;

      case getActiveBoardRequestName:

      model = {...model};
      model.boardID = response.id;
      model.board = JSON.parse(response.grid);

      if(response.last_player_id){
        model.playerTurn = (action.data.last_player_id -1) %2 === PLAYER_ONE_ID ? action.data.player_two_id : action.data.player_one_id;
      }

      effects = effects.concat(makeRequest(addUserToExistingBoardRequestName,{
        method: 'PUT', path: 'boards/'+model.boardID, data: {board: {player_two_id: model.playerNumber}}
      }));

      break;
    } 
    break;

    case "sign-in":
    effects = effects.concat(makeRequest(getUsersRequestName,{
      method: 'GET', path: 'users'
    }));
    break;

    case "action-cable-received-data":
    model = {...model};
    model.board = JSON.parse(action.data.grid);

    if(action.data.last_player_id){
      model.playerTurn = (action.data.last_player_id -1) %2 === PLAYER_ONE_ID ? action.data.player_two_id : action.data.player_one_id;
    }
    break;
  }
  return {model, effects};
};

const getUsersRequestName = 'get-users';
const createFirstUserRequestName = 'create-first-user';
const creatNewBoardRequestName = 'create-new-board';
const createSecondUserRequestName = 'create-second-user';
const getActiveBoardRequestName = 'get-active-board';
const addUserToExistingBoardRequestName = 'add-user-to-existing-board';

const updateBoardRequestName = 'update-board';


// VIEW 

export const BoardContent =  ({model, boardPlayerNumber, onAttack}) => {

  const isPlayersTurn = model.playerNumber === model.playerTurn;
  const isPlayersBoard = (model.playerNumber - 1) % 2 === boardPlayerNumber;
  const canAttack =  !isPlayersBoard && isPlayersTurn;

  return div()(model.board.map((row,r) => 
    div({key: 'row-'+r, 
      style: `height: 42px; width: 420px; background-color: black; border: solid 1px white;
      display: flex; flex-direction: row
      `})(
      row.map((col,c) => 
      {
        const item = col[boardPlayerNumber];

        return div({key: 'column-'+c, 
          style: `border: solid 1px white; height:100; width: 100%; 
          ${canAttack ? 'cursor: pointer;': ''}`,
          onclick: canAttack ? () => onAttack([r,c]) : () => null
        })(
        item ? div({
          style: 'position: relative; color: white; height:100%; width:100%;'})(
          function(){
            if(!!item.type){
              return div({style: `
                border-radius: 100%; position: absolute; 
                height: 50%;
                width: 50%;
                top: 25%;
                left: 25%;
                background-color: ${item.type === 'hit' ? 'red' : 'white'}`})()
            }
            else if(!!item.class && isPlayersBoard){
              return div({style: `
                border-radius: 100%; position: absolute; 
                height: 50%;
                width: 50%;
                top: 25%;
                left: 25%;`})(item.class[0])
            } 
          }()
          ) : undefined
          
          )}
        )
      )
      ))        
}

export const view = dispatch => {
  const dispatcher = {
    onAttack: pos => dispatch(attack(pos))
  }

  return model => 
  div({style: 'display: flex; flex-direction: column;'})(
    [
    , div({style: 'margin: 1rem'})((model.playerNumber - 1) % 2 === PLAYER_ONE_ID ? 'Your Board': 'Their Board')
    , BoardContent({model, boardPlayerNumber: PLAYER_ONE_ID, onAttack: dispatcher.onAttack})
    , div({style: 'margin: 1rem'})((model.playerNumber - 1) % 2 === PLAYER_TWO_ID ? 'Your Board': 'Their Board')
    , BoardContent({model, boardPlayerNumber: PLAYER_TWO_ID,onAttack: dispatcher.onAttack})

    ]
    );
}

//IGNITION

export const ignition = dispatch => {
  dispatch(signIn());
};

//SUBSCRIPTIONS

const makeRequest = (requestName,{method="GET",path="",data={}}) => {
  return {
    type: "ajax-request",
    requestName,
    method,
    path,
    data
  }
};

const connectToActionCable = id => {
  return {
    type: 'action-cable-connect',
    id
  }
}

import ActionCable from 'actioncable';


export const subscriptions = dispatch => effect => {
  let cable;

  switch (effect.type) {
    case "ajax-request":
    let xhr = new XMLHttpRequest();
    xhr.open(effect.method, "http://localhost:3000/"+effect.path , true);

    xhr.onload = () => {
      dispatch(completeRequest(effect.requestName,xhr));
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify(effect.data));
    break;

    case "action-cable-connect":
    cable = ActionCable.createConsumer("ws://localhost:3000/cable?user_id="+effect.id);

    cable.subscriptions.create('BoardChannel', {
      received: board => {
        console.log("action cable received",board);
        dispatch(actionCableReceivedData(board));
      }
    });
    break;
  }


};