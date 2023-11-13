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
*  blank: Boolean
*  expectedValue: Boolean
*  givenValue: Boolean
*  pos: Vector
* }} BitContainer
*/

/**
* @type { BitContainer [] }
*/
let bitContainerArray;

/**
* @type { BitContainer }
*/
let grabBitContainer;

// Timer class. Manages timer based events. Time is measured in frames.
/**
*@typedef {{
  *	 timeLimit: Number
  *  elapsedTime: Number
  * }} Timer
  */
  
  /**
  * @type { Timer }
  */
  let timer;

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

// Variables pertaining to game state management
/**
* @type { Vector [] }
*/
let bitPositionArray;

/**
* @type { Vector }
*/
let grabBitStartPosition = vec(50, 75);
/**
* @type { Vector }
*/
let grabBitEndPosition = vec(50, 25);


function update() {
  if (!ticks) {
    playerBit = {
			activated: false,
      pos: vec(50, 25)
		};

    bitContainerArray = [];

    grabBitContainer = {
      activated: false,
      blank: true,
      expectedValue: false,
      givenValue: false,
      pos: vec(grabBitStartPosition.x, grabBitStartPosition.y)
    }

    bitPositionArray = [
      vec(2, 75),
      vec(26, 75),
      vec(50, 75),
      vec(74, 75),
      vec(98, 75),
      vec(122, 75)
    ];

    timer = {
			timeLimit: 0,
      elapsedTime: 0
		};

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
        removeFirstBit();
        pushNewBit(bitPositionArray[5], false);
        for (let i = 0; i < bitContainerArray.length; i++) {
          /**
          * @type { BitContainer }
          */
          let bit = bitContainerArray[i];
          bit.pos = vec(bitPositionArray[i].x, bitPositionArray[i].y);
        }
      },
      grabBitAscendEnter: function () {
        setTimer(60);
        grabBitContainer.activated = false;
        grabBitContainer.pos = vec(grabBitStartPosition.x, grabBitStartPosition.y)
      },
      grabBitAscendExit: function () {
        grabBitContainer.pos = vec(grabBitEndPosition.x, grabBitEndPosition.y)
        grabBitContainer.activated = true;
        grabBitContainer.givenValue = playerBit.activated;
      },
      grabBitDescendEnter: function () {
      },
      grabBitDescendExit: function () {
      }
		};

    initializeBitArray();
    setTimer(60);
    //console.log(bitContainerArray);
  }

  // If a timer is active, increment it until it reaches its limit
  if (timer.elapsedTime >= timer.timeLimit) {
  // Check which state the fsm is in to run its update function
    switch (fsm.currentState){
      case states.MOVE_BIT_ARRAY:
        moveBitArrayUpdate();
        break;
      case states.GRAB_BIT_ASCEND:
        grabBitAscendUpdate();
        break;
      case states.GRAB_BIT_DESCEND:
        grabBitDescendUpdate();
        break;
    }
  } else {
    timer.elapsedTime++;
  }
  
  // If the input is pressed, the player bit activates to a 1. Else, it stays deactivated as a 0.
  playerBit.activated = input.isPressed;

  drawPlayerBit();
  drawBitArray();

  if (fsm.currentState == states.GRAB_BIT_ASCEND || fsm.currentState == states.GRAB_BIT_DESCEND) {
    drawGrabContainer();
  }
}

function moveBitArrayUpdate() {
  // Update the positions of all containers in the array
  for (let i = 0; i < bitContainerArray.length; i++) {
    /**
    * @type { BitContainer }
    */
    let bit = bitContainerArray[i];
    bit.pos.x -= 0.5;
  }

  // Check if middle container is in the correct spot
  if (bitContainerArray[3].pos.x <= bitPositionArray[2].x) {
    fsm.changeState(states.GRAB_BIT_ASCEND);
  }
}

function grabBitAscendUpdate() {
  grabBitContainer.pos.y -= 0.5;

  if (grabBitContainer.pos.y <= grabBitEndPosition.y) {
    fsm.changeState(states.GRAB_BIT_DESCEND);
  }
}

function grabBitDescendUpdate() {
  console.log("running");
}

function initializeBitArray() {
  /**
  * @type { Vector }
  */
  let bitPosition = vec(2, 75);
  for (let i = 0; i < 6; i++) {
    if (i < 3){
      pushNewBit(bitPosition, true);
    } else{
      pushNewBit(bitPosition, false);
    }
    bitPosition.x += 24;
  }
}

/**
 * @param {Vector} newPos
 * @param {Boolean} blank
 */
// Creates a new bit and pushes it to the bit array
function pushNewBit(newPos, blank) {
  /**
  * @type { BitContainer }
  */
  let newBit = {
    activated: false,
    blank: blank,
    expectedValue: Math.random() < 0.5,
    givenValue: false,
    pos: vec(newPos.x, newPos.y)
  };
  bitContainerArray.push(newBit);
}

function removeFirstBit() {
  bitContainerArray.shift();
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

    // Display the number inside the bit container it the container is not blank
    if (!bit.blank){
      if (!bit.activated) {
        color("light_black");
      }

      if (bit.expectedValue) {
        char("b", bit.pos, { scale: vec(2, 2) });
      } else {
        char("a", bit.pos, { scale: vec(2, 2) });
      }
    }
  }
}

function drawGrabContainer() {
  color("black");

  // Display the grab bit container
  char("c", grabBitContainer.pos, { scale: vec(4, 4) });

  // Display the number inside the grab bit container if it grabbed the player's number value
  if (grabBitContainer.activated) {
    color("black");

    if (grabBitContainer.expectedValue) {
      char("b", grabBitContainer.pos, { scale: vec(2, 2) });
    } else {
      char("a", grabBitContainer.pos, { scale: vec(2, 2) });
    }
  }
}

/**
 * @param {Number} timeLimit
 */
function setTimer(timeLimit) {
  timer.elapsedTime = 0;
  timer.timeLimit = timeLimit
}
