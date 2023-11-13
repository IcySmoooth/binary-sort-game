title = "Binary Sort";

description = `
    Tip:
Sort the bits.
Beware the NOT.
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
`,`
 l l
lllll
lllll
 lll
  l
`,`
llll
 l
 l
  l
  l
   l
`,`
llll
  l
  l
 l
 l
l
`,`
 ll
l  l
 ll
`
];

options = {
  seed: 19
};

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

// NOT gate class. Inverts the value of the bit grabber upon collision with it
/**
*@typedef {{
*	 activated: Boolean
*  used: Boolean
*  pos: Vector
* }} NotGate
*/

/**
* @type { NotGate [] }
*/
let notGateArray;

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

// Health class. Tracks player health.
/**
*@typedef {{
*	 maxHealth: Number
*  currentHealth: Number
*  loseHealth: (healthLost: number) => void
* }} Health
*/

/**
* @type { Health }
*/
let health;

/**
* @type { Vector [] }
*/
let healthIconPositions

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

// Difficulty class. Manages game difficulty.
/**
*@typedef {{
  *	 maxDifficulty: Number
  *  currentDifficulty: Number
  *  increaseDifficulty: () => void
  *  initializeDifficulty: () => void
  * }} DifficultyManager
  */
  
  /**
  * @type { DifficultyManager }
  */
  let difficultyManager;

// Variables pertaining to game state management
/**
* @type { Number }
*/
let totalBitsSorted = 0;

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

/**
* @type { Number }
*/
let moveBitArrayWaitTime = 60;
/**
* @type { Number }
*/
let moveBitArraySpeed = 0.5;

/**
* @type { Number }
*/
let grabBitAscendWaitTime = 60;
/**
* @type { Number }
*/
let grabBitAscendSpeed = 0.5;

/**
* @type { Number }
*/
let grabBitDescendSpeed = 0.5;

/**
* @type { Number }
*/
let notGateChance = 0;


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
    };

    bitPositionArray = [
      vec(2, 75),
      vec(26, 75),
      vec(50, 75),
      vec(74, 75),
      vec(98, 75),
      vec(122, 75)
    ];

    notGateArray = [];

    health = {
      maxHealth: 3,
      currentHealth: 3,
      loseHealth: function (healthLost) {
        this.currentHealth -= healthLost;
        if (this.currentHealth <= 0) {
          difficultyManager.initializeDifficulty();
          end();
        }
      }
    };

    healthIconPositions = [
      vec(29, 93),
      vec(49, 93),
      vec(69, 93)
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
          bitContainerArray[i].pos = vec(bitPositionArray[i].x, bitPositionArray[i].y);
          notGateArray[i].pos = vec(bitPositionArray[i].x, bitPositionArray[i].y-20);
        }
      },
      grabBitAscendEnter: function () {
        setTimer(grabBitAscendWaitTime);
        grabBitContainer.activated = false;
        grabBitContainer.pos = vec(grabBitStartPosition.x, grabBitStartPosition.y);
      },
      grabBitAscendExit: function () {
        grabBitContainer.pos = vec(grabBitEndPosition.x, grabBitEndPosition.y);
        grabBitContainer.activated = true;
        grabBitContainer.givenValue = playerBit.activated;
      },
      grabBitDescendEnter: function () {
      },

      grabBitDescendExit: function () {
        /**
        * @type { BitContainer }
        */
        let bitContainer = bitContainerArray[2];
        bitContainer.activated = true;
        bitContainer.givenValue = grabBitContainer.givenValue;

        if (bitContainer.expectedValue == bitContainer.givenValue) {
          addScore(100);
        } else {
          health.loseHealth(1);
        }

        // Increase total bits sorted and increase difficulty upon passing milestones
        totalBitsSorted++;
        if (difficultyManager.currentDifficulty == 1 && totalBitsSorted >= 3) {
          difficultyManager.increaseDifficulty();
        } 
        else if (difficultyManager.currentDifficulty == 2 && totalBitsSorted >= 7) {
          difficultyManager.increaseDifficulty();
        }
        else if (difficultyManager.currentDifficulty == 3 && totalBitsSorted >= 13) {
          difficultyManager.increaseDifficulty();
        }
        else if (difficultyManager.currentDifficulty == 4 && totalBitsSorted >= 24) {
          difficultyManager.increaseDifficulty();
        }
        else if (difficultyManager.currentDifficulty == 5 && totalBitsSorted >= 40) {
          difficultyManager.increaseDifficulty();
        }
        else if (difficultyManager.currentDifficulty == 6 && totalBitsSorted >= 60) {
          difficultyManager.increaseDifficulty();
        } 

        setTimer(moveBitArrayWaitTime);
      }
		};

    difficultyManager = {
      maxDifficulty: 7,
      currentDifficulty: 1,
      increaseDifficulty: function () {
        this.currentDifficulty++;
        if (this.currentDifficulty > this.maxDifficulty) {
          this.currentDifficulty = this.maxDifficulty;
        }

        switch (this.currentDifficulty) {
          case 2:
            notGateChance = 0.1;
            moveBitArrayWaitTime = 55;
            grabBitAscendWaitTime = 55;

            moveBitArraySpeed = 0.6;
            grabBitAscendSpeed = 0.5;
            grabBitDescendSpeed = 0.6;
            break;
          
          case 3:
            notGateChance = 0.2;
            moveBitArrayWaitTime = 40;
            grabBitAscendWaitTime = 45;
  
            moveBitArraySpeed = 0.8;
            grabBitAscendSpeed = 0.7;
            grabBitDescendSpeed = 0.85;
            break;
          
          case 4:
            notGateChance = 0.3;
            moveBitArrayWaitTime = 25;
            grabBitAscendWaitTime = 30;
    
            moveBitArraySpeed = 1.2;
            grabBitAscendSpeed = 1.1;
            grabBitDescendSpeed = 1.3;
            break;

          case 5:
            notGateChance = 0.38;
            moveBitArrayWaitTime = 10;
            grabBitAscendWaitTime = 15;
    
            moveBitArraySpeed = 1.5;
            grabBitAscendSpeed = 1.4;
            grabBitDescendSpeed = 1.8;
            break;
          
          case 6:
            notGateChance = 0.46;
            moveBitArrayWaitTime = 2;
            grabBitAscendWaitTime = 5;

            moveBitArraySpeed = 1.85;
            grabBitAscendSpeed = 1.7;
            grabBitDescendSpeed = 2.2;
            break;

          case 7:
            notGateChance = 0.5;
            moveBitArrayWaitTime = 0;
            grabBitAscendWaitTime = 0;
  
            moveBitArraySpeed = 2;
            grabBitAscendSpeed = 2;
            grabBitDescendSpeed = 2.5;
            break;
        }
      },
      initializeDifficulty: function () {
        notGateChance = 0;
        moveBitArrayWaitTime = 60;
        grabBitAscendWaitTime = 60;

        moveBitArraySpeed = 0.5;
        grabBitAscendSpeed = 0.5;
        grabBitDescendSpeed = 0.5;
      }
    }

    initializeBitArray();
    setTimer(moveBitArrayWaitTime);
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
  drawHeartIcons();
  drawNotGates();

  if (fsm.currentState == states.GRAB_BIT_ASCEND || fsm.currentState == states.GRAB_BIT_DESCEND) {
    drawGrabContainer();
  }
}


