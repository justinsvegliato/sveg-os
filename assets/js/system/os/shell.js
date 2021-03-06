/**  
 * The OS Shell - the "command line interface" (CLI) for the console.
 */

// Creates the field members and initializes the shell
function Shell() {
    // Properties
    this.promptStr = ">";
    this.commandList = [];
    this.inputHistory = new InputHistory();

    this.init();
};

// 
// Methods
//

// Initializes the shell by adding all commands to the command array
Shell.prototype.init = function() {
    // In this method, each command is constructed by instantiating a ShellCommand with 
    // the command name, the description of the command, and the function associated with 
    // the command. 
    
    // The 'ver' command
    var shellCommand = new ShellCommand("ver", "- Displays the current version data", function() {
        Kernel.stdIn.handleResponse(APP_NAME + " v" + APP_VERSION);
    });
    this.commandList.push(shellCommand);

    // The 'help' command
    shellCommand = new ShellCommand("help", "- Lists all available commands", function() {
        if (Kernel.stdIn.handleResponse("Commands:")) {
            Kernel.stdIn.advanceLine();
        }

        // Iterate through every available command
        for (var i = 0; i < Kernel.shell.commandList.length; i++) {
            // Construct and print the command entry in the help message
            var command = Kernel.shell.commandList[i].getCommand();
            var description = Kernel.shell.commandList[i].getDescription();

            // Advance the line if the message was printed to the console
            if (Kernel.stdIn.handleResponse("  " + command + " " + description)) {
                Kernel.stdIn.advanceLine();
            }
        }
    });
    this.commandList.push(shellCommand);

    // The 'shutdown' command
    shellCommand = new ShellCommand("shutdown", "- Shuts down SvegOS", function() {
        Kernel.stdIn.handleResponse("Shutting down...");
        Kernel.shutdown();
    });
    this.commandList.push(shellCommand);

    // The 'cls' command
    shellCommand = new ShellCommand("cls", "- Clears the screen", function() {
        Kernel.stdIn.clearScreen();
        Kernel.stdIn.resetPosition();
        Kernel.stdIn.resetSize();
    });
    this.commandList.push(shellCommand);

    // The 'man' command
    shellCommand = new ShellCommand("man", "<topic> - Displays the manual page for <topic>", function(args) {
        if (args.length > 0) {
            var topic = args[0];
            switch (topic) {
            case "help":
                Kernel.stdIn.handleResponse("Lists all available commands");
                break;
            default:
                Kernel.stdIn.handleResponse("No manual entry for " + args[0]);
            }
        } else {
            Kernel.stdIn.handleResponse("Usage: man <topic>");
        }
    });
    this.commandList.push(shellCommand);

    // The 'trace' command
    shellCommand = new ShellCommand("trace", "<on | off> - Enables/disables the OS trace", function(args) {
        if (args.length > 0) {
            var setting = args[0];
            switch (setting) {
            case "on":
                _Trace = true;
                Kernel.stdIn.handleResponse("Activated trace");
                break;
            case "off":
                _Trace = false;
                Kernel.stdIn.handleResponse("Deactived trace");
                break;
            default:
                Kernel.stdIn.handleResponse("Invalid arguement. Usage: trace <on | off>");
            }
        } else {
            Kernel.stdIn.handleResponse("Usage: trace <on | off>");
        }
    });
    this.commandList.push(shellCommand);

    // The 'rot13' command
    shellCommand = new ShellCommand("rot13", "<string> - Does rot13 enxcryption on <string>", function(args) {
        if (args.length > 0) {
            Kernel.stdIn.handleResponse(args[0] + " = '" + rot13(args[0]) + "'");
        } else {
            Kernel.stdIn.handleResponse("Usage: rot13 <string>");
        }
    });
    this.commandList.push(shellCommand);

    // The 'quantum' command
    shellCommand = new ShellCommand("quantum", "<integer> - Changes the CPU quantum", function(args) {
        if (args.length > 0) {
            if (CpuScheduler.getAlgorithm() !== "First Come First Serve" && CpuScheduler.getAlgorithm() !== "Priority") {
                CpuScheduler.quantum = parseInt(args[0]);
            } else {
                Kernel.stdIn.handleResponse("Quantum cannot be changed in current scheduling mode");
            }
        } else {
            Kernel.stdIn.handleResponse("Usage: quantum <integer>");
        }
    });
    this.commandList.push(shellCommand);

    // The 'prompt' command
    shellCommand = new ShellCommand("prompt", "<string> - Sets the prompt", function(args) {
        if (args.length > 0) {
            Kernel.shell.promptStr = args[0];
        } else {
            Kernel.stdIn.handleResponse("Usage: prompt <string>");
        }
    });
    this.commandList.push(shellCommand);

    // The 'date' command
    shellCommand = new ShellCommand("date", "- Displays the current date and time", function() {
        Kernel.stdIn.handleResponse(new Date().toString());
    });
    this.commandList.push(shellCommand);

    // The 'whereami' command
    shellCommand = new ShellCommand("whereami", "- Displays the current location of the user", function() {
        Kernel.stdIn.handleResponse("The Great Underground Empire");
    });
    this.commandList.push(shellCommand);

    // The 'status' command
    shellCommand = new ShellCommand("status", "<string> - Sets a status message", function(args) {
        if (args.length > 0) {
            var status = "";
            for (var i = 0; i < args.length; i++) {
                status += args[i] + " ";
            }
            TaskBarDisplay.setStatus(status);
        } else {
            Kernel.stdIn.handleResponse("Usage: status <string>");
        }
    });
    this.commandList.push(shellCommand);

    // The 'ps' command
    shellCommand = new ShellCommand("ps", "- Shows all active processes", function(args) {
        // Display a process to the console
        var displayProcess = function(process) {
            var message = "{0} {1} {2} {3} {4} {5} {6}".format(
                pad(process.processId, 4, " "), 
                pad(process.programCounter, 4, " "), 
                pad(process.instructionRegister, 4, " "), 
                pad(process.accumulator, 4, " "), 
                pad(process.xRegister, 4, " "), 
                pad(process.yRegister, 4, " "), 
                pad(process.zFlag, 4, " "));
            Kernel.stdIn.handleResponse(message);
            Kernel.stdIn.advanceLine();
        };

        // Display the process if there is one
        if (CpuScheduler.currentProcess) {    
            // Prints out the header or top row of a column
            var header = "{0} {1} {2} {3} {4} {5} {6}".format(
                pad("PID", 4, " "), 
                pad("PC", 4, " "), 
                pad("IR", 4, " "), 
                pad("ACC", 4, " "), 
                pad("X", 4, " "), 
                pad("Z", 4, " "), 
                pad("Z", 4, " "));
            Kernel.stdIn.handleResponse(header);
            Kernel.stdIn.advanceLine();
            
            displayProcess(CpuScheduler.currentProcess);

            // Iterate through every available command
            for (var i = 0; i < CpuScheduler.readyQueue.getSize(); i++) {
                // Construct and print the process message
                var process = CpuScheduler.readyQueue.dequeue();
                displayProcess(process);
                CpuScheduler.readyQueue.enqueue(process);
            }
        } else {
            Kernel.stdIn.handleResponse("No active processes");
        }
    });
    this.commandList.push(shellCommand);

    // The 'kill' command
    shellCommand = new ShellCommand("kill", "<integer> - Terminates the specified process", function(args) {
        // Get the pcb associated with the specified id
        var pcb = ProcessManager.processControlBlocks[args[0]];

        // Kill the process if it is not null, otherwise print an error
        if (pcb) {
            Kernel.handleInterupts(SYSTEM_CALL_IRQ, [0, pcb]);
        } else {
            Kernel.stdIn.handleResponse("Unrecognized process ID");
        }
    });
    this.commandList.push(shellCommand);

    // The 'load' command
    shellCommand = new ShellCommand("load", "[<priority>] - Loads the specified user program", function(args) {
        var program = document.getElementById('taProgramInput').value.trim();
        this.validate = function(program) {
            // Print an error if the input is empty
            if (program.length <= 0) {
                return "No program was specified";
            }            

            // Split the input space and interate through each command
            var components = program.split(/\s+/);
            if (components.length <= MemoryManager.BLOCK_SIZE) {
                for (var i = 0; i < components.length; i++) {
                    // Print an error if the instruction contains an invalid character (non-hexidecimal)
                    if (!components[i].match(/^[a-f0-9]+$/i)) {
                        return "Invalid character: " + components[i];
                    }
                }

                // Load the program into memory and display the process id - if no priority
                // is specifid it is given the lowest priority
                var priority = CpuScheduler.LOWEST_PRIORITY;
                if (args.length > 0) {
                    if (!isNaN(args[0])) {
                        // Convert string into integer
                        priority = parseInt(args[0]);

                        // Just set it to the highest priority if the argument is higher than the highest priority
                        if (priority > CpuScheduler.LOWEST_PRIORITY) {
                            priority = CpuScheduler.LOWEST_PRIORITY;
                        }

                        // Just set the priority to 0 if a negatie number was specified
                        if (priority < 0) {
                            priority = 0;
                        }  
                    } else {
                        return "Invalid priority";
                    }
                } 
                
                // Load the program into the manager
                var pcb = ProcessManager.load(program, priority);
                if (pcb) {
                    return "Process ID: " + pcb.processId;
                }
            } else {
                return "Program is too large";
            }
            
        };
        Kernel.stdIn.handleResponse(validate(program));
    });
    this.commandList.push(shellCommand);

    // The 'filter' command
    shellCommand = new ShellCommand("\\", "<regex> <function> - Filters function output", (function self(args) {
        // If all parameters were supplied, handle filter logic
        if (args.length >= 2) {
            var input = "";
            // Essentially rip the command that the user wants to filter out of the 
            // arguments list. For instance, if we have "\ x help:, the following code will
            // set the input variable to "help". On the other hand, if we have "\x \x help",
            // the following code will set the input variable to "\x help".
            for (var i = 1; i < args.length; i++) {
                input += args[i] + " ";
            }

            // Parse the input again to retrieve the command being filtered and then get 
            // the shell command as well
            var userCommand = Kernel.shell.parseInput(input);
            var shellCommand = Kernel.shell.getShellCommand(userCommand);

            // If the shell command was acutally valid, handle the filter logic
            if (shellCommand) {
                // Add this filter to the kernel's filter variable
                Kernel.stdIn.filters.push(new RegExp(args[0], "i"));

                // However, if the user command is also a filter, then we need to recurse
                // to handle the additional filter, otherwise we execute the command
                if (userCommand.getCommand() === "filter") {
                    args = input.trim().split(" ");
                    args.shift();
                    self(args);
                } else {
                    shellCommand(userCommand.getArguments());
                }

                // Make sure to reset the filters after this process is complete so we don't
                // unfortunately filter other input :)
                Kernel.stdIn.filters = [];
            } else {
                Kernel.stdIn.handleResponse("Invalid fuction");
            }
        } else {
            Kernel.stdIn.handleResponse("Usage: find <regex> <function>");
        }
    }));
    this.commandList.push(shellCommand);

    // The 'bsod' command
    shellCommand = new ShellCommand("bsod", "- Enables the blue screen of death", function() {
        Kernel.trapError("Enabled bsod via command");
    });
    this.commandList.push(shellCommand);

    // The 'run' command
    shellCommand = new ShellCommand("run", "<processid> - Executes a program in memory", function(args) {
        // Get the pcb associated with the specified id
        var processId = args[0];
        var pcb = ProcessManager.processControlBlocks[args[0]];

        // Execute the process if it is not null, otherwise print an error
        if (pcb) {        
            if (pcb.state === ProcessControlBlock.State.NEW) {
                ProcessManager.execute(pcb);
            } else {
                Kernel.stdIn.handleResponse("Process already executing: " + processId);
            }
        } else {
            Kernel.stdIn.handleResponse("Unrecognized process ID: " + processId);
        }
    });
    this.commandList.push(shellCommand);

    // The 'runall' command
    shellCommand = new ShellCommand("runall", "- Executes all programs", function(args) {
        // Execute all available processes
        if (ProcessManager.processControlBlocks.length) {
            Kernel.stdIn.handleResponse("Unrecognized process ID");
        } else {
            // Execute all processes
            for (var key in ProcessManager.processControlBlocks) {
                var pcb = ProcessManager.processControlBlocks[key];
                // Only execture a process if it is not yet running
                if (pcb.state === ProcessControlBlock.State.NEW) {
                    ProcessManager.execute(pcb);
                }
            }
        }
    });
    this.commandList.push(shellCommand);
    
    // The 'create' command
    shellCommand = new ShellCommand("create", "<filename> - Creates the specified file", function(args) {
        if (args.length > 0) {
            Kernel.handleInterupts(DISK_OPERATION_IRQ, ["create", args[0]]);
        } else {
            Kernel.stdIn.handleResponse("Usage: create <filename>");
        }
    });
    this.commandList.push(shellCommand);
    
    // The 'read' command
    shellCommand = new ShellCommand("read", "<filename> - Reads the specified file", function(args) {
        if (args.length > 0) {
            Kernel.handleInterupts(DISK_OPERATION_IRQ, ["read", args[0]]);
        } else {
            Kernel.stdIn.handleResponse("Usage: read <filename>");
        }
    });
    this.commandList.push(shellCommand);
    
    // The 'write' command
    shellCommand = new ShellCommand("write", "<filename> \"data\" - Writes the specified file", function(args) {
        if (args.length >= 2 ) {
            // Creates the variable containing data (must iterate through all arguments because
            // the data may be spaced delimited)
            var data = "";
            for (var i = 1; i < args.length; i++) {
                data += args[i] + " ";
            }

            // Writes the file if there are quotes around the data
            if ((data.charAt(0) === "\"") && (data.charAt(data.length - 2) === "\"")) {
                data = data.slice(1).slice(0, data.length - 3);
                Kernel.handleInterupts(DISK_OPERATION_IRQ, ["write", args[0], data]);
            } else {
                Kernel.stdIn.handleResponse("Data must be surrounded by quotes");
            }
        } else {
            Kernel.stdIn.handleResponse("Usage: write <filename> \"data\"");
        }
    });
    this.commandList.push(shellCommand);
    
    // The 'delete' command
    shellCommand = new ShellCommand("delete", "<filename> - Deletes the specified file", function(args) {
        Kernel.handleInterupts(DISK_OPERATION_IRQ, ["delete", args[0]]);
    });
    this.commandList.push(shellCommand);
    
    // The 'format' command
    shellCommand = new ShellCommand("format", "- Initializes disk", function() {      
        Kernel.handleInterupts(DISK_OPERATION_IRQ, ["format"]);
    });
    this.commandList.push(shellCommand);
    
    // The 'ls' command
    shellCommand = new ShellCommand("ls", "- Lists all files on disk", function() {
        Kernel.handleInterupts(DISK_OPERATION_IRQ, ["ls"]);
    });
    this.commandList.push(shellCommand);
    
    // The 'setschedule' command
    shellCommand = new ShellCommand("setschedule", "- [rr, fcfs, priority] Sets the algorithm", function(args) {
        if (!args[0] || !CpuScheduler.setAlgorithm(args[0])) {
            Kernel.stdIn.handleResponse("Unrecognized scheduling algorithm");
        }
    });
    this.commandList.push(shellCommand);
    
    // The 'getschedule' command
    shellCommand = new ShellCommand("getschedule", "- Gets the algorithm", function(args) {
        Kernel.stdIn.handleResponse(CpuScheduler.getAlgorithm());
    });
    this.commandList.push(shellCommand);    
    
    this.putPrompt();
};

