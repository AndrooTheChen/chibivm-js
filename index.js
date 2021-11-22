const createMemory = require('./create_memory');
const instructions = require('./instructions');
const CPU = require('./cpu');

const memory = createMemory(256);
const writableBytes = new Uint8Array(memory.buffer);

writableBytes[0] = instructions.MOV_LIT_R1;
writableBytes[1] = 0x12; // 0x1234
writableBytes[2] = 0x34;

writableBytes[3] = instructions.MOV_LIT_R2;
writableBytes[4] = 0xAB; // 0xABCD
writableBytes[5] = 0xCD;

writableBytes[6] = instructions.ADD_REG_REG;
writableBytes[7] = 2;   // r1 index
writableBytes[8] = 3;   // r2 index\

const cpu = new CPU(memory);

cpu.debug();

cpu.step();
cpu.debug();

cpu.step();
cpu.debug();

cpu.step();
cpu.debug();