function moveBitArrayUpdate() {
  // Update the positions of all containers in the array
  for (let i = 0; i < bitContainerArray.length; i++) {
    bitContainerArray[i].pos.x -= moveBitArraySpeed;
    notGateArray[i].pos.x -= moveBitArraySpeed;
  }

  // Check if middle container is in the correct spot
  if (bitContainerArray[3].pos.x <= bitPositionArray[2].x) {
    fsm.changeState(states.GRAB_BIT_ASCEND);
  }
}

function grabBitAscendUpdate() {
  grabBitContainer.pos.y -= grabBitAscendSpeed;

  if (grabBitContainer.pos.y <= grabBitEndPosition.y) {
    fsm.changeState(states.GRAB_BIT_DESCEND);
  }
}

function grabBitDescendUpdate() {
  grabBitContainer.pos.y += grabBitDescendSpeed;

  if (grabBitContainer.pos.y >= grabBitStartPosition.y) {
    fsm.changeState(states.MOVE_BIT_ARRAY);
  }
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

  // Also spawn in a new not gate if luck is on your side
  /**
  * @type { NotGate }
  */
  let newNotGate = {
    activated: getNotGateChance(),
    used: false,
    pos: vec(newPos.x, newPos.y-20)
  };
  notGateArray.push(newNotGate);
}

function removeFirstBit() {
  bitContainerArray.shift();
  notGateArray.shift();
}

/**
 * @returns {Boolean}
 */
// Returns true or false if the bit should also spawn a not gate
function getNotGateChance() {
  return Math.random() < notGateChance;
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
      // Display the number in the bit container as light grey if it has not been activated
      if (!bit.activated) {
        color("light_black");

        if (bit.expectedValue) {
          char("b", bit.pos, { scale: vec(2, 2) });
        } else {
          char("a", bit.pos, { scale: vec(2, 2) });
        }
      } 
      // Display the number in the bit container as black or red if it has successfully been activated
      else {
        if (bit.expectedValue != bit.givenValue) {
        color("light_red");
        }

        if (bit.givenValue) {
          char("b", bit.pos, { scale: vec(2, 2) });
        } else {
          char("a", bit.pos, { scale: vec(2, 2) });
        }
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

    /**
    * @type { Boolean }
    */
    let notGateCollided = false;

    if (grabBitContainer.givenValue) {
      notGateCollided = char("b", grabBitContainer.pos, { scale: vec(2, 2) }).isColliding.char.g;
      // Invert the bit in the bit grabber only if collision was found and if the not gate wasn't used
      if (notGateCollided && !notGateArray[2].used) {
        notGateArray[2].used = true;
        grabBitContainer.givenValue = !grabBitContainer.givenValue;
      }
    } else {
      notGateCollided = char("a", grabBitContainer.pos, { scale: vec(2, 2) }).isColliding.char.g;
      // Invert the bit in the bit grabber only if collision was found and if the not gate wasn't used
      if (notGateCollided && !notGateArray[2].used) {
        notGateArray[2].used = true;
        grabBitContainer.givenValue = !grabBitContainer.givenValue;
      }
    }
  }
}

function drawNotGates() {
  color("black");
  for (let i = 0; i < notGateArray.length; i++) {
    if (notGateArray[i].activated) {
      char("e", notGateArray[i].pos.x-2, notGateArray[i].pos.y, { scale: vec(1, 1) });
      char("f", notGateArray[i].pos.x+2, notGateArray[i].pos.y, { scale: vec(1, 1) });
      char("g", notGateArray[i].pos.x, notGateArray[i].pos.y+3, { scale: vec(1, 1) });
    }
  }
}

function drawHeartIcons() {
  color("black");
  for (let i = 0; i < healthIconPositions.length; i++) {
    if (i+1 > health.currentHealth) {
      color("light_black");
    }
    char("d", healthIconPositions[i], { scale: vec(2, 2) });
  }
}

/**
 * @param {Number} timeLimit
 */
function setTimer(timeLimit) {
  timer.elapsedTime = 0;
  timer.timeLimit = timeLimit
}
