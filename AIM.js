(function () {
  var AIM = (function () {
    var AIM = {}

    AIM.test = 'hello world'

    /**
     * Return if var1 is equals to var2.
     * @param {*} var1 - the variable to compare.
     * @param {*} var2 - the variable to compare with.
     * @return {boolean} If both variable are equals.
     */
    AIM.equals = function (var1, var2) {
    	var equals = typeof var1 === typeof var2
    	if (equals) {
    		if (typeof var1 === 'object') {
    			var equals = true
    			for (var i in var1) {
    				if (!this.equals(var1[i], var2[i])) {
    					equals = false
    					break
    				}
    			}
    		} else {
    			equals = var1 === var2
    		}
    	}
    	return equals
    }

    /**
     * Clone an object.
     * @param {*} obj - The object to clone.
     * @return {*} A clone of obj.
     */
    AIM.clone = function (obj) {
    	var clone = null
    	if (typeof obj === 'object') {
    		if (Array.isArray(obj)) {
    			clone = []
    			var i = 0
    			for (var i = 0; i < obj.length; i++) {
    				clone[i] = this.clone(obj[i])
    			}
    		} else {
    			clone = {}
    			for (var p in obj) {
    				clone[p] = this.clone(obj[p])
    			}
    		}
    	} else {
    		clone = obj
    	}
    	return clone
    }

    /**
     * Return a string that represents a specified object.
     * @param {*} obj - The object to represents.
     * @return {string} A string that represents obj.
     */
    AIM.toString = function (obj, depth) {
      depth = typeof depth === 'undefined'
        ? 0
        : depth

    	var str = ''
    	if (typeof obj === 'object') {
    		if (Array.isArray(obj)) {
    			str += '['
    			for (var i = 0; i < obj.length; i++) {
    				if (i > 0) str += ', '
    				str += this.toString(obj[i])
    			}
    			str += ']'
    		} else {
    			str += '{'
    			var first = true
    			for (var i in obj) {
    				if (first) {
    					first = false
    				} else {
    					str += ','
    				}
    				str += i + ': ' + this.toString(obj[i], depth + 1)
    			}
    			str += '}'
    		}
    	} else if (typeof obj === 'function') {
    		str += 'function (...) { ... }'
    	} else if (typeof obj === 'string') {
    		str += "'" + obj + "'"
    	} else {
    		str += obj
    	}
    	return str
    }

    /**
     * Return the index in an array of a specified state.
     * @param {State} state - The state to search for.
     * @param {array} array - The array to search in.
     * @return {number} Index of state in array, -1 if not inside.
     */
    AIM.indexOfState = function (state, array) {
    	var index = -1
    	for (var i = 0; i < array.length; i++) {
    		if (state.equals(array[i])) {
    			index = i
    			break
    		}
    	}
    	return index
    }

    /**
     * Return a html string to display an array of states in the DOM.
     * @param {State[]} array - The array to display.
     * @param {string} title - The array's title.
     * @return {string} A html string that represents an array of states.
     */
    AIM.stateArrayToHTML = function (array, title) {
      var html = "<div class='state-array'><div class='state-array-title'>" + title + "</div><div class='state-array-content'>"
      if (array.length == 0) {
        html += 'empty'
      } else {
        for (var i in array) {
          html += "<div class='state'>" + array[i].toHTML() + "</div>"
        }
      }
      html += '</div></div>'
      return html
    }

    /**************************************************************************************************************************************************************************************************/
    // AI

    /**
     * An AI.
     * @constructor
     * @param {object} config - An object that contains params to build the AI
     * @param {*} initState - The initial state, can be anything who choosed to represent it exept a function.
     * @param {*} finalState - The final state, has to be of the same type as initState OR a function that take a state (same type as initState) as parameter and return a boolean at true if it's a final state.
     * @param {function} getSuccessors - A function that take a state (same type as initState) as parameter and return an array with all of his successors.
     * @param {function} equals - A function that compare two states (same type as initState) return if they are equals, if not specified use AIM.equals instead.
     * @param {function} toHTML - A function that return a HTML String to represents a specified state of type State (type specified by user is in state.struct), if not specified use AIM.toString on state.struct.
     * @property {State} initState - The initial state.
     * @property {function} heuristic - The heuristic function.
     */
    AIM.AI = function (config) {
      if (typeof config !== 'object') throw new Error('config is undefined or not of type object')
      var ai = {}

      if (typeof config.initState === 'undefined') throw new Error('config.initState is undefined')
      ai.initState = AIM.State(ai, config.initState)

      if (typeof config.finalState === 'undefined') throw new Error('config.finalState is undefined')
      ai.finalState = config.finalState

      if (typeof config.getSuccessors !== 'function') throw new Error('config.getSuccessors is not a function')
      ai.getSuccessors = config.getSuccessors

      ai.equals = typeof config.equals === 'function'
        ? config.equals
        : null

      ai._stateToHTML = typeof config.toHTML === 'function'
        ? config.toHTML
        : null

      ai.heuristic = typeof config.heuristic === 'function'
        ? config.heuristic
        : null

        /**
         * Check if a state is final.
         * @param {State} state - A state to check.
         * @return {boolean} If state is final.
         */
        ai.isFinal = function (state) {
          if (typeof ai.finalState === 'function') {
            return ai.finalState(state.struct)
          }
          return ai.areEquals(state.struct, ai.finalState)
        }

        /**
         * Check if two states are equals.
         * @param {*} state1 - A state (same type that user's type, State.struct) to compare with state2.
         * @param {*} state2 - A state (same type that user's type, State.struct) to compare with state1.
         * @return {boolean} If both states are equals.
         */
        ai.areEquals = function (state1, state2) {
          return ai.equals == null
            ? AIM.equals(state1, state2)
            : ai.equals(state1, state2)
        }

        /**
         * Calculate heuristic for a specified state.
         * @param {State} state - The state.
         * @return {number} The heuristic of state.
         */
        ai.h = function (state) {
          if (ai.heuristic == null) {
            throw new Error('No heuristic specified')
          }
          return ai.heuristic(state.struct)
        }

        /**
         * Return a HTML string that represents a specified State.
         * @param {State} state - The state to represent.
         * @return {string} The representation.
         */
        ai.stateToHTML = function (state) {
          return ai._stateToHTML != null
            ? ai._stateToHTML(state)
            : AIM.toString(state.struct)
        }

        /**
         * Execute the AI using a specified algorithm.
         * @param {string} algorithm - Algorithm to use : breadth-first, depth-first, A* (more comming soon).
         * @param {number} maxDepth - The maximum depth to search, optional but highly recommended.
         * @param {function} heuristic - A function that return an heuristic (number => 0) for a specified state (same type than initState).
         * @return {Result} An object of type Result.
         */
        ai.execute = function (algorithm, maxDepth) {
          var result = null
          if (algorithm === 'breadth-first') {
            result = ai.breadthFirst(maxDepth)
          } else if (algorithm === 'depth-first') {
            result = ai.depthFirst(maxDepth)
          } else if (algorithm === 'A*') {
            result = ai.aStar(maxDepth)
          } else if (typeof algorithm === 'undefined') {
            throw new Error('No algorithm specified')
          } else {
            throw new Error('Unknown algorithm ' + algorithm + ' check documentation to know implemented algorithms')
          }
          return result
        }

        /**
         * Execute a breadth-first algorithm.
         * @param {number} maxDepth - The maximum depth to search, optional but highly recommended.
         * @return {Result} An object that contains everything you need to know about execution.
         */
        ai.breadthFirst = function (maxDepth) {
          var start = (new Date()).getTime()
          var open = [ai.initState]
          var close = []
          var success = false
          var turn = 0

          while (open.length > 0 && !success) {
            turn++
            var state = open[0]
            if (state.isFinal()) {
              success = true
            } else if (typeof maxDepth === 'undefined' || state.depth < maxDepth) {
              var successors = state.getSuccessors()
              close.push(open.shift())
              for (var s in successors) {
                var successor = successors[s]
                if (AIM.indexOfState(successor, open) === -1 && AIM.indexOfState(successor, close) === -1) {
                  open.push(successor)
                }
              }
            } else {
              close.push(open.shift())
            }
          }

          var time = (new Date()).getTime() - start

          return AIM.Result(success, 'breadth-first', time, turn, open[0], open, close)
        }

        /**
         * Execute a depth-first algorithm.
         * @param {number} maxDepth - The maximum depth to search, optional but highly recommended.
         * @return {Result} An object that contains everything you need to know about execution.
         */
        ai.depthFirst = function (maxDepth) {
          var start = (new Date()).getTime()
          var open = [ai.initState]
          var close = []
          var success = false
          var turn = 0

          while (open.length > 0 && !success) {
            turn++
            var state = open[open.length - 1]
            if (state.isFinal()) {
              success = true
            } else if (typeof maxDepth === 'undefined' || state.depth < maxDepth) {
              var successors = state.getSuccessors()
              close.push(open.pop())
              for (var s in successors) {
                var successor = successors[s]
                var indexInOpen = AIM.indexOfState(successor, open)
                var indexInClose = AIM.indexOfState(successor, close)
                if (indexInOpen === -1 && (indexInClose === -1 || successor.depth < close[indexInClose].depth)) {
                  open.push(successor)
                } else if (indexInOpen !== -1 && successor.depth < open[indexInOpen].depth) {
                  open[indexInOpen].father = state
                }
              }
            } else {
              open.pop()
            }
          }

          var time = (new Date()).getTime() - start

          return AIM.Result(success, 'depth-first', time, turn, open[open.length - 1], open, close)
        }

        /**
         * Execute a A* algorithm.
         * @param {function} heuristic - A function that take a state as parameter (same type than initState) and return an heuristic (number).
         * @param {number} maxDepth - The maximum depth to search, optional but highly recommended.
         * @return {Result} An object that contains everything you need to know about execution.
         */
        ai.aStar = function (maxDepth) {
          if (ai.heuristic == null) throw new Error('An heuristic is needed for A*')
          var start = (new Date()).getTime()
          var open = [ai.initState]
          var close = []
          var success = false
          var turn = 0
          var solution = null

          while (open.length > 0 && !success) {
            turn++
            var index = -1
            var state = null
            //var f = 0
            for (var i = 0; i < open.length; i++) {
              if (state == null || open[i].f < state.f) {
                index = i
                state = open[i]
              }
            }
            //console.log(state)
            if (state.isFinal()) {
              success = true
              solution = state
            } else if (typeof maxDepth === 'undefined' || state.depth < maxDepth) {
              var successors = state.getSuccessors()
              close.push(open.splice(index, 1)[0])
              for (var s in successors) {
                var successor = successors[s]
                var indexInOpen = AIM.indexOfState(successor, open)
                var indexInClose = AIM.indexOfState(successor, close)
                if (indexInOpen === -1 && (indexInClose === -1 || successor.depth < close[indexInClose].depth)) {
                  open.push(successor)
                } else if (indexInOpen !== -1 && successor.depth < open[indexInOpen].depth) {
                  open[indexInOpen].father = state
                }
              }
            } else {
              open.splice(index, 1)
            }
          }

          var time = (new Date()).getTime() - start

          return AIM.Result(success, 'A*', time, turn, solution, open, close)
        }

      return ai
    }

    /**************************************************************************************************************************************************************************************************/
    // State

    /**
     * Represents a state, you are not suposed to instanciate it in your app.
     * @constructor
     * @property {AI} ai - The ai.
     * @property {*} struct - State as specified by the user.
     * @property {State} father - Father of the state, equals to null for the initial state.
     * @property {number} depth - The depth of the state in the graph, equals to 0 for the initial state.
     */
    AIM.State = function (ai, struct, father) {
      var state = {}
      state.ai = ai
      state.struct = struct
      state._father = null
      state.depth = 0
      state._h = null

      /**
       * The father of the state, if father change depth is updated.
       */
      Object.defineProperty(state, 'father', {
        set: function (father) {
          state._father = father
          state.depth = father != null
            ? father.depth + 1
            : 0
        },
        get: function () {
          return state._father
        }
      })

      state.father = typeof father === 'undefined'
        ? null
        : father

      /**
       * h is the heuristic of the state
       */
      Object.defineProperty(state, 'h', {
        get: function () {
          if (state._h == null) {
            state._h = state.ai.h(state)
          }
          return state._h
        }
      })

      /**
       * f of the state (State.f = State.depth + AI.h(state))
       */
      Object.defineProperty(state, 'f', {
        get: function () {
          return state.depth + state.h
        }
      })

      /**
       * Return a HTML string that srepresent the state.
       * @return {string} The HTML string.
       */
      state.toHTML = function () {
        return state.ai.stateToHTML(state)
      }

      /**
       * Return if the state is final using AI.isFinal.
       * @return {boolean} If the state is final.
       */
      state.isFinal = function () {
        return state.ai.isFinal(state)
      }

      /**
       * Return an array that contains all successors of the state.
       * @return {State[]} An array that contains all successors of the state.
       */
      state.getSuccessors = function () {
        var successorsStruct = state.ai.getSuccessors(state.struct)
        var successors = []
        for (var s in successorsStruct) {
          successors.push(AIM.State(state.ai, successorsStruct[s], state))
        }
        return successors
      }

      /**
       * Check if the state is equals to another state.
       * @param {State} stateToComp - The state to compare with.
       * @return {boolean} If both states are equals.
       */
      state.equals = function (stateToComp) {
        return state.ai.areEquals(state.struct, stateToComp.struct)
      }

      return state
    }

    /**************************************************************************************************************************************************************************************************/
    // Result

    /**
     * Data returned after running an algorithm, you are not supposed to instanciate it in your app.
     * @constructor
     * @property {boolean} success - If the sun is a success.
     * @property {string} algorithm - Algorithm used.
     * @property {number} time - Number of ms to execute the algorithm.
     * @property {number} turn - Number of loop turn.
     * @property {State} solution - The final state reached.
     * @property {State[]} open - Every opened states (not explored).
     * @property {State[]} close - Every closed states (explored).
     * @property {State[]} resolution - An array that contains the succession of states to reach the solution (index 0 is the initial state).
     */
    AIM.Result = function (success, algorithm, time, turn, solution, open, close) {
      var result = {}
      result.success = success
      result.algorithm = algorithm
      result.time = time
      result.turn = turn
      result.solution = solution
      result.open = open
      result.close = close
      result.resolution = []
      if(result.success){
        var state = result.solution
        while (state != null) {
            result.resolution.unshift(state)
            state = state.father
        }

        result.depth = result.solution.depth
      } else {
        result.depth = 0
        for (var i = 0; i < result.open.length; i++) {
          if (result.open[i].depth > result.depth) result.depth = result.open[i].depth
        }
        for (var i = 0; i < result.close.length; i++) {
          if (result.close[i].depth > result.depth) result.depth = result.close[i].depth
        }
      }

      /**
       * Print the result in the console.
       * @param {boolean} printArrays - To display resolution, open and close state's arrays (can flood the console in nodejs, better in a modern browser).
       */
      result.print = function (printArrays) {
        printArrays = typeof printArrays === 'undefined'
          ? false
          : printArrays

        var str = result.success
          ? 'Success'
          : 'Failure'
        str += ' with algorithm ' + result.algorithm + ' in ' + result.time + ' ms after ' + result.turn + ' turns at depth ' + result.depth
        console.log(str)

        if (printArrays) {
          if (result.success) {
            console.log('Resolution : ')
            console.log(result.resolution)
          }

          console.log('Opened states :')
          console.log(result.open)
          console.log('Closed states :')
          console.log(result.close)
        }
      }

      /**
       * Return a html string to display result in the DOM, use the toHTML function specified by the user in AI constructor to represent a state.
       * @param {boolean} open - True to display the opened states array.
       * @param {boolean} close - True to display the closed states array.
       * @return {string} A html string that represents the result.
       */
      result.html = function (toHTML, open, close) {
        open = typeof open === 'undefined'
          ? false
          : open
        close = typeof close === 'undefined'
          ? false
          : close

        var html = "<div class='result-success-value "
        html += result.success
          ? "success'>Success"
          : "failure'>Failure"
          html += '</div>'
        html += "<div class='result-info'><div class='result-info-name'>Algorithm :</div> " + result.algorithm + '</div>'
        html += "<div class='result-info'><div class='result-info-name'>Turns :</div> " + result.turn + '</div>'
        html += "<div class='result-info'><div class='result-info-name'>Depth :</div> " + result.depth + '</div>'

        if (result.success) {
          html += AIM.stateArrayToHTML(result.resolution, 'Resolution')
        }

        if (open) {
          html += AIM.stateArrayToHTML(result.open, 'Opened states')
        }
        if (close) {
          html += AIM.stateArrayToHTML(result.close, 'Closed states')
        }
        return html
      }

      /**
       * Draw a tree of all States in the specified container using Trean.js.
       * @param {string} container - A string to identify the container with jQuery.
       */
      result.drawTree = function (container) {
        if (typeof Treant !== 'function') throw new Error('Treant.js is required to draw tree (Trean.js require raphael.js)')
        var treeConfig = {
          chart: {
            container: container
          },
          nodeStructure: null
        }

        //Create all nodes
        for (var i = 0; i < result.close.length; i++) {
          result.close[i].node = {
            innerHTML: result.close[i].toHTML(),
            children: []
          }
        }

        for (var i = 0; i < result.open.length; i++) {
          result.open[i].node = {
            innerHTML: result.open[i].toHTML(),
            children: []
          }
        }

        //Push all nodes into father node
        for (var i = 0; i < result.close.length; i++) {
          if (result.close[i].father != null) {
            result.close[i].father.node.children.push(result.close[i].node)
          } else {
            treeConfig.nodeStructure = result.close[i].node
          }
        }

        for (var i = 0; i < result.open.length; i++) {
          if (result.open[i].father != null) {
            result.open[i].father.node.children.push(result.open[i].node)
          } else {
            treeConfig.nodeStructure = result.open[i].node
          }
        }

        new Treant(treeConfig)
      }

      return result
    }

    return AIM
  })()

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = AIM
  } else if (typeof define === 'function' && define.amd) {
    define([], function() { return AIM })
  } else {
    window.AIM = AIM;
  }
})()
