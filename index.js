const readline = require('readline');
const createMemory = require('./create_memory');
const instructions = require('./instructions');
const CPU = require('./cpu');

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

let i = 0;

// MEM[0x0100] -> R1
writableBytes[i++] = instructions.MOV_MEM_REG;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;
writableBytes[i++] = R1;

// 0x001 -> R2
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x01;
writableBytes[i++] = R2;

// R1 + R2 -> ACC
writableBytes[i++] = instructions.ADD_REG_REG;
writableBytes[i++] = R1;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.MOV_REG_MEM;
writableBytes[i++] = ACC;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;

writableBytes[i++] = instructions.JMP_NOT_EQ
writableBytes[i++] = 0x00;  // 0x003
writableBytes[i++] = 0x03;
writableBytes[i++] = 0x00;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', () => {
    cpu.step();
    cpu.debug();
    cpu.viewMemoryAt(cpu.getRegister('ip'));
    cpu.viewMemoryAt(0x0100);
});