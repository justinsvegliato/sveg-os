// Empty constructor - this class is essentially a singleton in a certain sense
function SystemCallLibrary() {};

// Terminates the process
SystemCallLibrary.terminateProcess = function(params) {
    // Clean up the cpu and the process manger (set everything back to default settings)
    var pcb = params[0];
    _CPU.stop();
    ProcessManager.unload(pcb);
    Kernel.console.handleProcessOutput(pcb.output);
};

// Print the contents of the y Register.
SystemCallLibrary.printYRegisterValue = function(params) {
    var pcb = params[0];
    var yRegister = params[1];
    Kernel.console.putText(yRegister.toString());
    pcb.output += yRegister.toString();
};

// Print the 00-terminated string starting at the memory location held by the y register
SystemCallLibrary.printNullTerminatedString = function(params) {
    var pcb = params[0];
    var yRegister = params[1];
    var byte = null;
    var memoryLocation = yRegister;
    // Keep looping unless we see a "00" (or a 0 since we call parseInt on the value
    // at the memory location
    while ((byte = parseInt(MemoryManager.read(memoryLocation++), 16)) !== 0) {
        Kernel.console.putText(String.fromCharCode(byte));
        pcb.output += String.fromCharCode(byte);
    }
};

// Dictionary that maps the system call id to a particular function
SystemCallLibrary.systemCallInterface = {
    0: SystemCallLibrary.terminateProcess,
    1: SystemCallLibrary.printYRegisterValue,
    2: SystemCallLibrary.printNullTerminatedString
};