// Sets the prompt string
Shell.prototype.putPrompt = function() {
    Kernel.stdIn.putText(this.promptStr);
};

// Executes the user input if the command is valid
Shell.prototype.handleInput = function(buffer) {
    // Attempt to execute the command if the user entered text, otherwise print the prompt
    if (buffer) {
        Kernel.trace("Shell Command: " + buffer);

        // Constructs the function to be executed
        var userCommand = this.parseInput(buffer);
        var fn = this.getShellCommand(userCommand);
        var args = userCommand.getArguments();

        // Add the input even if not valid to the history for command recall
        this.inputHistory.add(userCommand);

        // Execute the command if a valid command was found
        if (fn) {
            this.execute(fn, args);
        } else {
            Kernel.stdIn.advanceLine();
            Kernel.stdIn.handleResponse("Invalid Command. Type 'help' to see all commands.");
            Kernel.stdIn.advanceLine();
            this.putPrompt();
        }
    } else {
        Kernel.stdIn.advanceLine();
        this.putPrompt();
    }
};

// Handles command recall allowing the user to traverse through previously entered commands
Shell.prototype.traverseHistory = function(chr) {
    // If the up arrow key pressed, otherwise the down arrow was pressed
    if (chr === "UP") {
        this.inputHistory.backward();
    } else {
        this.inputHistory.forward();
    }
    return this.inputHistory.getInput();
};

