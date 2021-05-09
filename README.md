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
2 Levels of cache is implemented in this phase. Both the caches are implemented using LRU replacement policy. The cache is an inclusive cache i.e, while bringing data from memory, it is kept in L1 level of cache and also L2 level of cache.

Implementation:
1. Two queues are maintained. One for L1 level and other for L2.
2. Whenever there is a cache miss in both L1 and L2, the data is brought from the memory and pushed into L1 and as well as L2 (i.e, both the arrays).
3. 

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
