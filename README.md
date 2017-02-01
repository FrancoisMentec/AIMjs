<h1 align='center'>
  AIMjs
</h1>

## What is AIMjs ?
AIMjs is a javascript library designed to build AI using a standard tree of states system.
Popular algorithms like breadth-first, depth-first or A* are implemented and easy to use.
Take a look at our examples to discover the power of AIMjs.

## Quickstart
* First set up your project by including **AIM.js**, form this just run `npm install --save aimjs` and include it as any npm package `var AIM = require('aimjs')`. Set a public path to the module to use it client side `app.use('/AIM', express.static(__dirname + '/node_modules/aimjs'))` (or just move the file somewhere) and include it in your html page `<script type='text/javascript' src='/AIM/AIM.min.js'></script>`.
A beautiful tree with all explored state can be a good way to find bugs or optimize a AI, to use this feature you need to include **Treant.js**, **raphael.js** and **Treant.css**.

* Now you have to think about how to represents a state, AIMjs can't do this for you.
In this example we will take a glass reversing game : there are 7 glasses, some of them are upside-down, our state will be an array of bits with 0 for an upside-down glass. So our initial state is `[0, 1, 0, 0, 1, 0, 1]` and our final state is `[1, 1, 1, 1, 1, 1, 1]`.

* Next step is to create a function `getSuccessors(state)` that return a array which contains all successors of the state passed as parameter. In our case we can reverse only two adjacent glass so we have 6 successors for each case (reverse glass 0 and 1, 1 and 2, ..., 5 and 6). The function is :

      var getSuccessors = function (state) {
        var successors = []

        for(var i = 0; i < state.length - 1; i++){
          var newState = AIM.clone(state);

          newState[i] = (newState[i] + 1) % 2
          newState[i + 1] = (newState[i + 1] + 1) % 2
          successors.push(newState)
        }

        return successors
      }

* Now the hardest part is done we just have to instanciate and run the AI :

      var glassReverseAI = AIM.AI({
        initState: [0, 1, 0, 0, 1, 0, 1],
        finalState: [1, 1, 1, 1, 1, 1, 1],
        getSuccessors: getSuccessors
      })
      var result = glassReverseAI.execute('breadth-first')
      result.print()


There are multiples example, 8-puzzle is a perfect AI to understand how AIMjs work and how to use A* with a specified heuristic and draw a tree.
