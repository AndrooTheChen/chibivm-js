const createMemory = require('./create_memory');
const instructions = require('./instructions');

class CPU {
    constructor(memory) {
        this.memory = memory;
        
        // ip = instruction ptr
        // acc = accumulator, results of math ops
        this.registerNames = [
            'ip', 'acc',
            'r1', 'r2', 'r3', 'r4', 
            'r5', 'r6', 'r7', 'r8',
        ];

        this.registers = createMemory(this.registerNames.length * 2);

        // simply maps the name of the registers in registerNames to
        // the objects stored inside.
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});
    }

    debug() {
        this.registerNames.forEach(name => {
            console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`)
        });
        console.log();
    }

    viewMemoryAt(address) {
        // 0x0f01: 0x04 0x05 0x0A3 0x0FE 0x13 0x80 0x44 0x0F | [addr] : bytes...
        const nextEightBytes = Array.from({length: 8}, (_, i) => 
            this.memory.getUint8(address + i)
        ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`);
    }

    // read a register value
    getRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error(`getRegister: No such register '${name}'`);
        }
        return this.registers.getUint16(this.registerMap[name]);
    }

    // set a register value
    setRegister(name, value) {
        if (!(name in this.registerMap)) {
            throw new Error(`setRegister: No such register '${name}'`);
        }
        return this.registers.setUint16(this.registerMap[name], value);
    }

    fetch() {
        const nextInstructionAddress = this.getRegister('ip');
        const instruction = this.memory.getUint8(nextInstructionAddress);
        this.setRegister('ip', nextInstructionAddress + 1);
        return instruction;
    }

    fetch16() {
        const nextInstructionAddress = this.getRegister('ip');
        const instruction = this.memory.getUint16(nextInstructionAddress);
        this.setRegister('ip', nextInstructionAddress + 2);
        return instruction;
    }

    execute(instruction) {
        console.log(`executing instruction: ${instruction}`);
        switch (instruction) {
            // move literal into the r1 register
            case instructions.MOV_LIT_REG: {
                const literal = this.fetch16();
                const register = (this.fetch() % this.registerNames.length) * 2;
                this.registers.setUint16(register, literal);
                // this.setRegister('r1', literal);
                return;
            }

            // move register to reigster
            case instructions.MOV_REG_REG: {
                const registerFrom = (this.fetch() % this.registerNames.length) * 2;
                const registerTo = (this.fetch() % this.registerNames.length) * 2;
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);
                return;
            }

            // move register to memory
            case instructions.MOV_REG_MEM: {
                const registerFrom = (this.fetch() % this.registerNames.length) * 2;
                const address = this.fetch16();
                const value = this.registers.getUint16(registerFrom);
                console.log(`writing val: ${value} to addr: ${address}`)
                this.memory.setUint16(address, value);
                return;
            }

            // move from memory to register
            case instructions.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = (this.fetch() % this.registerNames.length) * 2;
                const value = this.memory.getUint16(address);
                this.registers.setUint16(registerTo, value);
                return;
            }

            // move literal into the r2 register
            case instructions.MOV_LIT_R2: {
                const literal = this.fetch16();
                this.setRegister('r2', literal);
                return;
            }

            // add two registers and output to accumulator
            case instructions.ADD_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();
                const registerValue1 = this.registers.getUint16(r1 * 2);
                const registerValue2 = this.registers.getUint16(r2 * 2);
                this.setRegister('acc', registerValue1 + registerValue2);
                return;
            }

            case instructions.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value !== this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }
        }
    }

    step() {
        const instruction = this.fetch();
        return this.execute(instruction);
    }
}

module.exports = CPU;