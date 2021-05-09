# Titans

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.2.

To run

# Phase 1
This is a very basic version, so the assembly files that are uploaded should not contain tabs(i.e, \t). Instead use spaces(i.e, " ") only, instead of tabs.
All the operations that are needed to implement a bubble sort along with the specified ones are included. The operations are:
1. add, addi
2. sub, srl, sw
3. mul
4. div
5. bne, beq, blt
6. j
7. lw, la, li 

For the bubble sort, the output of an array is shown below the code editor.
The Assembly code for bubble sort is also uploaded with filename "bubble_sort".


# Phase 2
Implementation:
We maintained an array(named hazards) for storing the registers whose write back has not yet finished.

Assumptions/Considerations:
1. The write back stage is assumed to be completed in the first half of the clock cycle.
2. ID is done in 1st half and RF is done in 2nd half of clock cycle.
3. When an ID/RF fails it is taken as a stall only.
4. Data Forwarding is done from EX-MEM to EX, MEM-WB to EX.
5. For a branch/jump instruction, it is assumed to correct the PC value after the ID/RF stage. So, irrespective of the hazards/dependencies, there will always be a stall after every branch/jump instruction.

In case of no forwarding:
For every instruction, only next two instructions might cause hazards. So, for every instruction the registers, that are fetched, are checked for hazards, with the last two entries into the array.
A variety of combinations of instructions are analyzed and the stalls and extra clock cycles are added appropriately. 
Always the length of the hazards array is maintained as 2.

In case of data forwarding:
Consecutive arithmetic operations, even if dependencies are present, will not any cause stalls because of forwarding. The only problem is with the load/store/branch/jump instructions.

---> The results of the stalls, no. of clock cycles, no. of instructions executed and IPC is shown at the bottom.
---> Also the instructions where the stall occurs are outputted at the bottom.

# Phase 3
2 Levels of cache is implemented in this phase. Both the caches are implemented using LRU replacement policy. The cache is a non-inclusive cache i.e, while deleting the data from L1 and L2, it is independant of one another. If data is deleted in L1 does not mean to delete it from L2.
Implementation:
1. Two queues are maintained. One for L1 level and other for L2.
2. Whenever there is a cache miss in both L1 and L2, the data is brought from the memory and pushed into L1 and as well as L2 (i.e, both the arrays).
3. The Cache size, Block size, Associativity and Access Latency is taken as input and the number of stalls, miss rate are calculated accordingly.
4. The memory latency is fixed as 100 cycles (i.e, the number of cycles required to access a memory address when there is a cache miss).
5. When ever there is a store word(sw) operation, the data is written in all the caches as well as the memory.
6. When there is a cache hit in L1, it does not go to further levels.
7. If not found in L1 then it proceeds into L2, and it gets written in L1.

Note: For taking the input (eg: cache size, block size etc), there is a switch button provided in the registers section. By clicking, it will take the necessary information. Also the miss rate after execution is provided at the bottom.
https://github.com/vaibhav-gelle/titans/blob/master/Screenshot%20(676).png
https://github.com/vaibhav-gelle/titans/blob/master/Screenshot%20(677).png
https://github.com/vaibhav-gelle/titans/blob/master/Screenshot%20(678).png

---------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------

## Development server

The present code is modified so that we will be able to host it on heroku to see the web page go to https://titansapp.herokuapp.com/ . else
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
