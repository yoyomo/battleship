"use strict";
import {div, button} from 'muvjs/muv-dom';

// MODEL

/*::

interface Carrier { 
class: "carrier",
size: 5
}

interface Battleship { 
class: "battleship",
size: 4
}

interface Destroyer { 
class: "destroyer",
size: 3
}

interface Submarine { 
class: "submarine",
size: 3
}

interface PatrolBoat { 
class: "patrol-boat",
size: 2
}

type Ship = Carrier | Battleship | Destroyer | Submarine | PatrolBoat

type Peg = {
type: "hit" | "miss"
}

type Board = {
  player_one: string,
  player_two: string,
  board: (Ship | Peg)[][][]
}
*/

const BOARD_N = 10;

const initializeBoard /*: () => BoardItem[][][] */
= () => {
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

      // assign the ship positions
      for(let i=0; i< ship.size; i++){
        board[row + (isVertical ? i : 0)][col + (isVertical ? 0 : i)][player_id] = ship
      }


    }
  }

  return board;

}

export const model =
{
  playerNumber: PLAYER_ONE_ID,
  board: generateShips(initializeBoard())
};

  /*::
  type Model = typeof model
  */

// UPDATE

const attack = position => {
  return {
    type: "attack",
    position
  }
};

/*::
type CompleteRequest = {
  type: "complete-request"
}
*/

const completeRequest = (requestName,xhr) => {
  return {
    type: "complete-request",
    requestName,
    xhr
  }
};

/*::
type SignIn = {
  type: "sign-in"
}
*/
const signIn = () => {
  return {
    type: "sign-in"
  }
};

/*::
type Action = Increment | Decrement | CompleteRequest | SignIn
*/

const isShip = (item) => {
  return !!item && !!item.class;
}

export const update /*: Model => Action => {model: Model, effects: Effect[]} */
= model => action => {
  let effects = [];
  switch (action.type) {
    case "attack":
    let peg = {type: "miss"}
    const r = action.position[0];
    const c = action.position[1];



    if(isShip(model.board[r][c][PLAYER_TWO_ID])) {
      peg.type = "hit";
      //TODO check for ship down, or game over
    }


    model = { ...model };
    model.board = model.board.slice();
    model.board[r] = model.board[r].slice();
    model.board[r][c][PLAYER_TWO_ID] = peg;
    break;

    case "complete-request":
    let response = JSON.parse(action.xhr.responseText);
    console.log("Request Completed: ", response);
    debugger


    switch(action.requestName){
      case getUsersRequestName:
      const numberOfUsers = response.length;
      if(numberOfUsers === 0 || numberOfUsers % 2 === 0){
        // TODO create new board, with new users
        effects = effects.concat(makeRequest(createNewUserRequestName,{
          method: 'POST', path: 'users'
        }));

        effects = effects.concat(makeRequest(creatNewBoardRequestName,{
          method: 'POST', path: 'boards'
        }));
      } else {
        // TODO create user and match to board with previous user
      }
      break;

      case createNewUserRequestName: 

      model = {...model};
      // model.currentUser

      break;
    } 
    break;

    case "sign-in":
    // effects = effects.concat(makeRequest(getUsersRequestName,{
      // method: 'GET', path: 'users'
    // }));
    break;
  }
  return {model, effects};
};

const getUsersRequestName = 'get-users';
const createNewUserRequestName = 'create-new-user';
const creatNewBoardRequestName = 'create-new-board';
const addUserToExistingBoardRequestName = 'add-user-to-existing-board';

// VIEW 

export const BoardContent =  ({model, boardPlayerNumber, onAttack}) => {

  const canAttack = model.playerNumber !== boardPlayerNumber;

  return div()(model.board.map((row,r) => 
    div({key: 'row-'+r, 
      style: `height: 42px; width: 100%; background-color: black; border: solid 1px white;
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
          style: 'color: white'})(
          function(){
            if(!!item.type){
              return item.type
            }
            else if(!!item.class && !canAttack){
              return item.class
            } else { //TODO remove this else
              return 'nothing'
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
    , div({style: 'margin: 1rem'})(model.playerNumber === PLAYER_ONE_ID ? 'Your Board': 'Their Board')
    , BoardContent({model, boardPlayerNumber: PLAYER_ONE_ID, onAttack: dispatcher.onAttack})
    , div({style: 'margin: 1rem'})(model.playerNumber === PLAYER_TWO_ID ? 'Your Board': 'Their Board')
    , BoardContent({model, boardPlayerNumber: PLAYER_TWO_ID,onAttack: dispatcher.onAttack})

    ]
    );
}

//IGNITION

export const ignition = dispatch => {
  dispatch(signIn());
};

//SUBSCRIPTIONS

/*::
type AjaxRequest = {
  type: "ajax-request"
}
*/
const makeRequest = (requestName,{method="GET",path="",data={}}) => {
  return {
    type: "ajax-request",
    requestName,
    method,
    path,
    data
  }
};

/*::
type Effect = AjaxRequest
*/

export const subscriptions = dispatch => effect => {
  switch (effect.type) {
    case "ajax-request":
    let xhr = new XMLHttpRequest();
    xhr.open(effect.method, "http://localhost:3000/"+effect.path , true);

    xhr.onload = () => {
      dispatch(completeRequest(effect.requestName,xhr));
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(effect.data);
    break;
  }


};