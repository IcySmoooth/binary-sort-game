title = "Binary Sort";

description = `
`;

characters = [
`
 ll
l  l
ll l
l ll
l  l
 ll
`,`
 l
ll
 l
 l
 l
lll
`,`
llllll
l    l
l    l
l    l
l    l
llllll
`
  ];

options = {};

// Player Bit class. Stores whether or not the input is currently active or not
/**
*@typedef {{
*	 activated: Boolean
*  pos: Vector
* }} PlayerBit
*/
  
/**
* @type { PlayerBit }
*/
let playerBit;

// Bit Container class. Stores information regarding expected bit value and given bit result
/**
*@typedef {{
*	 activated: Boolean
*  expectedValue: Boolean
*  givenValue: Boolean
*  pos: Vector
* }} BitContainer
*/

/**
* @type { BitContainer [] }
*/
let bitContainerArray;

// Implementing a finite state machine to handle game state logic
/**
* @type { Object.<string, number> }
*/
const states = {
  MOVE_BIT_ARRAY: 0,
  GRAB_BIT_ASCEND: 1,
  GRAB_BIT_DESCEND: 2,
};

// changeState(newState): Enables you to change state and calls exit and enter functions as necessary
/**
*@typedef {{
*	 currentState: Number
*  changeState: (newState: number) => void
*  moveBitArrayEnter: () => void
*  moveBitArrayExit: () => void
*  grabBitAscendEnter: () => void
*  grabBitAscendExit: () => void
*  grabBitDescendEnter: () => void
*  grabBitDescendExit: () => void
* }} FiniteStateMachine
*/

/**
* @type { FiniteStateMachine }
*/
let fsm;


function update() {
  if (!ticks) {
    playerBit = {
			activated: false,
      pos: vec(50, 25)
		};

    bitContainerArray = [];

    fsm = {
			currentState: states.MOVE_BIT_ARRAY,
      changeState: function (newState) {
        switch (this.currentState){
          case states.MOVE_BIT_ARRAY:
            this.moveBitArrayExit();
            break;
          case states.GRAB_BIT_ASCEND:
            this.grabBitAscendExit();
            break;
          case states.GRAB_BIT_DESCEND:
            this.grabBitDescendExit();
            break;
        }

        this.currentState = newState;

        switch (this.currentState){
          case states.MOVE_BIT_ARRAY:
            this.moveBitArrayEnter();
            break;
          case states.GRAB_BIT_ASCEND:
            this.grabBitAscendEnter();
            break;
          case states.GRAB_BIT_DESCEND:
            this.grabBitDescendEnter();
            break;
        }
      },
      moveBitArrayEnter: function () {
      },
      moveBitArrayExit: function () {
      },
      grabBitAscendEnter: function () {
      },
      grabBitAscendExit: function () {
      },
      grabBitDescendEnter: function () {
      },
      grabBitDescendExit: function () {
      }
		};

    initializeBitArray();
  }

  // Check which state the fsm is in to run its update function
  switch (this.currentState){
    case states.MOVE_BIT_ARRAY:
      this.moveBitArrayUpdate();
      break;
    case states.GRAB_BIT_ASCEND:
      this.grabBitAscendUpdate();
      break;
    case states.GRAB_BIT_DESCEND:
      this.grabBitDescendUpdate();
      break;
  }
  
  // If the input is pressed, the player bit activates to a 1. Else, it stays deactivated as a 0.
  playerBit.activated = input.isPressed;

  drawPlayerBit();
  drawBitArray();
}

function moveBitArrayUpdate() {

}

function grabBitAscendUpdate() {
  
}

function grabBitDescendUpdate() {
  
}

function initializeBitArray() {
  /**
  * @type { Vector }
  */
  let bitPosition = vec(2, 75);
  for (let i = 0; i < 5; i++) {
    pushNewBit(bitPosition);
    bitPosition.x += 24;
  }
}

/**
 * @param {Vector} newPos
 */
// Creates a new bit and pushes it to the bit array
function pushNewBit(newPos) {
  /**
  * @type { BitContainer }
  */
  let newBit = {
    activated: false,
    expectedValue: Math.random() < 0.5,
    givenValue: false,
    pos: vec(newPos.x, newPos.y)
  };
  bitContainerArray.push(newBit);
}

function drawPlayerBit() {
  color("black");

  // Draw player bit as "1" if activated
  if (playerBit.activated) {
    char("b", playerBit.pos, { scale: vec(2, 2) });
  }
  // Draw player bit as "0" if deactivated
  else {
    char("a", playerBit.pos, { scale: vec(2, 2) });
  }
}

function drawBitArray() {
  for (let i = 0; i < bitContainerArray.length; i++) {
    color("black");
    
    /**
    * @type { BitContainer }
    */
    let bit = bitContainerArray[i];

    // Display the bit container
    char("c", bit.pos, { scale: vec(4, 4) });

    // Display the number inside the bit container
    if (!bit.activated) {
      color("light_black")
    }

    if (bit.expectedValue) {
      char("b", bit.pos, { scale: vec(2, 2) });
    } else {
      char("a", bit.pos, { scale: vec(2, 2) });
    }
  }
}
