.data

arr:    .word   11, 10, 9, 8, 7, 5
n:      .word   6


.text
.globl main
main:
li $t0, 0

        li $t1, 1
        lw $t3, n
        addi $t3, $t3, -1
        la $s2, arr

loop1:
        beq $t0, $t3, exit1		
                sub $s6, $t3, $t0
                li $t1, 0
                li $s0, 0
loop2:          beq $t1, $s6, exit2			
                        add $s3, $s0, $s2
			
                        lw $t5, 0($s3)			
                        lw $t6, 4($s3)

                        blt $t5, $t6, exit3
                                sw $t5, 4($s3)
                                sw $t6, 0($s3)			

exit3:                  addi $s0, $s0, 1
                        addi $t1, $t1, 1
                        j loop2

exit2:          addi $t0, $t0, 1
                j loop1

exit1:


-------------
[(ngModel)]="file"