// Handles the execution of the command as well as the state of the console
Shell.prototype.execute = function(fn, args) {
    Kernel.stdIn.advanceLine();

    // Executes the command by sending the first-order function arguments
    fn(args);

    // Advance the line and replace the prompt if anything was printed to the screen
    if (Kernel.stdIn.xPosition > 0) {
        Kernel.stdIn.advanceLine();
    }
    this.putPrompt();
};

// Gets the shell command associated with the user's input
Shell.prototype.getShellCommand = function(userCommand) {
    // Check the user input against every shell command
    var fn = null;
    $.each(this.commandList, function(index, value) {
        // We've found the command if the input command is the same as a shell command
        if (value.getCommand() === userCommand.getCommand() && !fn) {
            fn = value.getFunction();
        }
    });
    return fn;
};

// Parses the user input in order to create a user command object
Shell.prototype.parseInput = function(buffer) {
    // Nornalizes the input and splits it based on white space 
    var components = trim(buffer).toLowerCase().split(" ");

    // Retrieves the command by removing the first element of the user input
    var command = trim(components.shift());

    // Creates the argument list by adding the remaining elements to an array
    var args = [];
    for (var i in components) {
        var arg = trim(components[i]);
        if (arg !== "") {
            args.push(arg);
        }
    }
    return new UserCommand(command, args);
};


// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect JavaScript, we'd be
// able to make then private.  (Actually, we can. have a look at Crockford's stuff and 
// Resig's JavaScript Ninja cook.)
//

//
// An interior class to represent shell commands
//
function ShellCommand(command, description, fn) {
    // Properties
    var _command = command;
    var _description = description;
    var _fn = fn;

    // Methods
    this.getCommand = function() {
        return _command;
    };

    this.getDescription = function() {
        return _description;
    };

    this.getFunction = function() {
        return _fn;
    };
}

//
// An interior class to represent user commands
//
function UserCommand(command, args) {
    // Properties
    var _command = command;
    var _args = args;

    // Methods
    this.getCommand = function() {
        return _command;
    };

    this.getArguments = function() {
        return _args;
    };
}

// 
// An interior class to represent and traverse the input history
//
function InputHistory() {
    //
    // Properties
    //
    var history = [];
    var position = -1;

    //
    // Methods
    //

    // Iterates backward in time (this is recalling previous commands)
    this.backward = function() {
        if (position < history.length - 1) {
            position++;
        }
    };

    // Iterates forward in time (this is recalling more recent commands)
    this.forward = function() {
        if (position > -1) {
            position--;
        }
    };

    // Adds the the specified command to the input history; note that this doesn't merely have
    // to be a valid command. Invalid inputs are also entered into the input history (as 
    // is done on Linux).
    this.add = function(command) {
        var arguments = "";
        if (command.getArguments().length > 0) {
            arguments = " ";
            for (var i = 0; i < command.getArguments().length; i++) {
                var delimiter = (i === command.getArguments().length - 1) ? "" : " ";
                arguments += command.getArguments()[i] + delimiter;
            }
        }
        var newCommand = command.getCommand() + arguments;
        history.unshift(newCommand);
        position = -1;
    };

    // Retrieves the current command based on if forward or backward has been called previously
    this.getInput = function() {
        return (position === -1) ? "" : history[position];
    };
}